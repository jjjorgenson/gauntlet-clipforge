/**
 * Root React Component
 */

import React from 'react';

export const App: React.FC = () => {
  // Access the temporary API from preload script
  const versions = (window as any).api?._versions;
  const platform = (window as any).api?._platform;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎬 ClipForge</h1>
        <p className="text-xl text-gray-400 mb-8">
          Desktop Video Editor - Ready to Build!
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          
          {versions ? (
            <div className="space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Electron:</span>
                <span className="font-mono">{versions.electron}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Node.js:</span>
                <span className="font-mono">{versions.node}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chrome:</span>
                <span className="font-mono">{versions.chrome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform:</span>
                <span className="font-mono">{platform}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-400">Preload API not available</p>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>✅ TypeScript configured</p>
          <p>✅ Electron main process running</p>
          <p>✅ React renderer loaded</p>
          <p>✅ Tailwind CSS working</p>
          <p>✅ Contracts ready for Track 1</p>
        </div>
      </div>
    </div>
  );
};

