/**
 * SourceSelector Component
 * 
 * Grid of available recording sources (screens/windows).
 * Fetches sources from window.api.recording.getSources() and shows thumbnails.
 */

import React, { useState, useEffect } from 'react';
import { RecordingSource } from '../../../shared/types';

export interface SourceSelectorProps {
  selectedSource: RecordingSource | null;
  onSourceSelect: (source: RecordingSource) => void;
  disabled?: boolean;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  selectedSource,
  onSourceSelect,
  disabled = false,
}) => {
  const [sources, setSources] = useState<RecordingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sources on mount
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('🔴 STEP 3: Dialog opened, loading sources...');
    loadSources();
  }, []);

  const loadSources = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 STEP 3A: Calling window.api.recording.getSources...');
      console.log('API check:', {
        hasWindowApi: !!window.api,
        hasRecording: !!window.api?.recording,
        hasGetSources: !!window.api?.recording?.getSources
      });
      
      const result = await window.api.recording.getSources({
        types: ['screen', 'window']
      });
      
      console.log('✅ STEP 3C: Sources loaded:', result.sources.length);
      console.log('Sources:', result.sources.map((s: RecordingSource) => ({
        id: s.id.substring(0, 20),
        name: s.name,
        type: s.type
      })));
      
      setSources(result.sources);
      console.log('✅ STEP 3 COMPLETE: Sources set in state');
      
      // Auto-select first source if none selected
      if (!selectedSource && result.sources.length > 0) {
        console.log('🎯 Auto-selecting first source:', result.sources[0].name);
        onSourceSelect(result.sources[0]);
      }
      
    } catch (error) {
      console.error('❌ STEP 3 FAILED: Failed to load recording sources:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      setError('Failed to load recording sources. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
    
    console.log('═══════════════════════════════════════');
  };

  const handleSourceSelect = (source: RecordingSource) => {
    if (!disabled) {
      onSourceSelect(source);
    }
  };

  const getSourceIcon = (source: RecordingSource) => {
    if (source.type === 'screen') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const getSourceTypeLabel = (source: RecordingSource) => {
    return source.type === 'screen' ? 'Screen' : 'Window';
  };

  if (isLoading) {
    return (
      <div className="source-selector">
        <h3 className="text-lg font-medium text-white mb-4">Select Source</h3>
        <div className="flex items-center justify-center h-48 bg-editor-panel rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-gray-400">Loading sources...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="source-selector">
        <h3 className="text-lg font-medium text-white mb-4">Select Source</h3>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 font-medium">Error Loading Sources</span>
          </div>
          <p className="text-red-300 text-sm mb-3">{error}</p>
          <button
            onClick={loadSources}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="source-selector">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Select Source</h3>
        <button
          onClick={loadSources}
          disabled={disabled}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Refresh sources"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="bg-editor-panel rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 mb-2">No sources available</p>
          <p className="text-gray-500 text-sm">Make sure you have windows open or screens available</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {sources.map((source) => (
              <div
                key={source.id}
                onClick={() => handleSourceSelect(source)}
                className={`
                  relative p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedSource?.id === source.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-editor-border bg-editor-panel hover:border-editor-hover'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-editor-hover'}
                `}
              >
                {/* Selection indicator */}
                {selectedSource?.id === source.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {/* Thumbnail */}
                  <div className="w-full">
                    <img
                      src={source.thumbnail}
                      alt={source.name}
                      className="w-full h-20 object-cover rounded border border-editor-border"
                      onError={(e) => {
                        // Fallback to icon if thumbnail fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-20 bg-editor-panel border border-editor-border rounded flex items-center justify-center text-gray-500">
                              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${source.type === 'screen' 
                                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
                                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
                                }
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>

                  {/* Source info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-1">
                      <span className="text-white font-medium text-sm truncate">
                        {source.name}
                      </span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full self-start
                        ${source.type === 'screen' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                        }
                      `}>
                        {getSourceTypeLabel(source)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            <p className="font-medium text-blue-400 mb-1">Recording Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Select a screen or window to record</li>
              <li>• Screen captures the entire display</li>
              <li>• Window captures a specific application</li>
              <li>• Click refresh if sources don't appear</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
