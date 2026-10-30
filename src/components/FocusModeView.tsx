import React, { useState, useEffect } from 'react';
import { CommitmentItem, CommitmentStatus } from '../utils/types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Flame,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface FocusModeViewProps {
  commitments: CommitmentItem[];
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onOpenDetails: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  commitments,
  onToggleStatus,
  onOpenDetails,
  onToast,
}) => {
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(
    commitments.find((c) => c.status !== 'completed')?.id || null
  );

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      onToast('🎉 Focus session completed! Take a 5-minute breather.');
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance('Focus sprint complete. Outstanding progress.');
        window.speechSynthesis.speak(utter);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, onToast]);

  const handleSetDuration = (mins: number) => {
    setIsRunning(false);
    setSessionMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(sessionMinutes * 60);
  };

  const activeFocusItem = commitments.find((c) => c.id === selectedFocusId) || commitments[0];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = Math.round(
    ((sessionMinutes * 60 - secondsRemaining) / (sessionMinutes * 60)) * 100
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Focus Mode: Deep Commitment Execution
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                DISTRACTION-FREE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero notifications, single-deliverable immersion, and proactive streak protection.
            </p>
          </div>
        </div>

        {/* Preset Duration Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {[15, 25, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSetDuration(mins)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                sessionMinutes === mins
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mins}m Sprint
            </button>
          ))}
        </div>
      </div>

      {/* Main Focus Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Timer Display & Active Commitment */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
          {/* Background Ambient Glow */}
          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
            isRunning ? 'bg-amber-500/10' : 'bg-blue-500/5'
          }`} />

          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="h-4 w-4" /> Current Focus Target
            </span>
            <span className="text-slate-500">
              Cycle {sessionMinutes}m • {progressPercent}% elapsed
            </span>
          </div>

          {/* Large Circular Timer */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-56 h-56 transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - (sessionMinutes * 60 - secondsRemaining) / (sessionMinutes * 60))}
                className="text-amber-500 transition-all duration-1000"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white">
                {formatTimer(secondsRemaining)}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mt-1">
                {isRunning ? 'Running Focus Block' : 'Ready to Start'}
              </span>
            </div>
          </div>

          {/* Play/Pause & Reset Controls */}
          <div className="flex items-center gap-3 my-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-slate-950'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950" />}
              <span>{isRunning ? 'Pause Session' : 'Start Focus Sprint'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Active Target Deliverable Card */}
          {activeFocusItem ? (
            <div className="w-full mt-4 p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 text-left">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-amber-400 font-semibold uppercase">
                  Target: {activeFocusItem.owner} ➔ {activeFocusItem.waitingPerson}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  activeFocusItem.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  activeFocusItem.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {activeFocusItem.priority?.toUpperCase()} PRIORITY
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {activeFocusItem.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                {activeFocusItem.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Est: {activeFocusItem.estimatedHours || 1.5}h</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(activeFocusItem)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus(activeFocusItem.id, 'completed');
                      onToast(`Marked "${activeFocusItem.title}" as completed!`);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete Deliverable</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-slate-500 text-xs font-mono">
              All commitments completed! Select another item from the queue.
            </div>
          )}
        </div>

        {/* Right: Queue of commitments for today */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-400" />
              Focus Queue ({commitments.filter(c => c.status !== 'completed').length} Pending)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Click to set active
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
            {commitments.map((cmt) => {
              const isSelected = cmt.id === selectedFocusId;
              const isDone = cmt.status === 'completed';

              return (
                <div
                  key={cmt.id}
                  onClick={() => setSelectedFocusId(cmt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 shadow-md'
                      : isDone
                      ? 'bg-slate-950/40 border-slate-800 opacity-50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span className="text-amber-300 font-semibold truncate max-w-[150px]">
                      {cmt.owner} ➔ {cmt.waitingPerson}
                    </span>
                    <span className={`uppercase font-bold text-[10px] ${
                      cmt.priority === 'critical' ? 'text-rose-400' :
                      cmt.priority === 'high' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {cmt.priority}
                    </span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-semibold mb-1 line-clamp-1 ${
                    isDone ? 'line-through text-slate-500' : 'text-white'
                  }`}>
                    {cmt.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span className="truncate max-w-[180px]">
                      {cmt.deadlineOriginal || (cmt.date_time ? new Date(cmt.date_time).toLocaleDateString() : 'Open')}
                    </span>
                    {isDone ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    ) : isSelected ? (
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        Active Target
                      </span>
                    ) : (
                      <span className="text-slate-500 hover:text-slate-300">
                        Select ➔
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
