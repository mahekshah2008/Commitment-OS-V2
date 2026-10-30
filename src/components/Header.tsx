import React from 'react';
import { Sparkles, Calendar, CheckSquare, Zap, ExternalLink, Settings2, CheckCircle2, Search, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  analyzing: boolean;
  totalCommitments: number;
  calendarCount: number;
  keepCount: number;
  taskCount?: number;
  onOpenTasksModal?: () => void;
  onOpenIntegrationsHub?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  analyzing,
  totalCommitments,
  calendarCount,
  keepCount,
  taskCount = 0,
  onOpenTasksModal,
  onOpenIntegrationsHub,
  onOpenCommandPalette,
  onToggleTheme,
  isDark = true,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-mono shrink-0">
                CommitmentOS<span className="text-amber-400 font-sans text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">v2.0</span>
              </h1>
              <span className="font-handwriting text-xs text-amber-300 hidden sm:inline tracking-wide font-bold shrink-0">
                Promises Kept.
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xl">
              Verbal Commitment Detection &amp; Google Calendar, Keep &amp; Tasks Synchronization
            </p>
          </div>
        </div>

        {/* Stats & Targets */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Calibrated:</span>
            <span className="text-amber-300 font-semibold">2026 Reference</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800/40 text-blue-300">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>Calendar:</span>
            <span className="font-bold text-white">{calendarCount}</span>
          </div>

          {onOpenTasksModal && (
            <button
              onClick={onOpenTasksModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/40 transition-colors cursor-pointer"
              title="Open Generated Action Tasks"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Tasks:</span>
              <span className="font-bold text-white">{taskCount}</span>
            </button>
          )}

          {onOpenIntegrationsHub && (
            <button
              onClick={onOpenIntegrationsHub}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Open Integrations & Synchronization Hub"
            >
              <Settings2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sync Hub</span>
            </button>
          )}

          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
              title="Open Google Calendar"
            >
              <span>Calendar</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://keep.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
              title="Open Google Keep"
            >
              <span>Keep</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
