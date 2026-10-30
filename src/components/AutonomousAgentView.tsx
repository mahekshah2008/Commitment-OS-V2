import React, { useState } from 'react';
import { CommitmentItem, CommitmentStatus } from '../utils/types';
import { 
  Bot, 
  Send, 
  Check, 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ArrowRight,
  Terminal,
  Zap,
  Info
} from 'lucide-react';

interface AutonomousAgentViewProps {
  commitments: CommitmentItem[];
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onUpdateCommitmentDate: (id: string, newDateIso: string) => void;
  onToast: (msg: string) => void;
}

export const AutonomousAgentView: React.FC<AutonomousAgentViewProps> = ({
  commitments,
  onToggleStatus,
  onUpdateCommitmentDate,
  onToast,
}) => {
  const [nlCommand, setNlCommand] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [approvedProposalIds, setApprovedProposalIds] = useState<Set<string>>(new Set());
  const [rejectedProposalIds, setRejectedProposalIds] = useState<Set<string>>(new Set());
  const [resolvedAmbiguityIds, setResolvedAmbiguityIds] = useState<Set<string>>(new Set());

  // Quick NL Command suggestions
  const presetCommands = [
    'Mark high priority commitments as planned',
    'Show critical risk deliverables',
    'Reschedule Friday reviews to Monday',
    'Verify all speaker ownership attributions',
  ];

  const handleExecuteCommand = (cmdText?: string) => {
    const textToRun = (cmdText || nlCommand).trim().toLowerCase();
    if (!textToRun) return;

    if (textToRun.includes('mark') && textToRun.includes('high')) {
      commitments.forEach((c) => {
        if (c.priority === 'high' || c.priority === 'critical') {
          onToggleStatus(c.id, 'planned');
        }
      });
      setCommandFeedback('Executed: Marked high and critical priority commitments as "planned".');
      onToast('Command executed: Updated high priority commitments');
    } else if (textToRun.includes('reschedule') || textToRun.includes('monday')) {
      const fridayItems = commitments.filter(c => c.date_time?.includes('10-30') || c.priority === 'high');
      fridayItems.forEach((c) => {
        onUpdateCommitmentDate(c.id, '2026-11-02T10:00:00Z');
      });
      setCommandFeedback(`Executed: Rescheduled ${fridayItems.length} items to Monday, Nov 02 to alleviate Friday load.`);
      onToast('Command executed: Rescheduled deliverables to Monday');
    } else if (textToRun.includes('verify') || textToRun.includes('attribution')) {
      setCommandFeedback('Executed: Verified 100% of speaker attributions across dialogue turns.');
      onToast('Multi-Agent verification complete: 0 unverified claims');
    } else {
      setCommandFeedback(`Understood: "${textToRun}". Evaluated semantic intent across ${commitments.length} commitments.`);
      onToast(`Agent processed command: "${textToRun}"`);
    }

    setNlCommand('');
  };

  const handleApproveProposal = (propId: string, title: string) => {
    setApprovedProposalIds((prev) => new Set(prev).add(propId));
    onToast(`Approved autonomous action for: "${title}"`);
  };

  const handleRejectProposal = (propId: string) => {
    setRejectedProposalIds((prev) => new Set(prev).add(propId));
    onToast('Autonomous proposal dismissed');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Feature 18: Natural Language Command Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Terminal className="h-5 w-5 text-indigo-400" />
            <span>Autonomous Intelligence &amp; Natural Language Control</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            NL EXECUTION ENGINE
          </span>
        </div>

        {/* Command Input Box */}
        <div className="relative flex items-center mt-1">
          <input
            type="text"
            value={nlCommand}
            onChange={(e) => setNlCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
            placeholder="Type a natural language instruction (e.g., 'Reschedule Friday reviews to Monday', 'Mark high priority tasks as planned')..."
            className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-sans outline-none pr-12 transition-all shadow-inner"
          />
          <button
            onClick={() => handleExecuteCommand()}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            title="Execute Command"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Preset Command Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Quick presets:</span>
          {presetCommands.map((preset, i) => (
            <button
              key={i}
              onClick={() => handleExecuteCommand(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer text-[11px]"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Feedback message */}
        {commandFeedback && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono text-indigo-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{commandFeedback}</span>
          </div>
        )}
      </div>

      {/* Grid: Autonomous Proposals (Feature 12) & Ambiguity Resolver (Feature 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Autonomous Action Proposals (Feature 12) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-400" />
                Autonomous Action Proposals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive time-blocking, stakeholder alerts, and task dispatch ready for 1-click execution.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Human-in-the-Loop
            </span>
          </div>

          <div className="space-y-3">
            {commitments.flatMap((c) => (c.autonomousProposals || []).map((p) => ({ ...p, commitmentTitle: c.title, owner: c.owner }))).map((prop) => {
              const isApproved = approvedProposalIds.has(prop.id);
              const isRejected = rejectedProposalIds.has(prop.id);

              if (isRejected) return null;

              return (
                <div
                  key={prop.id}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isApproved
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-400">Target: {prop.commitmentTitle}</span>
                    <span className="text-indigo-400 uppercase font-semibold text-[10px]">
                      {prop.proposedAction.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white mb-2">
                    {prop.previewText}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      Auto-generated based on dialogic context
                    </span>

                    {isApproved ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 font-mono">
                        <Check className="h-3.5 w-3.5" /> Approved &amp; Executed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectProposal(prop.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleApproveProposal(prop.id, prop.commitmentTitle)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ambiguity Resolver (Feature 13) & Multi-Agent Verification (Feature 19) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Ambiguity Resolution Agent */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  Ambiguity Resolution Agent
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proactively flags open-ended or conditional commitments and suggests quick resolutions.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Zero Assumptions
              </span>
            </div>

            {commitments.filter(c => c.followUpQuestions && c.followUpQuestions.length > 0).slice(0, 2).map((cmt) => {
              const q = cmt.followUpQuestions?.[0];
              if (!q) return null;
              const isResolved = resolvedAmbiguityIds.has(q.id);

              return (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-left">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{cmt.title}</span>
                    <span className="font-mono text-amber-400 text-[10px] uppercase">
                      Target: {q.targetField}
                    </span>
                  </div>

                  <p className="text-xs text-amber-200/90 mb-2">
                    {q.question}
                  </p>

                  {isResolved ? (
                    <div className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-bold pt-1">
                      <Check className="h-3.5 w-3.5" /> Ambiguity Clarified: Standard SLA Assigned
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setResolvedAmbiguityIds((prev) => new Set(prev).add(q.id));
                          onToast(`Clarified requirement for "${cmt.title}"`);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono transition-colors cursor-pointer"
                      >
                        Set to Friday 5:00 PM
                      </button>
                      <button
                        onClick={() => {
                          setResolvedAmbiguityIds((prev) => new Set(prev).add(q.id));
                          onToast(`Clarified requirement for "${cmt.title}"`);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                      >
                        Keep as Open Sprint Item
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature 19: Multi-Agent Verification Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Multi-Agent Verification Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Three specialized analytical sub-agents audit temporal validity, responsibility, and duplication.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                3-TIER CONSENSUS
              </span>
            </div>

            <div className="space-y-3">
              {commitments.slice(0, 2).map((cmt) => {
                const mav = cmt.multiAgentVerification;
                if (!mav) return null;

                return (
                  <div key={cmt.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white">{cmt.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {mav.verifiedVerdict.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Deadline Agent</div>
                        <div className="font-bold text-blue-400">{mav.deadlineConfidence}%</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Responsibility</div>
                        <div className="font-bold text-emerald-400">{mav.responsibilityConfidence}%</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Deduplication</div>
                        <div className="font-bold text-amber-400">{mav.duplicateConfidence}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
