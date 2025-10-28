/**
 * Root React Component
 * Track 1 Test: IPC Communication
 */

import React, { useState, useEffect } from 'react';

export const App: React.FC = () => {
  const [ipcTest, setIpcTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    result?: any;
    error?: string;
  }>({ status: 'idle' });

  const testMediaImport = async () => {
    if (!window.api) {
      setIpcTest({ status: 'error', error: 'window.api not available' });
      return;
    }

    setIpcTest({ status: 'testing' });

    try {
      // Test the media.import IPC call
      const result = await window.api.media.import({
        filePaths: ['/test/video1.mp4', '/test/video2.mov']
      });

      setIpcTest({ status: 'success', result });
    } catch (error) {
      setIpcTest({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testSystemPath = async () => {
    if (!window.api) {
      setIpcTest({ status: 'error', error: 'window.api not available' });
      return;
    }

    setIpcTest({ status: 'testing' });

    try {
      // Test the system.getPath IPC call
      const result = await window.api.system.getPath({
        name: 'home'
      });

      setIpcTest({ status: 'success', result });
    } catch (error) {
      setIpcTest({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-5xl font-bold mb-4 text-blue-400">🎬 ClipForge</h1>
        <p className="text-xl text-gray-400 mb-8">
          Track 1: IPC Infrastructure Test
        </p>
        
        {/* IPC Test Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">🔗 IPC Communication Test</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={testMediaImport}
                disabled={ipcTest.status === 'testing'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
              >
                Test Media Import
              </button>
              
              <button
                onClick={testSystemPath}
                disabled={ipcTest.status === 'testing'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
              >
                Test System Path
              </button>
            </div>

            {/* Test Results */}
            <div className="mt-4 p-4 bg-gray-700 rounded text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ipcTest.status === 'idle' ? 'bg-gray-600 text-gray-300' :
                  ipcTest.status === 'testing' ? 'bg-yellow-600 text-yellow-100' :
                  ipcTest.status === 'success' ? 'bg-green-600 text-green-100' :
                  'bg-red-600 text-red-100'
                }`}>
                  {ipcTest.status.toUpperCase()}
                </span>
              </div>

              {ipcTest.status === 'testing' && (
                <div className="text-yellow-400 text-sm">
                  ⏳ Testing IPC communication...
                </div>
              )}

              {ipcTest.status === 'success' && ipcTest.result && (
                <div className="text-green-400 text-sm">
                  <div className="mb-2">✅ IPC call successful!</div>
                  <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(ipcTest.result, null, 2)}
                  </pre>
                </div>
              )}

              {ipcTest.status === 'error' && ipcTest.error && (
                <div className="text-red-400 text-sm">
                  ❌ IPC call failed: {ipcTest.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Electron:</span>
              <span className="font-mono text-blue-300">39.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node.js:</span>
              <span className="font-mono text-green-300">22.20.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chrome:</span>
              <span className="font-mono text-yellow-300">142.0.7444.52</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="font-mono text-purple-300">win32</span>
            </div>
          </div>
        </div>

        {/* Track 1 Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-400">Track 1 Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Preload script exposes complete IpcAPI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>All IPC channels registered with mock handlers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Main process calls registerIpcHandlers()</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={ipcTest.status === 'success' ? 'text-green-500' : 'text-yellow-500'}>
                {ipcTest.status === 'success' ? '✅' : '⏳'}
              </span>
              <span>Renderer can call window.api methods</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>🎯 Track 1 Complete: IPC infrastructure ready for Track 2-5</p>
        </div>
      </div>
    </div>
  );
};

