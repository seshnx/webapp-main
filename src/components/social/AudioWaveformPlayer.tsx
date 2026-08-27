import React from 'react';
import StarFieldVisualizer from '../shared/StarFieldVisualizer';

interface AudioWaveformPlayerProps {
  audioUrl: string;
  title?: string;
  bpm?: number;
  keySignature?: string;
  gearUsed?: string[];
  previewMode?: boolean;
}

export default function AudioWaveformPlayer({
  audioUrl,
  title = 'Audio Track Preview',
  bpm,
  keySignature,
  gearUsed = [],
  previewMode = false
}: AudioWaveformPlayerProps) {
  return (
    <div className="w-full my-3 space-y-2">
      {/* StarFieldVisualizer Waveform & Canvas Player */}
      <StarFieldVisualizer
        audioUrl={audioUrl}
        fileName={title}
        previewMode={previewMode}
      />

      {/* Track Metadata Badges */}
      {(bpm || keySignature || gearUsed.length > 0) && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {bpm && (
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono px-2 py-0.5 rounded-md font-bold">
                {bpm} BPM
              </span>
            )}
            {keySignature && (
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono px-2 py-0.5 rounded-md font-bold">
                Key: {keySignature}
              </span>
            )}
          </div>

          {gearUsed.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {gearUsed.slice(0, 3).map((gear, i) => (
                <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-brand-blue border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-medium">
                  🎛️ {gear}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
