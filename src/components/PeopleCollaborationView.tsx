import React, { useState } from 'react';
import { CommitmentItem, CommitmentStatus, FollowUpMessageDraft, TeamMemberRaci } from '../utils/types';
import { 
  Users, 
  UserCheck, 
  ArrowRight, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  FileText, 
  UserPlus, 
  Sparkles,
  MessageSquare,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';

interface PeopleCollaborationViewProps {
  commitments: CommitmentItem[];
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onOpenDetails: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const PeopleCollaborationView: React.FC<PeopleCollaborationViewProps> = ({
  commitments,
  onToggleStatus,
  onOpenDetails,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'who_owes_what' | 'timeline' | 'follow_ups' | 'raci' | 'delegation'>('who_owes_what');
  const [selectedContact, setSelectedContact] = useState<string>('all');
  const [copiedDraftIdx, setCopiedDraftIdx] = useState<number | null>(null);

  // Extract all unique speakers/contacts
  const contacts = Array.from(
    new Set(
      commitments.flatMap((c) => [c.owner, c.waitingPerson]).filter(Boolean)
    )
  ) as string[];

  // Assume user's persona is the primary speaker or first contact
  const currentUserPersona = contacts[0] || 'Me';

  // Who-Owes-What separation
  const myCommitments = commitments.filter(
    (c) => c.owner === currentUserPersona || (selectedContact !== 'all' && c.owner === selectedContact)
  );
  const owedToMe = commitments.filter(
    (c) => c.waitingPerson === currentUserPersona || (selectedContact !== 'all' && c.waitingPerson === selectedContact)
  );

  // Follow-up drafts generator
  const followUpDrafts: FollowUpMessageDraft[] = commitments
    .filter((c) => c.status !== 'completed' && c.waitingPerson)
    .map((c) => {
      const isOverdue = c.status === 'overdue' || (c.date_time && new Date(c.date_time) < new Date());
      const tone: FollowUpMessageDraft['tone'] = isOverdue
        ? 'urgent_escalation'
        : 'polite_reminder';

      const subject = isOverdue
        ? `[Urgent Follow-Up] Commitment Check: ${c.title}`
        : `Quick check-in regarding: ${c.title}`;

      const body = isOverdue
        ? `Hi ${c.owner},\n\nHope your week is going well. I wanted to gently follow up on our discussion regarding "${c.title}". The agreed target date was ${c.deadlineOriginal || 'earlier this week'}. Could you let me know if you need any assistance unblocking this or if we should calibrate the timeline?\n\nBest,\n${c.waitingPerson || 'Team'}`
        : `Hi ${c.owner},\n\nJust checking in on "${c.title}" scheduled for ${c.deadlineOriginal || 'the upcoming review'}. Looking forward to reviewing the deliverables once ready.\n\nThanks,\n${c.waitingPerson || 'Team'}`;

      return {
        recipient: c.owner || 'Colleague',
        subject,
        body,
        tone,
      };
    });

  // RACI Matrix
  const raciList: TeamMemberRaci[] = contacts.map((contact) => ({
    name: contact,
    role: contact.toLowerCase().includes('sarah') ? 'Product Lead' : contact.toLowerCase().includes('john') ? 'Technical Lead' : 'Collaborator',
    responsible: commitments.filter((c) => c.owner === contact).map((c) => c.title),
    accountable: commitments.filter((c) => c.owner === contact && (c.priority === 'critical' || c.priority === 'high')).map((c) => c.title),
    consulted: commitments.filter((c) => c.waitingPerson === contact).map((c) => c.title),
    informed: commitments.filter((c) => c.owner !== contact && c.waitingPerson !== contact).map((c) => c.title).slice(0, 2),
  }));

  const handleCopyDraft = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftIdx(idx);
    onToast('Follow-up message copied to clipboard');
    setTimeout(() => setCopiedDraftIdx(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span>People, Ownership &amp; Collaboration Hub</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              MODULE B
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Who-Owes-What dashboard, contact timelines, RACI matrix, polite follow-ups, and delegation tracking.
          </p>
        </div>

        {/* Contact Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Filter Contact:</span>
          <select
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
          >
            <option value="all">All Contacts ({contacts.length})</option>
            {contacts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('who_owes_what')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'who_owes_what'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Who-Owes-What
        </button>
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Contact Timeline
        </button>
        <button
          onClick={() => setActiveSubTab('follow_ups')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'follow_ups'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Follow-Up Generator ({followUpDrafts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('raci')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'raci'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Team RACI Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('delegation')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'delegation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Delegation &amp; Handoff
        </button>
      </div>

      {/* Sub Tab 1: Who-Owes-What Dashboard */}
      {activeSubTab === 'who_owes_what' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: What I/Selected Owe to Others */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-amber-400" />
                Promises Owed to Others ({myCommitments.length})
              </h3>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Outgoing Deliverables
              </span>
            </div>

            <div className="space-y-2.5">
              {myCommitments.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  No outgoing deliverables found for this contact.
                </div>
              ) : (
                myCommitments.map((cmt) => (
                  <div
                    key={cmt.id}
                    onClick={() => onOpenDetails(cmt)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className="text-amber-300 font-semibold">
                        Owed to: {cmt.waitingPerson}
                      </span>
                      <span className="text-blue-400">
                        {cmt.deadlineOriginal || 'Open'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white mb-1">
                      {cmt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {cmt.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: What Others Owe to Me */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                Promises Owed to Me / Team ({owedToMe.length})
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Incoming Deliverables
              </span>
            </div>

            <div className="space-y-2.5">
              {owedToMe.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  No incoming deliverables found for this contact.
                </div>
              ) : (
                owedToMe.map((cmt) => (
                  <div
                    key={cmt.id}
                    onClick={() => onOpenDetails(cmt)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className="text-emerald-300 font-semibold">
                        Committed by: {cmt.owner}
                      </span>
                      <span className="text-blue-400">
                        {cmt.deadlineOriginal || 'Open'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white mb-1">
                      {cmt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {cmt.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Contact-Based Commitment Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Contact Commitment Timelines
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Chronological Action Register
            </span>
          </div>

          <div className="space-y-6">
            {contacts.map((contact) => {
              const contactCommitments = commitments.filter(
                (c) => c.owner === contact || c.waitingPerson === contact
              );

              return (
                <div key={contact} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs font-mono">
                        {contact.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{contact}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {contactCommitments.length} Active Promises
                    </span>
                  </div>

                  <div className="border-l-2 border-slate-800 ml-3 pl-4 space-y-3">
                    {contactCommitments.map((cmt) => (
                      <div key={cmt.id} className="relative text-xs">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-400" />
                        <div className="font-semibold text-slate-200">{cmt.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Deadline: {cmt.deadlineOriginal || 'Open'}</span>
                          <span>•</span>
                          <span className="text-amber-400">
                            {cmt.owner === contact ? 'Role: Delivering' : 'Role: Receiving'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Polite Follow-Up Generator */}
      {activeSubTab === 'follow_ups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUpDrafts.map((draft, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md text-left"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2 font-mono">
                  <span className="text-indigo-300 font-bold">To: {draft.recipient}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    draft.tone === 'urgent_escalation'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {draft.tone.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-2 font-sans">
                  Subject: {draft.subject}
                </div>

                <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                  {draft.body}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-500">
                  Ready for email or Slack
                </span>
                <button
                  onClick={() => handleCopyDraft(`${draft.subject}\n\n${draft.body}`, idx)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDraftIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedDraftIdx === idx ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 4: Team Responsibility Matrix (RACI) */}
      {activeSubTab === 'raci' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md overflow-x-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Team Responsibility Assignment Matrix (RACI)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Responsible, Accountable, Consulted, Informed
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3 text-emerald-400">Responsible (R)</th>
                <th className="py-2.5 px-3 text-amber-400">Accountable (A)</th>
                <th className="py-2.5 px-3 text-blue-400">Consulted (C)</th>
                <th className="py-2.5 px-3 text-slate-400">Informed (I)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {raciList.map((row) => (
                <tr key={row.name} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>{row.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{row.role}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {row.responsible.length > 0 ? row.responsible.join(', ') : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {row.accountable.length > 0 ? row.accountable.join(', ') : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {row.consulted.length > 0 ? row.consulted.join(', ') : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {row.informed.length > 0 ? row.informed.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub Tab 5: Delegation & Handoff */}
      {activeSubTab === 'delegation' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
                Delegation Tracking &amp; Task Handoffs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explicit reassignments requiring recipient acknowledgment before transferring ownership.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Controlled Handoff
            </span>
          </div>

          <div className="space-y-3">
            {commitments.slice(0, 3).map((cmt) => (
              <div key={cmt.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span>Assigned to: <strong className="text-amber-300">{cmt.owner}</strong></span>
                    <span>➔</span>
                    <span>Target: {cmt.waitingPerson}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    {cmt.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToast(`Delegation request sent to ${cmt.waitingPerson}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Delegate to {cmt.waitingPerson}
                  </button>
                  <button
                    onClick={() => onToast(`Commitment acknowledgment confirmed by ${cmt.owner}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
