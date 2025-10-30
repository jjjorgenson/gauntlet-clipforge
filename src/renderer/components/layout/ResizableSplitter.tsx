/**
 * ResizableSplitter Component
 * 
 * A draggable splitter component that allows users to resize panels.
 * Supports both horizontal (left/right) and vertical (top/bottom) splitting.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

export type SplitterOrientation = 'horizontal' | 'vertical';

export interface ResizableSplitterProps {
  /** Orientation of the splitter */
  orientation: SplitterOrientation;
  /** Current position of the splitter (percentage 0-100) */
  position: number;
  /** Callback when splitter is dragged */
  onResize: (newPosition: number) => void;
  /** Minimum position (percentage) */
  minPosition?: number;
  /** Maximum position (percentage) */
  maxPosition?: number;
  /** Optional class name for styling */
  className?: string;
  /** Optional disabled state */
  disabled?: boolean;
}

export const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  orientation,
  position,
  onResize,
  minPosition = 0,
  maxPosition = 100,
  className = '',
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate splitter handle size and cursor
  const handleSize = orientation === 'horizontal' ? 'w-1' : 'h-1';
  const cursor = disabled 
    ? 'default' 
    : orientation === 'horizontal' 
      ? 'col-resize' 
      : 'row-resize';

  // Handle mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    containerRef.current = splitterRef.current?.parentElement || null;

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = cursor;
  }, [disabled, cursor]);

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newPosition: number;
      
      if (orientation === 'horizontal') {
        // Horizontal splitter: calculate based on X position
        const mouseX = e.clientX - containerRect.left;
        newPosition = (mouseX / containerRect.width) * 100;
      } else {
        // Vertical splitter: calculate based on Y position
        const mouseY = e.clientY - containerRect.top;
        newPosition = (mouseY / containerRect.height) * 100;
      }

      // Apply min/max constraints
      newPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
      
      onResize(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      containerRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, orientation, minPosition, maxPosition, onResize]);

  // Handle hover state
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled && !isDragging) setIsHovered(false);
  }, [disabled, isDragging]);

  // Visual feedback classes
  const baseClasses = `
    ${handleSize}
    transition-colors duration-200
    ${disabled ? 'bg-gray-800 cursor-default' : 'bg-gray-600'}
    ${!disabled && isHovered ? 'bg-blue-500' : ''}
    ${!disabled && isDragging ? 'bg-blue-500' : ''}
    ${!disabled ? cursor : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={splitterRef}
      className={baseClasses}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Optional: Add visual indicator for better UX */}
      {!disabled && (isHovered || isDragging) && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            orientation === 'horizontal' ? 'flex-col' : 'flex-row'
          }`}
        >
          {orientation === 'horizontal' ? (
            <>
              <div className="w-0.5 h-3 bg-blue-300 rounded-full" />
              <div className="w-0.5 h-3 bg-blue-300 rounded-full mt-0.5" />
            </>
          ) : (
            <>
              <div className="h-0.5 w-3 bg-blue-300 rounded-full" />
              <div className="h-0.5 w-3 bg-blue-300 rounded-full ml-0.5" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

