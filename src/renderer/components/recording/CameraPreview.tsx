/**
 * CameraPreview Component
 * 
 * Webcam preview with toggle and position selector.
 * Uses getUserMedia() for webcam access and provides PiP overlay options.
 */

import React, { useState, useEffect, useRef } from 'react';

export interface CameraPreviewProps {
  isEnabled: boolean;
  stream: MediaStream | null;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export type CameraPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  isEnabled,
  stream,
  onToggle,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<CameraPosition>('bottom-right');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video source when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleToggle = async () => {
    if (disabled) return;

    if (isEnabled) {
      // Disable webcam
      onToggle(false);
    } else {
      // Enable webcam
      setIsLoading(true);
      setError(null);
      
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false
        });
        
        onToggle(true);
      } catch (error) {
        console.error('Failed to access webcam:', error);
        setError('Failed to access webcam. Please check permissions.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPositionClasses = (pos: CameraPosition) => {
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    };
    return positions[pos];
  };

  const getPositionLabel = (pos: CameraPosition) => {
    const labels = {
      'bottom-right': 'Bottom Right',
      'bottom-left': 'Bottom Left',
      'top-right': 'Top Right',
      'top-left': 'Top Left',
      'center': 'Center'
    };
    return labels[pos];
  };

  return (
    <div className="camera-preview">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Webcam Overlay</h3>
        <button
          onClick={handleToggle}
          disabled={disabled || isLoading}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </div>
          ) : isEnabled ? (
            'Disable Webcam'
          ) : (
            'Enable Webcam'
          )}
        </button>
      </div>

      {/* Preview Area */}
      <div className="relative bg-editor-panel rounded-lg overflow-hidden mb-4">
        {/* Main preview area */}
        <div className="aspect-video bg-black flex items-center justify-center">
          {isEnabled && stream ? (
            <div className="relative w-full h-full">
              {/* Main screen preview placeholder */}
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Screen Preview</p>
                  <p className="text-xs">Webcam will overlay here</p>
                </div>
              </div>

              {/* Webcam overlay preview */}
              <div className={`
                absolute w-32 h-24 border-2 border-blue-400 rounded-lg overflow-hidden
                ${getPositionClasses(position)}
                ${isExpanded ? 'w-48 h-36' : 'w-32 h-24'}
              `}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay indicator */}
                <div className="absolute top-1 left-1 bg-blue-500/80 text-white text-xs px-1 py-0.5 rounded">
                  CAM
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Webcam Preview</p>
              <p className="text-xs">Enable webcam to see preview</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center">
            <div className="text-center text-red-300">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isEnabled && (
        <div className="space-y-4">
          {/* Position Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overlay Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'] as CameraPosition[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  disabled={disabled}
                  className={`
                    px-3 py-2 text-xs rounded transition-colors
                    ${position === pos
                      ? 'bg-blue-600 text-white'
                      : 'bg-editor-panel text-gray-400 hover:text-white hover:bg-editor-hover'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {getPositionLabel(pos)}
                </button>
              ))}
            </div>
          </div>

          {/* Size Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Preview Size</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className={`
                px-3 py-1 text-xs rounded transition-colors
                ${isExpanded
                  ? 'bg-blue-600 text-white'
                  : 'bg-editor-panel text-gray-400 hover:text-white hover:bg-editor-hover'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isExpanded ? 'Large' : 'Small'}
            </button>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-4 p-3 bg-editor-panel rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-400">
            <p className="font-medium text-blue-400 mb-1">Webcam Overlay:</p>
            <ul className="space-y-1 text-xs">
              <li>• Optional webcam feed overlaid on screen recording</li>
              <li>• Choose position and size for the overlay</li>
              <li>• Useful for tutorials, presentations, or vlogs</li>
              <li>• Webcam will appear as Picture-in-Picture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
