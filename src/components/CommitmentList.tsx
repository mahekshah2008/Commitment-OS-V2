import React, { useState } from 'react';
import { CommitmentItem, CommitmentResponse, CommitmentStatus } from '../utils/types';
import { CommitmentCard } from './CommitmentCard';
import { downloadJsonFile } from '../utils/calendar';
import { 
  Calendar, 
  CheckSquare, 
  Layers, 
  Download, 
  Sparkles, 
  Filter,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  X,
  Repeat,
  Zap
} from 'lucide-react';

interface CommitmentListProps {
  data: CommitmentResponse | null;
  onToast: (msg: string) => void;
  isAnalyzing: boolean;
  onOpenDetails: (item: CommitmentItem) => void;
  onPlayAudioSegment: (startSec: number) => void;
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onOpenCalendarReview: (item: CommitmentItem) => void;
  onOpenSummary: () => void;
  onOpenTasksModal: () => void;
  onOpenIntegrationsHub: () => void;
  onReanalyze: () => void;
  isReanalyzing: boolean;
  activeEvidenceText?: string;
}

export const CommitmentList: React.FC<CommitmentListProps> = ({
  data,
  onToast,
  isAnalyzing,
  onOpenDetails,
  onPlayAudioSegment,
  onToggleStatus,
  onOpenCalendarReview,
  onOpenSummary,
  onOpenTasksModal,
  onOpenIntegrationsHub,
  onReanalyze,
  isReanalyzing,
  activeEvidenceText,
}) => {
  const [filter, setFilter] = useState<'all' | 'calendar' | 'keep' | 'tasks' | 'recurring' | 'conditional'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const commitments = data?.commitments || [];
  const calendarItems = commitments.filter((c) => c.type === 'calendar');
  const keepItems = commitments.filter((c) => c.type === 'keep');
  const recurringItems = commitments.filter((c) => c.recurrence?.isRecurring);
  const tasksItems = commitments.filter((c) => Boolean(c.linkedTask));
  const conditionalItems = commitments.filter((c) => c.classification === 'conditional' || Boolean(c.condition));

  const filteredItems = commitments.filter((c) => {
    if (filter === 'calendar' && c.type !== 'calendar') return false;
    if (filter === 'keep' && c.type !== 'keep') return false;
    if (filter === 'recurring' && !c.recurrence?.isRecurring) return false;
    if (filter === 'tasks' && !c.linkedTask) return false;
    if (filter === 'conditional' && !(c.classification === 'conditional' || c.condition)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.owner && c.owner.toLowerCase().includes(q)) ||
        (c.waitingPerson && c.waitingPerson.toLowerCase().includes(q)) ||
        (c.originalText && c.originalText.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const avgConfidence = commitments.length > 0
    ? Math.round((commitments.reduce((sum, item) => sum + item.confidence_score, 0) / commitments.length) * 100)
    : 0;

  const unresolvedContradictions = (data?.contradictions || []).filter(c => !c.dismissed);
  const duplicateWarnings = commitments.filter(c => c.duplicateInfo?.isDuplicate && !c.duplicateInfo.dismissed);

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xl">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 animate-spin opacity-70 blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Analyzing Phone Call Transcript</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Scanning linguistic markers, detecting recurring cadences, checking calendar conflicts, estimating smart deadlines, and generating tasks...
          </p>
        </div>
      </div>
    );
  }

  if (!data || commitments.length === 0) {
    return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No Commitments Extracted Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Select a transcript preset or paste a phone conversation, then click &ldquo;Extract Commitments &amp; Promises&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contradiction Warning Banner */}
      {unresolvedContradictions.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>
              <strong>{unresolvedContradictions.length} Contradiction Detected:</strong> A later statement in the conversation revised an earlier commitment deadline.
            </span>
          </div>
          <button
            onClick={() => onOpenDetails(commitments[0])}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold border border-rose-500/40 shrink-0 transition-colors cursor-pointer"
          >
            Review Conflict
          </button>
        </div>
      )}

      {/* Duplicate Commitment Warning Banner */}
      {duplicateWarnings.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>{duplicateWarnings.length} Duplicate Promise Warning:</strong> Repeated or substantially similar verbal promises detected in conversation.
            </span>
          </div>
          <button
            onClick={() => onOpenDetails(duplicateWarnings[0])}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 shrink-0 transition-colors cursor-pointer"
          >
            Review Duplicates
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Commitments</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 flex items-baseline gap-1.5">
            {commitments.length}
            <span className="text-xs font-normal text-slate-500">items</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-blue-900/40 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-blue-300 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Calendar Events
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 flex items-baseline gap-1.5">
            {calendarItems.length}
            <span className="text-xs font-normal text-slate-500">events</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3" /> Action Tasks
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 flex items-baseline gap-1.5">
            {tasksItems.length}
            <span className="text-xs font-normal text-slate-500">created</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Avg Confidence
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-1.5">
            {avgConfidence}%
            <span className="text-xs font-normal text-emerald-500/70">precision</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Summary & Deep Recovery & Integrations Hub */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Smart Conversation Summary button */}
          <button
            onClick={onOpenSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Smart Summary</span>
          </button>

          {/* Linked Tasks Modal launcher */}
          <button
            onClick={onOpenTasksModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Tasks ({tasksItems.length})</span>
          </button>

          {/* Missed Commitment Recovery */}
          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Scan transcript deeply for overlooked tentative commitments"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isReanalyzing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isReanalyzing ? 'Recovering...' : 'Recover Missed'}</span>
          </button>

          {/* Integrations Hub launcher */}
          <button
            onClick={onOpenIntegrationsHub}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sync Hub</span>
          </button>
        </div>

        {/* Global commitment search input */}
        <div className="relative w-full sm:w-56">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commitments..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({commitments.length})
          </button>

          <button
            onClick={() => setFilter('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'calendar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Calendar ({calendarItems.length})</span>
          </button>

          <button
            onClick={() => setFilter('keep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'keep'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Keep ({keepItems.length})</span>
          </button>

          <button
            onClick={() => setFilter('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Tasks ({tasksItems.length})</span>
          </button>

          <button
            onClick={() => setFilter('recurring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'recurring'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Recurring ({recurringItems.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            downloadJsonFile(data, 'commitmentos-extracted.json');
            onToast('Downloaded structured commitments JSON');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export Schema JSON</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Commitments Cards List */}
      <div className="flex flex-col gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <CommitmentCard
              key={item.id || idx}
              commitment={item}
              index={idx}
              onOpenDetails={onOpenDetails}
              onPlayAudioSegment={onPlayAudioSegment}
              onToggleStatus={onToggleStatus}
              onOpenCalendarReview={onOpenCalendarReview}
              onToast={onToast}
              isEvidenceHighlighted={Boolean(
                activeEvidenceText &&
                item.originalText &&
                item.originalText.toLowerCase().includes(activeEvidenceText.toLowerCase().slice(0, 20))
              )}
            />
          ))
        ) : (
          <div className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
            No commitments match the active filter or search query.
          </div>
        )}
      </div>
    </div>
  );
};
