/**
 * Quality Preset Component
 * 
 * Individual quality preset button with visual indication
 * of selection and preset details.
 */

import React from 'react';
import { ExportComponentProps } from '../../../shared/contracts/components';

export const QualityPreset: React.FC<ExportComponentProps.QualityPreset> = ({
  value,
  label,
  selected,
  onSelect
}) => {
  // Preset configurations for display
  const presetConfigs = {
    low: {
      color: 'bg-red-500',
      description: '720p • 2Mbps',
      icon: '📱'
    },
    medium: {
      color: 'bg-yellow-500',
      description: '1080p • 5Mbps',
      icon: '💻'
    },
    high: {
      color: 'bg-blue-500',
      description: '1080p • 8Mbps',
      icon: '🖥️'
    },
    ultra: {
      color: 'bg-purple-500',
      description: '4K • 15Mbps',
      icon: '🎬'
    }
  };

  const config = presetConfigs[value];

  return (
    <button
      onClick={() => onSelect(value)}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${selected 
          ? 'border-blue-400 bg-blue-500/20' 
          : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}

      {/* Preset content */}
      <div className="text-center">
        {/* Icon */}
        <div className="text-2xl mb-2">{config.icon}</div>
        
        {/* Label */}
        <div className="text-white font-medium mb-1">{label}</div>
        
        {/* Description */}
        <div className="text-xs text-gray-400">{config.description}</div>
      </div>

      {/* Quality indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden">
        <div className={`h-full ${config.color} opacity-60`} />
      </div>
    </button>
  );
};
