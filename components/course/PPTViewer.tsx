'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { PPTViewerProps, SaveProgressRequest } from '@/lib/types/course';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function PPTViewer({
  slides,
  courseId,
  stage,
  initialPage = 0,
  onProgressUpdate,
  onComplete,
}: PPTViewerProps & { onComplete?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialPage);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalSlides) * 100);
  const isCompleted = progressPercent >= 95 || currentIndex === totalSlides - 1;

  // Save progress
  const saveProgress = useCallback(async (page: number) => {
    const percent = Math.round(((page + 1) / totalSlides) * 100);
    const completed = percent >= 95 || page === totalSlides - 1;
    
    try {
      const response = await fetch(`/api/stage/${stage}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          last_position: page,
          progress_percent: percent,
          is_completed: completed,
        } as SaveProgressRequest),
      });

      if (!response.ok) {
        console.error('Failed to save progress:', await response.text());
      } else {
        onProgressUpdate?.(percent, completed);
        if (completed) {
          onComplete?.();
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [courseId, stage, totalSlides, onProgressUpdate, onComplete]);

  const debouncedSave = useDebounce(saveProgress, 3000);

  // Navigate to slide
  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      debouncedSave(newIndex);
      // Reset zoom and position when changing slides
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex, totalSlides, debouncedSave]);

  const nextSlide = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Escape') {
        if (scale !== 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, scale]);

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.max(0.5, Math.min(3, s + delta)));
    }
  }, []);

  const handleDoubleClick = () => {
    if (scale !== 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(1.5);
    }
  };

  // Drag handlers for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch/swipe handlers
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const dx = touchStart.current.x - e.touches[0].clientX;
    const dy = touchStart.current.y - e.touches[0].clientY;

    // Horizontal swipe for navigation (only when not zoomed)
    if (Math.abs(dx) > Math.abs(dy) && scale === 1) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    
    // Swipe threshold
    if (Math.abs(dx) > 50 && scale === 1) {
      if (dx > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    touchStart.current = null;
  };

  // Download single slide
  const downloadSlide = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, `slide-${String(index + 1).padStart(3, '0')}.png`);
    } catch (err) {
      alert('Download failed. Please try again.');
    }
  };

  // Download all slides as ZIP
  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder('course-ppt');
    
    try {
      const promises = slides.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        folder?.file(`slide-${String(index + 1).padStart(3, '0')}.png`, blob);
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'course-ppt.zip');
    } catch (err) {
      alert('Failed to create ZIP archive.');
    }
  };

  // Save progress on unmount
  useEffect(() => {
    return () => {
      saveProgress(currentIndex);
    };
  }, [currentIndex, saveProgress]);

  // Send beacon on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const data = JSON.stringify({
        course_id: courseId,
        last_position: currentIndex,
        progress_percent: progressPercent,
        is_completed: isCompleted,
      });
      navigator.sendBeacon(`/api/stage/${stage}/courses/progress`, data);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [courseId, stage, currentIndex, progressPercent, isCompleted]);

  return (
    <div className="flex flex-col h-[600px] bg-apple-bg-secondary rounded-3xl overflow-hidden border border-apple-border/50">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-apple-border/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-apple-text">
            {currentIndex + 1} <span className="text-apple-text-secondary">/ {totalSlides}</span>
          </span>
          <div className="h-1.5 w-20 sm:w-32 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apple-blue rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-apple-text-secondary">{progressPercent}%</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
              disabled={scale <= 0.5}
              className="w-7 h-7 rounded-md flex items-center justify-center text-apple-text
                        transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-apple-text w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(3, s + 0.25))}
              disabled={scale >= 3}
              className="w-7 h-7 rounded-md flex items-center justify-center text-apple-text
                        transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          
          {/* Download button */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-3 py-1.5 bg-apple-blue text-white rounded-full text-sm font-medium
                        transition-all hover:bg-apple-blue-hover active:scale-95 flex items-center gap-1.5"
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            
            {showDownloadMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDownloadMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl 
                              p-1.5 min-w-[160px] z-50 border border-apple-border/30">
                  <button
                    onClick={() => {
                      downloadSlide(slides[currentIndex], currentIndex);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-left text-apple-text
                              transition-colors hover:bg-apple-bg-secondary"
                  >
                    Download Current Page
                  </button>
                  <button
                    onClick={() => {
                      downloadAll();
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-left text-apple-text
                              transition-colors hover:bg-apple-bg-secondary"
                  >
                    Download All (ZIP)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Slide viewport */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gray-50/50"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              ref={slideRef}
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: position.x,
                scale,
              }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              onDoubleClick={handleDoubleClick}
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-white cursor-grab active:cursor-grabbing"
              style={{
                y: position.y,
              }}
            >
              <img 
                src={slides[currentIndex]} 
                alt={`Slide ${currentIndex + 1}`}
                className="max-w-full max-h-[400px] w-auto h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 
                    rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center
                    transition-all hover:scale-110 hover:shadow-xl active:scale-95
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-apple-text" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentIndex === totalSlides - 1}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 
                    rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center
                    transition-all hover:scale-110 hover:shadow-xl active:scale-95
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-apple-text" />
        </button>
        
        {/* Zoom hint */}
        {scale === 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 
                        backdrop-blur rounded-full text-white/90 text-xs pointer-events-none">
            Ctrl+Scroll to zoom • Double-click to magnify
          </div>
        )}
      </div>
      
      {/* Bottom thumbnail dock */}
      <div className="bg-white/80 backdrop-blur-md border-t border-apple-border/30 p-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-200
                        ${index === currentIndex 
                          ? 'ring-2 ring-apple-blue ring-offset-2 scale-105' 
                          : 'opacity-50 hover:opacity-80'}`}
            >
              <img 
                src={slide} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-16 h-11 sm:w-20 sm:h-14 object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-apple-blue/10" />
              )}
              <span className="absolute bottom-0.5 right-0.5 text-[9px] font-medium 
                             text-white bg-black/60 px-1 rounded">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icon components
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
