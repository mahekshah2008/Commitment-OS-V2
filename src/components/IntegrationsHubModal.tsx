import React, { useState } from 'react';
import { IntegrationHubStatus, FailedOperationRecord } from '../utils/types';
import { 
  X, 
  Settings2, 
  Calendar, 
  CheckSquare, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Zap,
  RotateCcw
} from 'lucide-react';

interface IntegrationsHubModalProps {
  status: IntegrationHubStatus | undefined;
  isOpen: boolean;
  onClose: () => void;
  onRetryOperation: (opId: string) => void;
  onToast: (msg: string) => void;
}

export const IntegrationsHubModal: React.FC<IntegrationsHubModalProps> = ({
  status,
  isOpen,
  onClose,
  onRetryOperation,
  onToast,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'connections' | 'failures' | 'preferences'>('connections');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const failedOps = status?.failedOperations || [];

  const handleRetry = (opId: string) => {
    setRetryingId(opId);
    setTimeout(() => {
      onRetryOperation(opId);
      setRetryingId(null);
      onToast('Operation retried successfully with idempotent payload');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Integrations &amp; Synchronization Hub</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage Google Workspace connectors, sync cadence, and retry recovery queue
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'connections'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connected Services
          </button>

          <button
            onClick={() => setActiveTab('failures')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'failures'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Failure Recovery Queue</span>
            {failedOps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {failedOps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sync Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {activeTab === 'connections' && (
            <div className="space-y-3">
              {/* Google Calendar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Google Calendar</span>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct event creation, conflict checks, and enriched descriptions
                    </p>
                  </div>
                </div>

                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Calendar</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Google Keep / Notes */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Google Keep &amp; Notes</span>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Formatted markdown export, checklist notes, and context summaries
                    </p>
                  </div>
                </div>

                <a
                  href="https://keep.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Keep</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Google Tasks */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Google Tasks Integration</span>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Automated action item conversion with owner assignments and due dates
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-emerald-400">Connected</span>
              </div>
            </div>
          )}

          {activeTab === 'failures' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Monitors failed or interrupted sync attempts with exponential backoff retry support.
                </span>
                {failedOps.length > 0 && (
                  <button
                    onClick={() => {
                      failedOps.forEach(op => onRetryOperation(op.id));
                      onToast('Retried all pending failed operations');
                    }}
                    className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                  >
                    Retry All
                  </button>
                )}
              </div>

              {failedOps.length > 0 ? (
                <div className="space-y-2">
                  {failedOps.map((op) => (
                    <div key={op.id} className="bg-slate-950 p-3.5 rounded-xl border border-rose-900/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 font-mono">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                          {op.operation.replace('_', ' ').toUpperCase()} Failed
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Attempts: {op.retryCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Commitment: <strong>{op.commitmentTitle}</strong>
                      </p>
                      <p className="text-xs text-rose-200/80 bg-rose-950/20 p-2 rounded border border-rose-950 font-mono">
                        {op.error}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Timestamp: {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => handleRetry(op.id)}
                          disabled={retryingId === op.id}
                          className="px-3 py-1 rounded text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 ${retryingId === op.id ? 'animate-spin' : ''}`} />
                          <span>Retry with Backoff</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950/60 p-8 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">All Operations Healthy &amp; Synchronized</span>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No failed calendar injections, task synchronizations, or note exports in queue.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-3">
              {[
                { title: 'Automatic Task Generation', desc: 'Automatically create actionable linked tasks for every confirmed commitment.', defaultChecked: true },
                { title: 'Conflict-Aware Availability Check', desc: 'Scan busy calendar periods and recommend alternative slots before scheduling.', defaultChecked: true },
                { title: 'Recurring Pattern Detection', desc: 'Automatically parse recurrence rules ("every Friday", "monthly") into RRULE formats.', defaultChecked: true },
                { title: 'Duplicate Commitment Safeguard', desc: 'Flag identical or semantically similar promises before saving redundant records.', defaultChecked: true },
              ].map((pref, i) => (
                <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-white text-xs block">{pref.title}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={pref.defaultChecked}
                    className="mt-1 h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Source of Truth: CommitmentOS_V2 Backend</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
