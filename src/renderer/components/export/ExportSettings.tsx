/**
 * Export Settings Component
 * 
 * Configuration panel for export settings including output path,
 * resolution, FPS, codec, and quality presets.
 */

import React, { useState } from 'react';
import { Button } from '../common/Button';
import { QualityPreset } from './QualityPreset';
import { ExportComponentProps } from '../../../shared/contracts/components';
import { ExportConfig, ExportQuality, ExportCodec } from '../../../shared/types';

export const ExportSettings: React.FC<ExportComponentProps.ExportSettings> = ({
  config,
  onChange
}) => {
  const [isSelectingPath, setIsSelectingPath] = useState(false);

  // Quality presets
  const qualityPresets: Array<{ value: ExportQuality; label: string; description: string }> = [
    { value: 'low', label: 'Low', description: '720p, 2Mbps' },
    { value: 'medium', label: 'Medium', description: '1080p, 5Mbps' },
    { value: 'high', label: 'High', description: '1080p, 8Mbps' },
    { value: 'ultra', label: 'Ultra', description: '4K, 15Mbps' }
  ];

  // Resolution options
  const resolutionOptions = [
    { label: '720p (1280x720)', value: { width: 1280, height: 720 } },
    { label: '1080p (1920x1080)', value: { width: 1920, height: 1080 } },
    { label: '1440p (2560x1440)', value: { width: 2560, height: 1440 } },
    { label: '4K (3840x2160)', value: { width: 3840, height: 2160 } }
  ];

  // FPS options
  const fpsOptions = [
    { label: '24 FPS', value: 24 },
    { label: '30 FPS', value: 30 },
    { label: '60 FPS', value: 60 }
  ];

  // Codec options
  const codecOptions = [
    { label: 'H.264 (MP4)', value: 'h264' as ExportCodec },
    { label: 'H.265 (HEVC)', value: 'h265' as ExportCodec },
    { label: 'VP9 (WebM)', value: 'vp9' as ExportCodec }
  ];

  // Handle output path selection
  const handleSelectPath = () => {
    setIsSelectingPath(true);
    // For now, use a simple file input
    // In a real implementation, this would use the system save dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp4,.webm';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onChange({ outputPath: file.name });
      }
      setIsSelectingPath(false);
    };
    input.click();
  };

  // Handle quality preset selection
  const handleQualityPreset = (quality: ExportQuality) => {
    const presetConfigs = {
      low: {
        quality: 'low' as ExportQuality,
        resolution: { width: 1280, height: 720 },
        fps: 30,
        codec: 'h264' as ExportCodec,
        bitrate: '2000k'
      },
      medium: {
        quality: 'medium' as ExportQuality,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        codec: 'h264' as ExportCodec,
        bitrate: '5000k'
      },
      high: {
        quality: 'high' as ExportQuality,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        codec: 'h264' as ExportCodec,
        bitrate: '8000k'
      },
      ultra: {
        quality: 'ultra' as ExportQuality,
        resolution: { width: 3840, height: 2160 },
        fps: 30,
        codec: 'h265' as ExportCodec,
        bitrate: '15000k'
      }
    };

    onChange(presetConfigs[quality]);
  };

  // Handle resolution change
  const handleResolutionChange = (resolution: { width: number; height: number }) => {
    onChange({ resolution });
  };

  // Handle FPS change
  const handleFpsChange = (fps: number) => {
    onChange({ fps });
  };

  // Handle codec change
  const handleCodecChange = (codec: ExportCodec) => {
    onChange({ codec });
  };

  // Get current resolution label
  const getCurrentResolutionLabel = () => {
    const option = resolutionOptions.find(
      opt => opt.value.width === config.resolution.width && opt.value.height === config.resolution.height
    );
    return option?.label || `${config.resolution.width}x${config.resolution.height}`;
  };

  return (
    <div className="space-y-6">
      {/* Output Path */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Output Path
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={config.outputPath}
            onChange={(e) => onChange({ outputPath: e.target.value })}
            placeholder="Select output file location..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={handleSelectPath}
            disabled={isSelectingPath}
            variant="secondary"
            size="sm"
          >
            {isSelectingPath ? 'Selecting...' : 'Browse'}
          </Button>
        </div>
      </div>

      {/* Quality Presets */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Quality Preset
        </label>
        <div className="grid grid-cols-2 gap-2">
          {qualityPresets.map((preset) => (
            <QualityPreset
              key={preset.value}
              value={preset.value}
              label={preset.label}
              selected={config.quality === preset.value}
              onSelect={handleQualityPreset}
            />
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white border-b border-gray-700 pb-2">
          Advanced Settings
        </h3>

        {/* Resolution */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Resolution
          </label>
          <select
            value={JSON.stringify(config.resolution)}
            onChange={(e) => {
              const resolution = JSON.parse(e.target.value);
              handleResolutionChange(resolution);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {resolutionOptions.map(opt => (
              <option key={opt.label} value={JSON.stringify(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* FPS */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Frame Rate
          </label>
          <select
            value={config.fps}
            onChange={(e) => handleFpsChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fpsOptions.map(opt => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Codec */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Codec
          </label>
          <select
            value={config.codec}
            onChange={(e) => handleCodecChange(e.target.value as ExportCodec)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {codecOptions.map(opt => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">Export Summary</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Resolution:</span>
            <span>{config.resolution.width}x{config.resolution.height}</span>
          </div>
          <div className="flex justify-between">
            <span>Frame Rate:</span>
            <span>{config.fps} FPS</span>
          </div>
          <div className="flex justify-between">
            <span>Codec:</span>
            <span>{config.codec.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Quality:</span>
            <span className="capitalize">{config.quality}</span>
          </div>
        </div>
      </div>
    </div>
  );
};