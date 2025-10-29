/**
 * Playback Controls Component
 *
 * Custom playback controls with play/pause, time display, scrub bar, volume, and fullscreen.
 * Uses Slider and Button components from common/.
 */

import React, { useState } from 'react';
import { VideoPreviewComponentProps } from '../../../shared/contracts/components';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { formatDuration } from '../../utils/formatUtils';

export const PlaybackControls: React.FC<VideoPreviewComponentProps.PlaybackControls> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
}) => {
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(currentTime);

  // Update seek value when currentTime changes (but not while seeking)
  React.useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
    setIsSeeking(true);
  };

  const handleSeekEnd = (value: number) => {
    setIsSeeking(false);
    onSeek(value);
  };

  // Handle mouse up to end seeking
  const handleMouseUp = () => {
    if (isSeeking) {
      handleSeekEnd(seekValue);
    }
  };

  const handleVolumeToggle = () => {
    setIsVolumeExpanded(!isVolumeExpanded);
  };

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
  };

  const handleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 1);
  };

  const handleStepBackward = () => {
    onSeek(Math.max(0, currentTime - 5));
  };

  const handleStepForward = () => {
    onSeek(Math.min(duration, currentTime + 5));
  };

  return (
    <div className="playback-controls bg-editor-panel border border-editor-border rounded-lg p-4">
      {/* Main Controls Row */}
      <div className="flex items-center gap-4 mb-3">
        {/* Play/Pause Button */}
        <Button
          onClick={onPlayPause}
          variant="primary"
          size="sm"
          className="flex-shrink-0"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </Button>

        {/* Step Backward */}
        <Button
          onClick={handleStepBackward}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Button>

        {/* Step Forward */}
        <Button
          onClick={handleStepForward}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>

        {/* Time Display */}
        <div className="flex-shrink-0 text-sm text-gray-300 font-mono">
          {formatDuration(isSeeking ? seekValue : currentTime)} / {formatDuration(duration)}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume Control */}
        <div className="relative flex-shrink-0">
          <Button
            onClick={handleVolumeToggle}
            variant="secondary"
            size="sm"
          >
            {volume === 0 ? (
              // Muted icon (speaker with X)
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : volume < 0.5 ? (
              // Low volume icon (speaker with 1 wave) - grey
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1 1 0 00-1.707-.707L4.586 6.5H2a1 1 0 00-1 1v5a1 1 0 001 1h2.586l3.707 3.707A1 1 0 0010 16.5v-13zM13.536 8.464a1 1 0 011.414 0 3 3 0 010 4.243 1 1 0 01-1.414-1.414 1 1 0 000-1.414 1 1 0 010-1.415z" />
              </svg>
            ) : (
              // High volume icon (speaker with 2 waves) - grey
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1 1 0 00-1.707-.707L4.586 6.5H2a1 1 0 00-1 1v5a1 1 0 001 1h2.586l3.707 3.707A1 1 0 0010 16.5v-13zM15.95 5.879a1 1 0 011.414 0A7 7 0 0118 10a7 7 0 01-.636 4.121 1 1 0 11-1.828-.758A5 5 0 0016 10a5 5 0 00-.464-3.363 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A3 3 0 0115 10a3 3 0 01-.464 1.414 1 1 0 11-1.414-1.414.983.983 0 00.242-.707.983.983 0 00-.242-.707 1 1 0 010-1.414z" />
              </svg>
            )}
          </Button>

          {/* Volume Slider */}
          {isVolumeExpanded && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-editor-bg border border-editor-border rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleMute}
                  variant="secondary"
                  size="sm"
                >
                  {volume === 0 ? '🔇' : '🔊'}
                </Button>
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={handleVolumeChange}
                  className="w-20"
                  showTooltip={false}
                />
                <span className="text-xs text-gray-400 w-8 text-center">
                  {Math.round(volume * 100)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <Button
          onClick={onFullscreen}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>

      {/* Scrub Bar */}
      <div className="flex items-center gap-2" onMouseUp={handleMouseUp}>
        <span className="text-xs text-gray-400 w-12 text-right">
          {formatDuration(0)}
        </span>
        <Slider
          value={isSeeking ? seekValue : currentTime}
          min={0}
          max={duration}
          step={0.1}
          onChange={handleSeekChange}
          className="flex-1"
        />
        <span className="text-xs text-gray-400 w-12 text-left">
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};
