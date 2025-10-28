/**
 * Slider Component - Range Slider with Draggable Thumb
 * 
 * A fully accessible range slider with draggable thumb,
 * click track to jump, and value tooltip on hover/drag.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Slider props interface
export interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Clamp value between min and max
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Calculate percentage for positioning
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Calculate value from position
  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return clampedValue;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const rawValue = min + percentage * (max - min);
    
    // Round to step
    return Math.round(rawValue / step) * step;
  }, [min, max, step, clampedValue]);

  // Handle mouse down on thumb
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setShowTooltip(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      onChange(newValue);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setShowTooltip(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle track click
  const handleTrackClick = (event: React.MouseEvent) => {
    if (disabled || isDragging) return;
    
    const newValue = getValueFromPosition(event.clientX);
    onChange(newValue);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    let newValue = clampedValue;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        newValue = Math.max(min, clampedValue - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        newValue = Math.min(max, clampedValue + step);
        break;
      case 'Home':
        event.preventDefault();
        newValue = min;
        break;
      case 'End':
        event.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }
    
    onChange(newValue);
  };

  // Handle focus/blur for tooltip
  const handleFocus = () => setShowTooltip(true);
  const handleBlur = () => setShowTooltip(false);

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Slider Track */}
      <div
        ref={sliderRef}
        onClick={handleTrackClick}
        className={`
          relative w-full h-2 bg-gray-700 rounded-full cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="slider"
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel || `Slider: ${clampedValue}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* Filled Track */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div
          ref={thumbRef}
          onMouseDown={handleMouseDown}
          className={`
            absolute top-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full
            transform -translate-y-1/2 cursor-grab active:cursor-grabbing
            transition-all duration-150 hover:scale-110
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging ? 'scale-110' : ''}
          `}
          style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
            style={{ left: `${percentage}%` }}
          >
            {clampedValue}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </div>
        )}
      </div>
    </div>
  );
};

// Export default
export default Slider;
