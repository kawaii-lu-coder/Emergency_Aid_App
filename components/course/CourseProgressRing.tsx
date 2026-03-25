'use client';

import { CourseProgressRingProps } from '@/lib/types/course';

export function CourseProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  showPercentage = true,
}: CourseProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (progress >= 100) return 'text-apple-mint';
    if (progress >= 50) return 'text-apple-blue';
    return 'text-apple-orange';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${getColor()} transition-all duration-500 ease-out`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {/* Percentage text */}
      {showPercentage && (
        <span className={`text-xs font-semibold ${getColor()}`}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
