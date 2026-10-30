import React, { useState } from 'react';
import { CommitmentItem, CommitmentStatus } from '../utils/types';
import { buildGoogleCalendarUrl, generateIcsFile } from '../utils/calendar';
import { 
  Calendar, 
  CheckSquare, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  User, 
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  AlertTriangle,
  Info,
  Repeat,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CommitmentCardProps {
  commitment: CommitmentItem;
  index: number;
  onOpenDetails: (item: CommitmentItem) => void;
  onPlayAudioSegment: (startSec: number) => void;
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onOpenCalendarReview: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
  isEvidenceHighlighted?: boolean;
}

export const CommitmentCard: React.FC<CommitmentCardProps> = ({
  commitment,
  index,
  onOpenDetails,
  onPlayAudioSegment,
  onToggleStatus,
  onOpenCalendarReview,
  onToast,
  isEvidenceHighlighted,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [keepCopied, setKeepCopied] = useState<boolean>(false);

  const isCalendar = commitment.type === 'calendar';
  const isCompleted = commitment.status === 'completed';
  const isDismissed = commitment.status === 'dismissed';

  const formatHumanDate = (isoStr: string | null) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(commitment, null, 2));
    setCopied(true);
    onToast('Commitment JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenKeep = (e: React.MouseEvent) => {
    e.stopPropagation();
    const keepText = `[CommitmentOS_V2 Task]\n\nTitle: ${commitment.title}\n\nOwner: ${commitment.owner || 'Unassigned'}\nWaiting: ${commitment.waitingPerson || 'Team'}\nDeadline: ${commitment.deadlineOriginal || 'Open'}\n\nContext:\n${commitment.description}\n\nConfidence: ${Math.round(commitment.confidence_score * 100)}%`;
    navigator.clipboard.writeText(keepText);
    setKeepCopied(true);
    onToast('Note copied to clipboard! Opening Google Keep...');
    setTimeout(() => {
      window.open('https://keep.google.com/', '_blank');
      setKeepCopied(false);
    }, 400);
  };

  const confidencePct = Math.round(commitment.confidence_score * 100);
  const confidenceColor = 
    confidencePct >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    confidencePct >= 80 ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const priorityBadge = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  }[commitment.priority || 'medium'];

  const hasContradiction = Boolean(commitment.contradictions?.some(c => !c.dismissed));
  const isDuplicate = Boolean(commitment.duplicateInfo?.isDuplicate && !commitment.duplicateInfo.dismissed);
  const isRecurring = Boolean(commitment.recurrence?.isRecurring);
  const isCalendarSynced = commitment.calendarSync?.status === 'synced';

  return (
    <div
      onClick={() => onOpenDetails(commitment)}
      className={`group rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-md cursor-pointer ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800 opacity-70'
          : isEvidenceHighlighted
          ? 'bg-amber-950/30 border-amber-500 shadow-amber-500/10 ring-2 ring-amber-500/30'
          : isCalendar
          ? 'bg-slate-900/90 border-blue-900/40 hover:border-blue-700/60 hover:shadow-blue-500/5'
          : 'bg-slate-900/90 border-amber-900/40 hover:border-amber-700/60 hover:shadow-amber-500/5'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Calendar vs Keep type */}
          {isCalendar ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              Calendar Event
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
              <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
              Keep Task / Note
            </span>
          )}

          {/* Priority pill */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border ${priorityBadge}`}>
            {commitment.priority || 'medium'}
          </span>

          {/* Module A: 9-Stage Lifecycle Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${
            commitment.status === 'completed' ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' :
            commitment.status === 'in_progress' ? 'text-blue-300 bg-blue-500/15 border-blue-500/30' :
            commitment.status === 'needs_clarification' ? 'text-amber-300 bg-amber-500/15 border-amber-500/30' :
            commitment.status === 'rescheduled' ? 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30' :
            commitment.status === 'overdue' ? 'text-rose-300 bg-rose-500/20 border-rose-500/40 animate-pulse' :
            'text-slate-300 bg-slate-800 border-slate-700'
          }`}>
            {String(commitment.status || 'detected').replace(/_/g, ' ')}
          </span>

          {/* Module D: Proactive Deadline Risk Badge */}
          {commitment.deadlineRisk && commitment.deadlineRisk.score >= 50 && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
              commitment.deadlineRisk.riskLevel === 'critical'
                ? 'text-rose-400 bg-rose-500/15 border-rose-500/40'
                : 'text-amber-400 bg-amber-500/15 border-amber-500/40'
            }`}>
              <AlertTriangle className="h-3 w-3" /> Risk {commitment.deadlineRisk.score}%
            </span>
          )}

          {/* Module D: Dependency Flag */}
          {commitment.dependencyNode && commitment.dependencyNode.type !== 'independent' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30">
              <Layers className="h-3 w-3" /> Blocked by {commitment.dependencyNode.targetEntity}
            </span>
          )}

          {/* Sync status indicator */}
          {isCalendarSynced && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" /> Synced
            </span>
          )}

          {/* Recurring pill */}
          {isRecurring && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30">
              <Repeat className="h-3 w-3" /> {commitment.recurrence?.frequency}
            </span>
          )}

          {/* Duplicate Warning */}
          {isDuplicate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/40">
              <AlertTriangle className="h-3 w-3" /> Duplicate Detected
            </span>
          )}

          {/* Contradiction Warning */}
          {hasContradiction && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertTriangle className="h-3 w-3" /> Contradiction
            </span>
          )}

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            #{index + 1}
          </span>
        </div>

        {/* Right side: Confidence & Quick Copy */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${confidenceColor}`}>
            <Sparkles className="h-3 w-3" />
            {confidencePct}% Confidence
          </span>

          <button
            onClick={handleCopySnippet}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy Item JSON"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-base sm:text-lg font-semibold tracking-tight leading-snug mb-1.5 transition-colors ${
        isCompleted ? 'line-through text-slate-400' : 'text-white group-hover:text-amber-200'
      }`}>
        {commitment.title}
      </h3>

      {/* Speaker Ownership Tag */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2 flex-wrap">
        <span className="text-amber-300 font-semibold flex items-center gap-1 shrink-0">
          <User className="h-3 w-3" />
          {commitment.owner || 'Speaker'}
        </span>
        <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
        <span className="text-slate-300 shrink-0">{commitment.waitingPerson || 'Team'}</span>

        {commitment.evidenceSpan?.audioStartSec !== undefined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudioSegment(commitment.evidenceSpan?.audioStartSec || 0);
            }}
            className="ml-auto inline-flex items-center gap-1 text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline cursor-pointer shrink-0"
            title="Jump to audio evidence"
          >
            <Play className="h-3 w-3 fill-amber-400/90" />
            <span>00:{String(commitment.evidenceSpan.audioStartSec).padStart(2, '0')}</span>
          </button>
        )}
      </div>

      {/* Description / Context */}
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        {commitment.description}
      </p>

      {/* Suggested Deadline Chip (Feature 6) */}
      {!commitment.date_time && commitment.suggestedDeadline && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-blue-300 bg-blue-950/30 border border-blue-900/40 px-3 py-1.5 rounded-lg mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400">AI Suggested:</span>
          <span className="font-semibold text-blue-300">{commitment.suggestedDeadline.label}</span>
        </div>
      )}

      {/* Date/Time Indicator if Calendar */}
      {isCalendar && commitment.date_time && (
        <div className="flex items-center gap-2 text-xs font-mono text-blue-300 bg-blue-950/30 border border-blue-900/40 px-3 py-2 rounded-lg mb-3">
          <Clock className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
          <span className="font-semibold">{formatHumanDate(commitment.date_time)}</span>
          {commitment.deadlineOriginal && (
            <span className="text-[11px] text-blue-400/70 ml-auto hidden sm:inline">
              &ldquo;{commitment.deadlineOriginal}&rdquo;
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(commitment.id, isCompleted ? 'active' : 'completed');
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Check className="h-3 w-3" />
            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(commitment);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Info className="h-3 w-3" />
            <span>Details</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {isCalendar ? (
            <>
              <button
                onClick={() => generateIcsFile(commitment)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                title="Download enriched .ics file"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                <span>Export .ICS</span>
              </button>

              <button
                onClick={() => onOpenCalendarReview(commitment)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-blue-400 hover:bg-blue-300 transition-all shadow-sm cursor-pointer"
              >
                <span>Add to Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleOpenKeep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm cursor-pointer"
            >
              {keepCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied! Opening Keep...</span>
                </>
              ) : (
                <>
                  <span>Add to Keep</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
