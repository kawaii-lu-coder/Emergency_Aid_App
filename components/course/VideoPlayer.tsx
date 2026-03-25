'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { VideoPlayerProps, SaveProgressRequest } from '@/lib/types/course';

export function VideoPlayer({
  src,
  courseId,
  stage,
  initialProgress = 0,
  duration,
  onProgressUpdate,
  onComplete,
}: VideoPlayerProps & { onComplete?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(initialProgress);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save progress to server
  const saveProgress = useCallback(async (currentTime: number, percent: number, completed: boolean = false) => {
    try {
      const response = await fetch(`/api/stage/${stage}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          last_position: currentTime,
          progress_percent: Math.round(percent),
          is_completed: completed || percent >= 95,
        } as SaveProgressRequest),
      });

      if (!response.ok) {
        console.error('Failed to save progress:', await response.text());
      } else {
        const data = await response.json();
        if (data.is_completed || completed) {
          onComplete?.();
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [courseId, stage, onComplete]);

  // Debounced progress save (every 5 seconds)
  const debouncedSave = useDebounce((time: number) => {
    const percent = Math.min((time / duration) * 100, 100);
    saveProgress(time, percent, percent >= 95);
  }, 5000);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    setCurrentTimeDisplay(currentTime);
    
    const percent = Math.min((currentTime / duration) * 100, 100);
    onProgressUpdate?.(percent, percent >= 95);

    // Auto-complete at 95%
    if (percent >= 95) {
      saveProgress(currentTime, 100, true);
      return;
    }

    debouncedSave(currentTime);
  }, [duration, onProgressUpdate, saveProgress, debouncedSave]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Seek forward/backward
  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  }, [duration]);

  // Handle seek via progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTimeDisplay(newTime);
  };

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Fallback to fake fullscreen
      if (!isFullscreen) {
        container.classList.add('fixed', 'inset-0', 'z-50', 'rounded-none');
        setIsFullscreen(true);
      } else {
        container.classList.remove('fixed', 'inset-0', 'z-50', 'rounded-none');
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  // Change playback rate
  const handleRateChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(5);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'escape':
          if (isFullscreen && !document.fullscreenElement) {
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, toggleFullscreen, toggleMute, isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Set initial time when video is ready
  useEffect(() => {
    const video = videoRef.current;
    if (video && !isReady) {
      video.currentTime = initialProgress;
      setIsReady(true);
    }
  }, [initialProgress, isReady]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        const percent = Math.min((video.currentTime / duration) * 100, 100);
        saveProgress(video.currentTime, percent);
      }
    };
  }, [duration, saveProgress]);

  // Send beacon on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const video = videoRef.current;
      if (video) {
        const data = JSON.stringify({
          course_id: courseId,
          last_position: video.currentTime,
          progress_percent: Math.round(Math.min((video.currentTime / duration) * 100, 100)),
          is_completed: video.currentTime / duration >= 0.95,
        });
        navigator.sendBeacon(`/api/stage/${stage}/courses/progress`, data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [courseId, stage, duration]);

  const playbackRates = [0.5, 1, 1.25, 1.5, 2];
  const progressPercent = (currentTimeDisplay / duration) * 100;

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-3xl overflow-hidden group select-none"
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          saveProgress(duration, 100, true);
          onComplete?.();
        }}
        onDoubleClick={toggleFullscreen}
      />
      
      {/* Big play button (shows when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center
                          shadow-apple-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <PlayIcon className="w-10 h-10 text-apple-text ml-1" />
          </div>
        </button>
      )}
      
      {/* Controls overlay */}
      <div className={`absolute inset-x-0 bottom-0 transition-all duration-300 
                      ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress gradient */}
        <div className="h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTimeDisplay}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              style={{
                background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`
              }}
            />
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center
                        text-white transition-all duration-200 hover:bg-white/30 hover:scale-105 active:scale-95"
            >
              {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
            </button>
            
            {/* Time */}
            <span className="text-white text-sm font-medium tabular-nums">
              {formatTime(currentTimeDisplay)} / {formatTime(duration)}
            </span>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/90
                          transition-colors hover:text-white hover:bg-white/10"
              >
                {isMuted || volume === 0 ? <MuteIcon className="w-4 h-4" /> : <VolumeIcon className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                          transition-all duration-200 [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
            
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium
                          transition-colors hover:bg-white/30 min-w-[60px]"
              >
                {playbackRate}x
              </button>
              
              {/* Speed menu */}
              {showSpeedMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl 
                                p-1.5 min-w-[100px] z-50">
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleRateChange(rate)}
                        className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                                  ${playbackRate === rate 
                                    ? 'bg-apple-blue text-white' 
                                    : 'text-gray-800 hover:bg-gray-100'}`}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/90
                        transition-colors hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className={`absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 
                      text-white/80 text-xs transition-opacity duration-300
                      ${showControls ? 'opacity-0' : 'group-hover:opacity-100'}`}>
        Press ? for shortcuts
      </div>
    </div>
  );
}

// Icon components
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const VolumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const MuteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const MaximizeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
  </svg>
);

const MinimizeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
  </svg>
);

// Utility function
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
