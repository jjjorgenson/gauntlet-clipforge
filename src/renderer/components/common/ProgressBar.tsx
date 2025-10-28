/**
 * ProgressBar Component - Animated Progress Bar
 * 
 * A fully accessible progress bar with animated fill transitions,
 * customizable colors, and optional percentage display.
 */

import React from 'react';

// Progress bar props interface
export interface ProgressBarProps {
  value: number; // 0-100
  showPercent?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

// Color styles mapping
const colorStyles: Record<NonNullable<ProgressBarProps['color']>, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500'
};

// Height styles mapping
const heightStyles: Record<NonNullable<ProgressBarProps['height']>, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showPercent = false,
  color = 'blue',
  height = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate percentage for display
  const percentage = Math.round(clampedValue);

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Progress Bar Container */}
      <div
        className={`
          w-full bg-gray-700 rounded-full overflow-hidden
          ${heightStyles[height]}
        `}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `Progress: ${percentage}%`}
      >
        {/* Progress Fill */}
        <div
          className={`
            h-full transition-all duration-500 ease-out
            ${colorStyles[color]}
          `}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      
      {/* Percentage Text */}
      {showPercent && (
        <div className="mt-1 text-sm text-gray-400 text-center">
          {percentage}%
        </div>
      )}
    </div>
  );
};

// Export default
export default ProgressBar;
