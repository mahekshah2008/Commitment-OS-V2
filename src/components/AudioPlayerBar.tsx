import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Radio } from 'lucide-react';

interface AudioPlayerBarProps {
  currentSec: number;
  totalDurationSec: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (sec: number) => void;
  activeSegmentSpeaker?: string;
  activeSegmentText?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSec,
  totalDurationSec,
  isPlaying,
  onPlayPause,
  onSeek,
  activeSegmentSpeaker,
  activeSegmentText,
}) => {
  const [muted, setMuted] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className={`p-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
            title={isPlaying ? 'Pause Audio' : 'Play Audio Recording'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Restart Audio"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="text-xs font-mono text-slate-300">
            <span className="font-semibold text-amber-300">{formatTime(currentSec)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-slate-500">{formatTime(totalDurationSec)}</span>
          </div>
        </div>

        {/* Live Audio Visualizer Animation */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-0.5 h-4">
              {[40, 80, 50, 100, 60, 90, 45, 75].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <Radio className={`h-3 w-3 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
            <span className="hidden md:inline">Synced Audio Stream</span>
          </div>

          <button
            onClick={() => setMuted(!muted)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Seekbar */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={totalDurationSec || 60}
          step="0.5"
          value={currentSec}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
        />
      </div>

      {/* Active speaker subtitle preview */}
      {activeSegmentText && (
        <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 pt-0.5">
          <span className="font-semibold text-slate-300 shrink-0">{activeSegmentSpeaker}:</span>
          <span className="italic truncate">&ldquo;{activeSegmentText}&rdquo;</span>
        </div>
      )}
    </div>
  );
};
