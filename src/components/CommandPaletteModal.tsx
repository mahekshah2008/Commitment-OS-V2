import React, { useState, useEffect } from 'react';
import { CommitmentItem } from '../utils/types';
import { 
  Search, 
  X, 
  Calendar, 
  Flame, 
  Users, 
  BarChart3, 
  Lock, 
  Cpu, 
  LayoutList, 
  Columns, 
  Code2, 
  Sun, 
  Moon,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commitments: CommitmentItem[];
  onSelectTab: (tab: any) => void;
  onSelectCommitment: (item: CommitmentItem) => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onToast: (msg: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  commitments,
  onSelectTab,
  onSelectCommitment,
  onToggleTheme,
  isDark,
  onToast,
}) => {
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommitments = commitments.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.owner?.toLowerCase().includes(query.toLowerCase()) ||
      c.waitingPerson?.toLowerCase().includes(query.toLowerCase())
  );

  const navigationCommands = [
    { label: 'Action Cards View', tab: 'board', icon: LayoutList },
    { label: 'Interactive Kanban Board', tab: 'kanban', icon: Columns },
    { label: 'Focus Mode (Pomodoro Sprint)', tab: 'focus', icon: Flame },
    { label: 'People & Collaboration Hub', tab: 'people', icon: Users },
    { label: 'Commitment Analytics & Heatmap', tab: 'analytics', icon: BarChart3 },
    { label: 'Privacy, Security & Compliance', tab: 'privacy', icon: Lock },
    { label: 'Advanced AI & Copilot', tab: 'advanced', icon: Cpu },
    { label: '7-Day Forecast & Planning', tab: 'planning', icon: Calendar },
    { label: 'Dialogue Transcript & Audio', tab: 'transcript', icon: Users },
    { label: 'Raw API JSON Schema', tab: 'json', icon: Code2 },
  ].filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="h-5 w-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search commitments..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1 font-bold">
              Preferences &amp; Actions
            </div>
            <button
              onClick={() => {
                onToggleTheme();
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                <span>Toggle Theme ({isDark ? 'Light Mode' : 'Dark Mode'})</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Theme Switch</span>
            </button>
          </div>

          {/* Navigation Commands */}
          {navigationCommands.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1 font-bold">
                Navigation
              </div>
              <div className="space-y-1">
                {navigationCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.tab}
                      onClick={() => {
                        onSelectTab(cmd.tab);
                        onClose();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span>{cmd.label}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Commitments */}
          {filteredCommitments.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1 font-bold">
                Matching Commitments ({filteredCommitments.length})
              </div>
              <div className="space-y-1">
                {filteredCommitments.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCommitment(c);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white line-clamp-1">{c.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {c.owner} ➔ {c.waitingPerson} • {c.deadlineOriginal || 'Open'}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {c.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
