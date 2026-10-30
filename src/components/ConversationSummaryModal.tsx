import React from 'react';
import { ConversationSummary } from '../utils/types';
import { 
  FileText, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Calendar, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface ConversationSummaryModalProps {
  summary: ConversationSummary | undefined;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onToast: (msg: string) => void;
}

export const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  summary,
  isOpen,
  onClose,
  onRegenerate,
  isRegenerating,
  onToast,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !summary) return null;

  const handleCopySummary = () => {
    const text = `=== CommitmentOS_V2 Smart Conversation Summary ===

KEY DECISIONS:
${summary.keyDecisions.map(d => `• ${d}`).join('\n')}

ACTION ITEMS & DEADLINES:
${summary.actionItems.map(a => `• ${a.task} (Owner: ${a.owner}, Due: ${a.deadline})`).join('\n')}

BLOCKERS & RISKS:
${summary.blockersAndRisks.map(b => `• ${b}`).join('\n')}

UNRESOLVED QUESTIONS:
${summary.unresolvedQuestions.map(q => `• ${q}`).join('\n')}

NEXT STEPS:
${summary.nextSteps.map(n => `• ${n}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast('Full conversation summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Smart Conversation Summary</h2>
              <p className="text-xs text-slate-400">Synthesized key decisions, ownership, deadlines &amp; blockers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate Summary"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Decisions */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Key Decisions Agreed Upon ({summary.keyDecisions.length})</span>
            </div>
            {summary.keyDecisions.length > 0 ? (
              <ul className="space-y-1.5 pl-2">
                {summary.keyDecisions.map((dec, i) => (
                  <li key={i} className="text-slate-200 text-xs sm:text-sm bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{dec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic pl-2">No definitive decisions identified.</p>
            )}
          </div>

          {/* Action Items & Deadlines */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Commitments &amp; Action Items ({summary.actionItems.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {summary.actionItems.map((item, i) => (
                <div key={i} className="bg-slate-950/70 p-3 rounded-lg border border-blue-900/40 text-xs flex flex-col justify-between gap-1">
                  <span className="font-semibold text-slate-200">{item.task}</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="text-amber-300">Owner: {item.owner}</span>
                    <span className="text-blue-300">{item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockers & Risks */}
          {summary.blockersAndRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Identified Blockers &amp; Risks ({summary.blockersAndRisks.length})</span>
              </div>
              <ul className="space-y-1.5 pl-2">
                {summary.blockersAndRisks.map((blocker, i) => (
                  <li key={i} className="text-slate-300 text-xs bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">!</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unresolved Questions */}
          {summary.unresolvedQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <HelpCircle className="h-4 w-4" />
                <span>Unresolved Questions ({summary.unresolvedQuestions.length})</span>
              </div>
              <ul className="space-y-1.5 pl-2">
                {summary.unresolvedQuestions.map((q, i) => (
                  <li key={i} className="text-slate-300 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {summary.nextSteps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <ArrowRight className="h-4 w-4 text-amber-400" />
                <span>Immediate Next Steps</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {summary.nextSteps.map((step, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-950/50 p-2 rounded border border-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Grounded in conversation transcript evidence</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
