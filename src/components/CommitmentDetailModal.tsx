import React, { useState } from 'react';
import { 
  CommitmentItem, 
  CommitmentStatus, 
  CommitmentPriority, 
  CommitmentClassification,
  ConditionStatus 
} from '../utils/types';
import { 
  buildEnrichedGoogleCalendarUrl, 
  generateIcsFile, 
  buildFormattedNoteContent 
} from '../utils/calendar';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  Clock, 
  User, 
  Sparkles, 
  History, 
  HelpCircle, 
  Play, 
  Check, 
  Copy, 
  ExternalLink, 
  Download,
  AlertTriangle,
  Layers,
  ArrowRight,
  Repeat,
  CopyCheck,
  Zap,
  Radio,
  FileText
} from 'lucide-react';

interface CommitmentDetailModalProps {
  commitment: CommitmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: CommitmentItem) => void;
  onPlayAudioSegment: (startSec: number) => void;
  onOpenCalendarReview: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const CommitmentDetailModal: React.FC<CommitmentDetailModalProps> = ({
  commitment,
  isOpen,
  onClose,
  onUpdate,
  onPlayAudioSegment,
  onOpenCalendarReview,
  onToast,
}) => {
  if (!isOpen || !commitment) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'tasks' | 'calendar' | 'notes' | 'history'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(commitment.title);
  const [editedOwner, setEditedOwner] = useState(commitment.owner || '');
  const [editedWaitingPerson, setEditedWaitingPerson] = useState(commitment.waitingPerson || '');
  const [editedPriority, setEditedPriority] = useState<CommitmentPriority>(commitment.priority || 'medium');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [noteExported, setNoteExported] = useState(false);

  const isCalendar = commitment.type === 'calendar';
  const duplicate = commitment.duplicateInfo;
  const suggestedDeadline = commitment.suggestedDeadline;
  const recurrence = commitment.recurrence;
  const conflict = commitment.conflictCheck;
  const task = commitment.linkedTask;

  const handleSaveEdits = () => {
    const updated: CommitmentItem = {
      ...commitment,
      title: editedTitle,
      action: editedTitle,
      owner: editedOwner,
      waitingPerson: editedWaitingPerson,
      priority: editedPriority,
      history: [
        ...(commitment.history || []),
        {
          id: `hist-edit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'edited',
          description: `User updated action title, owner to "${editedOwner}", or priority to "${editedPriority}".`,
          actor: 'User',
        },
      ],
    };
    onUpdate(updated);
    setIsEditing(false);
    onToast('Commitment details updated and recorded in history');
  };

  const handleToggleStatus = (newStatus: CommitmentStatus) => {
    const updated: CommitmentItem = {
      ...commitment,
      status: newStatus,
      history: [
        ...(commitment.history || []),
        {
          id: `hist-status-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'status_changed',
          description: `Status changed to "${newStatus}".`,
          actor: 'User',
        },
      ],
    };
    onUpdate(updated);
    onToast(`Commitment marked as ${newStatus}`);
  };

  // Feature 6: Accept Suggested Deadline
  const handleAcceptSuggestedDeadline = () => {
    if (!suggestedDeadline) return;
    const updated: CommitmentItem = {
      ...commitment,
      date_time: suggestedDeadline.dateTime,
      deadlineOriginal: suggestedDeadline.label,
      suggestedDeadline: {
        ...suggestedDeadline,
        isAccepted: true,
      },
      history: [
        ...(commitment.history || []),
        {
          id: `hist-sug-dl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'deadline_suggested_accepted',
          description: `Accepted AI suggested deadline: ${suggestedDeadline.label}.`,
          actor: 'User',
        },
      ],
    };
    onUpdate(updated);
    onToast(`Applied suggested deadline: ${suggestedDeadline.label}`);
  };

  // Feature 4: Dismiss Duplicate Warning
  const handleDismissDuplicate = () => {
    if (!duplicate) return;
    const updated: CommitmentItem = {
      ...commitment,
      duplicateInfo: {
        ...duplicate,
        dismissed: true,
      },
    };
    onUpdate(updated);
    onToast('Duplicate warning dismissed');
  };

  // Feature 2: Smart Notes & Keep Export
  const handleExportToNotes = (provider: 'keep' | 'docs') => {
    const noteText = buildFormattedNoteContent(commitment);
    navigator.clipboard.writeText(noteText);
    setNoteExported(true);

    const updated: CommitmentItem = {
      ...commitment,
      notesExport: {
        status: 'exported',
        provider,
        exportedAt: new Date().toISOString(),
      },
      history: [
        ...(commitment.history || []),
        {
          id: `hist-note-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'notes_exported',
          description: `Exported summary note to Google ${provider === 'keep' ? 'Keep' : 'Docs'}.`,
          actor: 'User',
        },
      ],
    };
    onUpdate(updated);

    if (provider === 'keep') {
      onToast('Formatted note copied! Opening Google Keep...');
      setTimeout(() => window.open('https://keep.google.com/', '_blank'), 400);
    } else {
      onToast('Formatted document copied! Opening Google Docs...');
      setTimeout(() => window.open('https://docs.google.com/document/create', '_blank'), 400);
    }
  };

  const handleResolveQuestion = (qId: string) => {
    const updatedQuestions = (commitment.followUpQuestions || []).map(q => 
      q.id === qId ? { ...q, resolved: true } : q
    );
    onUpdate({ ...commitment, followUpQuestions: updatedQuestions });
    onToast('Follow-up question marked as resolved');
  };

  const handleCopyQuestion = (qId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(qId);
    onToast('Question copied to clipboard');
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const priorityColors = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider border ${priorityColors[commitment.priority || 'medium']}`}>
              {commitment.priority || 'medium'} priority
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {commitment.classification?.toUpperCase() || 'COMMITTED'}
            </span>
            {recurrence?.isRecurring && (
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Repeat className="h-3 w-3" /> Recurring
              </span>
            )}
            <span className="text-xs font-mono text-slate-500">
              ID: {commitment.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Organized 6-Section Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; Evidence
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'insights'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Insights &amp; Suggestions</span>
            {(duplicate?.isDuplicate && !duplicate.dismissed) && (
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Actions &amp; Tasks
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Calendar &amp; Scheduling
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Notes &amp; Context
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit History ({commitment.history?.length || 1})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Section 1: Overview & Evidence */}
          {activeTab === 'overview' && (
            <>
              {/* Title & Action */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Action Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-white font-semibold text-sm focus:outline-none"
                  />
                ) : (
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {commitment.title}
                  </h3>
                )}
              </div>

              {/* Responsibility & Ownership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Commitment Owner</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedOwner}
                      onChange={(e) => setEditedOwner(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-semibold focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-300 mt-0.5">
                      <User className="h-4 w-4 text-amber-400" />
                      <span>{commitment.owner || 'Unassigned'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Waiting Person / Recipient</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedWaitingPerson}
                      onChange={(e) => setEditedWaitingPerson(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <span>{commitment.waitingPerson || 'General Stakeholder'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deadline & Original Wording */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[11px] font-mono uppercase text-slate-400">Deadline &amp; Time Interpretation</span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>{commitment.date_time ? new Date(commitment.date_time).toLocaleString() : 'General To-Do (No strict timestamp)'}</span>
                  </div>
                  {commitment.deadlineOriginal && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Original: &ldquo;{commitment.deadlineOriginal}&rdquo;
                    </span>
                  )}
                </div>
              </div>

              {/* Verbatim Transcript Evidence */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Verbatim Transcript Evidence
                  </span>
                  {commitment.evidenceSpan?.audioStartSec !== undefined && (
                    <button
                      onClick={() => onPlayAudioSegment(commitment.evidenceSpan?.audioStartSec || 0)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-amber-300" />
                      <span>Play Audio (00:{String(commitment.evidenceSpan.audioStartSec).padStart(2, '0')})</span>
                    </button>
                  )}
                </div>
                <blockquote className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 italic leading-relaxed border-l-4 border-l-amber-400">
                  &ldquo;{commitment.originalText || commitment.description}&rdquo;
                </blockquote>
              </div>
            </>
          )}

          {/* Section 2: AI Insights (Suggested Deadlines, Recurring, Duplicates) */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* Feature 4: Duplicate Commitment Detection Warning */}
              {duplicate?.isDuplicate && !duplicate.dismissed ? (
                <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      {duplicate.duplicateType === 'exact' ? 'Exact Duplicate Warning' : 'Probable Duplicate Detected'}
                    </span>
                    <button
                      onClick={handleDismissDuplicate}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Dismiss Warning
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {duplicate.reason}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-mono text-slate-400">
                      Matches commitment: <strong className="text-white">&ldquo;{duplicate.matchingTitle}&rdquo;</strong> ({duplicate.similarityScore}% similarity)
                    </span>
                    <button
                      onClick={() => {
                        handleToggleStatus('completed');
                        onToast('Merged with matching commitment record');
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 cursor-pointer"
                    >
                      Merge Record
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Feature 6: Smart Deadline Suggestions */}
              {suggestedDeadline && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Sparkles className="h-4 w-4" /> Smart Deadline Suggestion (AI Estimate)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {suggestedDeadline.isAccepted ? 'Accepted' : 'Suggested'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Reason: {suggestedDeadline.reason}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs font-bold text-blue-300">
                      {suggestedDeadline.label}
                    </span>
                    {!suggestedDeadline.isAccepted ? (
                      <button
                        onClick={handleAcceptSuggestedDeadline}
                        className="px-3 py-1 rounded text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                      >
                        Accept Suggested Deadline
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Applied to Commitment
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Feature 9: Recurring Commitment Pattern */}
              {recurrence?.isRecurring ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Repeat className="h-4 w-4" /> Recurring Commitment Cadence
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      {recurrence.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Pattern: <strong>{recurrence.humanSummary}</strong>
                  </p>
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                    RRULE Format: <code>{recurrence.rruleText}</code>
                  </div>
                </div>
              ) : null}

              {/* Follow-up Clarification Questions */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  <span>Ambiguity Clarification Questions ({(commitment.followUpQuestions || []).length})</span>
                </span>
                {(commitment.followUpQuestions || []).length > 0 ? (
                  commitment.followUpQuestions?.map((q) => (
                    <div key={q.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">{q.question}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyQuestion(q.id, q.question)}
                          className="px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        >
                          {copiedQuestionId === q.id ? <Check className="h-3 w-3 text-emerald-400" /> : 'Copy'}
                        </button>
                        {!q.resolved && (
                          <button
                            onClick={() => handleResolveQuestion(q.id)}
                            className="px-2 py-1 rounded text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No ambiguity detected.</p>
                )}
              </div>

              {/* Module B: Smart Reminders Schedule (T-24h, T-4h, T-1h) */}
              {commitment.reminders && commitment.reminders.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Clock className="h-4 w-4" /> Smart Reminder Engine (T-24h, T-4h, T-1h)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Auto-Scheduled
                    </span>
                  </div>

                  <div className="space-y-2">
                    {commitment.reminders.map((rem) => (
                      <div key={rem.id} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-300 uppercase">
                            {rem.stage.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-300">{rem.message}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          Channel: {rem.channel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module B: Overdue Recovery Plan & Intelligent Rescheduling */}
              {commitment.recoveryPlan && (
                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <AlertTriangle className="h-4 w-4 text-amber-400" /> Overdue Recovery Plan (Feature 6 &amp; 7)
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      {commitment.recoveryPlan.actionType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {commitment.recoveryPlan.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-blue-300">
                      Remediation: {commitment.recoveryPlan.title}
                    </span>
                    <button
                      onClick={() => {
                        handleToggleStatus('rescheduled');
                        onToast(`Applied recovery action: ${commitment.recoveryPlan?.title}`);
                      }}
                      className="px-3 py-1 rounded text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      Apply Recovery Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Feature 20: Explainable AI Decisions Disclosure */}
              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <Sparkles className="h-4 w-4 text-indigo-400" /> Explainable AI Rationale (Feature 20)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Transparent Attribution
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {commitment.confidenceBreakdown?.explanation || 'Commitment identified from explicit dialogic verbal undertaking.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-400">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div>Clarity:</div>
                    <div className="text-white font-bold">{commitment.confidenceBreakdown?.clarity || 92}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div>Attribution:</div>
                    <div className="text-white font-bold">{commitment.confidenceBreakdown?.ownerIdentification || 95}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div>Deadline:</div>
                    <div className="text-white font-bold">{commitment.confidenceBreakdown?.deadlineInterpretation || 90}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div>Risk Score:</div>
                    <div className="text-white font-bold">{commitment.deadlineRisk?.score || 25}/100</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Actions & Linked Tasks (Feature 3) */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                    <span>Linked Action Task</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {task?.status || 'todo'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Task Title:</span>
                    <strong className="text-white text-sm">{task?.title || commitment.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Assigned Owner:</span>
                    <span className="text-amber-300 font-semibold">{task?.owner || commitment.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Due Date:</span>
                    <span className="text-blue-300 font-mono">
                      {task?.dueDate ? new Date(task.dueDate).toLocaleString() : 'Open / Unscheduled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <a
                    href="https://tasks.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in Google Tasks</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Calendar & Scheduling (Feature 1, 5, 7) */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Conflict Status */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>Calendar Availability &amp; Conflicts</span>
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    conflict?.hasConflict
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {conflict?.hasConflict ? 'Conflict Found' : 'Slot Available'}
                  </span>
                </div>

                {conflict?.hasConflict ? (
                  <p className="text-xs text-amber-200">
                    Existing meeting collision detected. Review alternative open slots before saving.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    No scheduling collisions detected during this time window.
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCalendarReview(commitment);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Review &amp; Schedule Google Calendar Event</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Notes & Context (Feature 2) */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span>Smart Note &amp; Context Exporter</span>
                  </span>
                  {commitment.notesExport?.status === 'exported' && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Exported
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  Export commitment details, owner attribution, dialogue evidence, and action checklists to Google Keep or Google Docs.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleExportToNotes('keep')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Export to Google Keep</span>
                  </button>

                  <button
                    onClick={() => handleExportToNotes('docs')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Export to Google Docs</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Audit History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Append-only audit trail tracking modifications, reanalysis updates, and status transitions:
              </p>
              <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-4">
                {(commitment.history || []).map((ev) => (
                  <div key={ev.id} className="relative pb-3">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="text-xs font-semibold text-slate-200">{ev.description}</div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{new Date(ev.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>Actor: {ev.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSaveEdits}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            )}

            {commitment.status === 'completed' ? (
              <button
                onClick={() => handleToggleStatus('active')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
              >
                Reopen Commitment
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus('completed')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                Mark as Completed
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenCalendarReview(commitment);
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule / Sync Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
