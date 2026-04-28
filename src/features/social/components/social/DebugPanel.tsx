import React, { useState, useEffect } from 'react';
import { X, Bug, Trash2, Download, RefreshCw } from 'lucide-react';
import { getDebugStats, printDebugSummary, clearDebugLogs, setDebugMode } from '@/utils/socialDebug';

export default function SocialDebugPanel() {
  const [stats, setStats] = useState(getDebugStats());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getDebugStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(stats, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-debug-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          title="Open Debug Panel"
        >
          <Bug size={20} />
        </button>
      ) : (
        <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bug size={18} />
              <span className="font-bold">Social Debug Panel</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400">STATUS</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`px-2 py-1 rounded ${stats.enabled ? 'bg-green-600' : 'bg-gray-700'}`}>
                  Debug: {stats.enabled ? 'ON' : 'OFF'}
                </div>
                <div className={`px-2 py-1 rounded ${stats.mongoAvailable ? 'bg-green-600' : 'bg-red-600'}`}>
                  Mongo: {stats.mongoAvailable ? 'OK' : 'ERR'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400">STATISTICS</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>API Calls:</span>
                  <span className="font-mono">{stats.summary.totalApiCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-mono text-red-400">{stats.summary.failedApiCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span className="font-mono">{stats.summary.avgApiDuration.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className="font-mono text-red-400">{stats.summary.totalErrors}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            {stats.performanceMetrics.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">PERFORMANCE</h3>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                  {stats.performanceMetrics.slice(0, 10).map((metric, idx) => (
                    <div key={idx} className="flex justify-between font-mono">
                      <span className="truncate mr-2">{metric.name}</span>
                      <span className={metric.duration! > 1000 ? 'text-red-400' : 'text-green-400'}>
                        {metric.duration?.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Errors */}
            {stats.errorLog.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">RECENT ERRORS</h3>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                  {stats.errorLog.slice(-5).map((entry, idx) => (
                    <div key={idx} className="bg-red-900/50 p-2 rounded">
                      <div className="text-red-400">{entry.context}</div>
                      <div className="text-gray-400 truncate">{entry.error?.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => printDebugSummary()}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
              >
                <RefreshCw size={14} />
                Print
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={() => setDebugMode(!stats.enabled)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm ${
                  stats.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {stats.enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => clearDebugLogs()}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
