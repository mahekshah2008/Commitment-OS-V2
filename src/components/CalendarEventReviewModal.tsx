import React, { useState } from 'react';
import { CommitmentItem } from '../utils/types';
import { 
  buildEnrichedGoogleCalendarUrl, 
  generateIcsFile, 
  formatGoogleCalendarDate 
} from '../utils/calendar';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  AlertTriangle, 
  Check, 
  ExternalLink, 
  Download, 
  X, 
  Sparkles, 
  Repeat,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CalendarEventReviewModalProps {
  commitment: CommitmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: (commitmentId: string, eventDetails: any) => void;
  onToast: (msg: string) => void;
}

export const CalendarEventReviewModal: React.FC<CalendarEventReviewModalProps> = ({
  commitment,
  isOpen,
  onClose,
  onConfirmSync,
  onToast,
}) => {
  if (!isOpen || !commitment) return null;

  const [title, setTitle] = useState(commitment.title);
  const [dateStr, setDateStr] = useState(
    commitment.date_time
      ? new Date(commitment.date_time).toISOString().slice(0, 16)
      : '2026-10-30T10:00'
  );
  const [durationMin, setDurationMin] = useState(60);
  const [participants, setParticipants] = useState(
    `${commitment.owner || 'Owner'}, ${commitment.waitingPerson || 'Beneficiary'}`
  );
  const [description, setDescription] = useState(
    `Action Commitment: ${commitment.title}\n\nContext & Dialogue:\n"${commitment.originalText || commitment.description}"\n\nOwner: ${commitment.owner || 'Unassigned'}\nWaiting: ${commitment.waitingPerson || 'Team'}`
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const conflict = commitment.conflictCheck;
  const recurrence = commitment.recurrence;
  const syncStatus = commitment.calendarSync?.status || 'not_synced';

  const handleApplyAlternativeSlot = (slot: { startIso: string; label: string }) => {
    setDateStr(new Date(slot.startIso).toISOString().slice(0, 16));
    setSelectedSlot(slot.label);
    onToast(`Applied alternative conflict-free time slot: ${slot.label}`);
  };

  const handleSaveAndSync = () => {
    const updatedCommitment: CommitmentItem = {
      ...commitment,
      title,
      date_time: new Date(dateStr).toISOString(),
    };

    // Build URL and open Google Calendar
    const calUrl = buildEnrichedGoogleCalendarUrl(updatedCommitment);
    window.open(calUrl, '_blank');

    onConfirmSync(commitment.id, {
      title,
      dateTime: new Date(dateStr).toISOString(),
      durationMin,
      participants,
      calUrl,
    });

    onToast('Opening Google Calendar with pre-populated event details');
    onClose();
  };

  const handleDownloadIcs = () => {
    const updatedCommitment: CommitmentItem = {
      ...commitment,
      title,
      date_time: new Date(dateStr).toISOString(),
    };
    generateIcsFile(updatedCommitment);
    onConfirmSync(commitment.id, {
      title,
      dateTime: new Date(dateStr).toISOString(),
      status: 'synced',
    });
    onToast('Downloaded enriched .ICS calendar file');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Review Google Calendar Event</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {syncStatus === 'synced' ? 'Already Synced' : 'Ready to Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verify title, date, conflict resolution, and participants before saving
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Scheduling Conflict Alert & Suggestions (Feature 5) */}
          {conflict?.hasConflict && (
            <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider font-mono">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Calendar Conflict Detected</span>
              </div>
              {conflict.conflictingEvents?.map((c, i) => (
                <p key={i} className="text-xs text-amber-200/90 leading-relaxed">
                  {c.reason}
                </p>
              ))}

              {conflict.suggestedAlternativeSlots && conflict.suggestedAlternativeSlots.length > 0 && (
                <div className="pt-2 border-t border-amber-900/40">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    Recommended Conflict-Free Slots:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {conflict.suggestedAlternativeSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handleApplyAlternativeSlot(slot)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                          selectedSlot === slot.label
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-950 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date & Time and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" />
                <span>Start Date &amp; Time (2026 Reference)</span>
              </label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Duration (Minutes)
              </label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
              </select>
            </div>
          </div>

          {/* Recurrence Rule if applicable (Feature 9) */}
          {recurrence?.isRecurring && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Repeat className="h-4 w-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-white block">Recurring Pattern Detected:</span>
                  <span className="text-slate-400 font-mono text-[11px]">{recurrence.humanSummary}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {recurrence.frequency}
              </span>
            </div>
          )}

          {/* Participants */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              <span>Participants / Stakeholders</span>
            </label>
            <input
              type="text"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Enriched Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1 flex items-center justify-between">
              <span>Enriched Description &amp; Notes</span>
              <span className="text-[10px] text-slate-500 font-mono">Includes quote, owner, and source link</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadIcs}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer flex items-center gap-1.5"
            title="Download enriched .ICS file for Apple / Outlook / Google"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .ICS File</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndSync}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <span>Add to Google Calendar</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
