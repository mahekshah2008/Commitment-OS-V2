import React, { useState } from 'react';
import { TranscriptSegment } from '../utils/types';
import { AudioPlayerBar } from './AudioPlayerBar';
import { 
  Users, 
  Search, 
  Play, 
  Sparkles, 
  Clock, 
  FileEdit, 
  ListFilter,
  CheckCircle2,
  X
} from 'lucide-react';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  onUpdateSpeaker: (oldName: string, newName: string) => void;
  activeEvidenceText?: string;
  onSelectEvidence?: (text: string) => void;
  currentAudioSec: number;
  totalDurationSec: number;
  isPlayingAudio: boolean;
  onPlayPauseAudio: () => void;
  onSeekAudio: (sec: number) => void;
  onToast: (msg: string) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  onUpdateSpeaker,
  activeEvidenceText,
  onSelectEvidence,
  currentAudioSec,
  totalDurationSec,
  isPlayingAudio,
  onPlayPauseAudio,
  onSeekAudio,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [tempSpeakerName, setTempSpeakerName] = useState('');

  // Find currently active segment according to audio playhead
  const activeSegment = segments.find(
    s => currentAudioSec >= s.startSec && currentAudioSec <= s.endSec
  );

  const filteredSegments = segments.filter(seg => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      seg.speaker.toLowerCase().includes(q) ||
      seg.text.toLowerCase().includes(q)
    );
  });

  const handleStartEditSpeaker = (speaker: string) => {
    setEditingSpeaker(speaker);
    setTempSpeakerName(speaker);
  };

  const handleSaveSpeaker = (oldName: string) => {
    if (tempSpeakerName.trim() && tempSpeakerName.trim() !== oldName) {
      onUpdateSpeaker(oldName, tempSpeakerName.trim());
      onToast(`Speaker updated to "${tempSpeakerName.trim()}"`);
    }
    setEditingSpeaker(null);
  };

  // Distinct color palette for speakers
  const speakerColors: Record<string, { badge: string; border: string }> = {};
  const palette = [
    { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', border: 'border-l-indigo-500' },
    { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', border: 'border-l-amber-500' },
    { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', border: 'border-l-emerald-500' },
    { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', border: 'border-l-rose-500' },
    { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', border: 'border-l-cyan-500' },
  ];

  segments.forEach((seg, idx) => {
    if (!speakerColors[seg.speaker]) {
      const p = palette[Object.keys(speakerColors).length % palette.length];
      speakerColors[seg.speaker] = p;
    }
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Diarized Transcript &amp; Audio Evidence
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {segments.length} turns
          </span>
        </div>

        {/* In-transcript search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dialogue, people, terms..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Audio Player Bar */}
      <AudioPlayerBar
        currentSec={currentAudioSec}
        totalDurationSec={totalDurationSec}
        isPlaying={isPlayingAudio}
        onPlayPause={onPlayPauseAudio}
        onSeek={onSeekAudio}
        activeSegmentSpeaker={activeSegment?.speaker}
        activeSegmentText={activeSegment?.text}
      />

      {/* Diarized Segments List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredSegments.length > 0 ? (
          filteredSegments.map((seg) => {
            const isPlayingThis = currentAudioSec >= seg.startSec && currentAudioSec <= seg.endSec;
            const isEvidenceMatch = activeEvidenceText && seg.text.toLowerCase().includes(activeEvidenceText.toLowerCase().slice(0, 25));
            const color = speakerColors[seg.speaker] || palette[0];

            return (
              <div
                key={seg.id}
                onClick={() => onSelectEvidence?.(seg.text)}
                className={`p-3.5 rounded-xl border transition-all text-xs border-l-4 cursor-pointer ${color.border} ${
                  isPlayingThis
                    ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                    : isEvidenceMatch
                    ? 'bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Speaker Tag & Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {editingSpeaker === seg.speaker ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempSpeakerName}
                          onChange={(e) => setTempSpeakerName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveSpeaker(seg.speaker)}
                          className="bg-slate-900 border border-amber-400 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveSpeaker(seg.speaker)}
                          className="text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditSpeaker(seg.speaker);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors hover:brightness-125 cursor-pointer ${color.badge}`}
                        title="Click to rename speaker"
                      >
                        {seg.speaker}
                        <FileEdit className="h-2.5 w-2.5 opacity-60 ml-0.5" />
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-500">
                      00:{String(seg.startSec).padStart(2, '0')} - 00:{String(seg.endSec).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Play audio clip button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeekAudio(seg.startSec);
                      if (!isPlayingAudio) onPlayPauseAudio();
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      isPlayingThis
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                    title="Play this conversation segment"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>

                {/* Utterance Text with highlighted keywords */}
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {seg.text}
                </p>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No dialogue matching &ldquo;{searchTerm}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};
