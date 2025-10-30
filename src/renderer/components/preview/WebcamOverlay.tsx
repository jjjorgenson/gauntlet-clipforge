/**
 * Webcam Overlay Component
 * 
 * Draggable and resizable webcam overlay for video preview.
 * Position and size persist per-project.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useWebcamStore } from '../../store/webcamStore';

export interface WebcamOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({ containerRef }) => {
  const {
    isEnabled,
    stream,
    position,
    size,
    isDragging,
    isResizing,
    setPosition,
    setSize,
    setDragging,
    setResizing,
    error
  } = useWebcamStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ 
    x: number; 
    y: number; 
    width: number; 
    height: number 
  } | null>(null);

  // Setup video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Failed to play webcam stream:', err);
      });
    }
  }, [stream]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on resize handle
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragging(true);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    setResizing(true);
  };

  // Handle mouse move (drag or resize)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      // Handle dragging
      if (isDragging && dragStart) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert pixel delta to percentage
        const deltaXPercent = (deltaX / containerRect.width) * 100;
        const deltaYPercent = (deltaY / containerRect.height) * 100;

        const newX = Math.max(0, Math.min(100 - size.width, position.x + deltaXPercent));
        const newY = Math.max(0, Math.min(100 - size.height, position.y + deltaYPercent));

        setPosition({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }

      // Handle resizing
      if (isResizing && resizeStart) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        // Convert pixel delta to percentage
        const deltaWidthPercent = (deltaX / containerRect.width) * 100;
        const deltaHeightPercent = (deltaY / containerRect.height) * 100;

        // Maintain 4:3 aspect ratio
        const newWidth = Math.max(5, Math.min(50, resizeStart.width + deltaWidthPercent));
        const newHeight = (newWidth * 3) / 4; // 4:3 aspect ratio

        // Ensure doesn't go out of bounds
        const maxWidth = 100 - position.x;
        const maxHeight = 100 - position.y;
        
        const finalWidth = Math.min(newWidth, maxWidth);
        const finalHeight = Math.min(newHeight, maxHeight);

        setSize({ width: finalWidth, height: finalHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setDragging(false);
        setDragStart(null);
      }
      if (isResizing) {
        setResizing(false);
        setResizeStart(null);
      }
    };

    // Always add/remove listeners to maintain hook consistency
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Always return cleanup function (required by Rules of Hooks)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, position, size, containerRef, setPosition, setSize, setDragging, setResizing]);

  // Don't render if not enabled (MUST be after all hooks)
  if (!isEnabled || !stream) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={`webcam-overlay ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size.width}%`,
        aspectRatio: '4 / 3', // Force 4:3 aspect ratio to match webcam feed (ignore height percentage)
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: '2px solid rgba(59, 130, 246, 0.8)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        backgroundColor: '#000',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video element with mirrored display */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Fill container completely (container is 4:3, matching webcam)
          transform: 'scaleX(-1)', // Mirror horizontally
          pointerEvents: 'none'
        }}
      />

      {/* Visual indicators */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            animation: 'pulse 2s infinite'
          }}
        />
        <span style={{ 
          color: 'white', 
          fontSize: '11px', 
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Webcam
        </span>
      </div>

      {/* Resize handle (bottom-right corner) */}
      <div
        className="resize-handle"
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '20px',
          height: '20px',
          cursor: 'nwse-resize',
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderTopLeftRadius: '4px',
          opacity: 0,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.currentTarget.style.opacity = '0';
          }
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px'
          }}
        >
          <path
            d="M 16 4 L 4 16 M 20 8 L 8 20 M 20 12 L 12 20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            textAlign: 'center',
            maxWidth: '90%',
            pointerEvents: 'none'
          }}
        >
          {error}
        </div>
      )}

      {/* Pulse animation for recording indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .webcam-overlay:hover {
          border-color: rgba(59, 130, 246, 1);
        }
        
        .webcam-overlay.dragging,
        .webcam-overlay.resizing {
          border-color: rgba(34, 197, 94, 0.8);
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
        }
        
        .webcam-overlay:hover .resize-handle {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

