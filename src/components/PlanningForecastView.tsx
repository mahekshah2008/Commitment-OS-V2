import React, { useState } from 'react';
import { PlatformAnalytics, CommitmentItem } from '../utils/types';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  GitBranch, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw,
  MoveRight
} from 'lucide-react';

interface PlanningForecastViewProps {
  analytics?: PlatformAnalytics;
  commitments: CommitmentItem[];
  onOpenDetails: (item: CommitmentItem) => void;
  onUpdateCommitmentDate: (id: string, newDateIso: string) => void;
  onToast: (msg: string) => void;
}

export const PlanningForecastView: React.FC<PlanningForecastViewProps> = ({
  analytics,
  commitments,
  onOpenDetails,
  onUpdateCommitmentDate,
  onToast,
}) => {
  const [selectedChainId, setSelectedChainId] = useState<string>('chain-1');

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        Computing 7-day workload forecast and dependency graph...
      </div>
    );
  }

  const { workloadForecast, chains } = analytics;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 7-Day Commitment Load Forecast */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              7-Day Commitment Load Forecast (Capacity Allocation)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Workload estimation based on commitments and standard 8.0h daily focus capacity.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            Reference Week: Oct 28 – Nov 03, 2026
          </span>
        </div>

        {/* 7 Day Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {workloadForecast.map((day) => {
            const loadPercent = Math.min(100, Math.round((day.totalEstimatedHours / day.capacityHours) * 100));
            const isOver = day.isOverloaded || day.totalEstimatedHours >= day.capacityHours;

            return (
              <div
                key={day.date}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isOver
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : loadPercent >= 70
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono text-slate-400 font-semibold mb-1">
                    {day.label}
                  </div>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className={`text-xl font-mono font-bold ${
                      isOver ? 'text-rose-400' : 'text-white'
                    }`}>
                      {day.totalEstimatedHours}h
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      / {day.capacityHours}h
                    </span>
                  </div>
                </div>

                <div className="my-2">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : loadPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>{loadPercent}% Cap</span>
                    {isOver && <span className="text-rose-400 font-bold">Overloaded!</span>}
                  </div>
                </div>

                {/* Day Commitments count */}
                <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>{day.commitments.length} Tasks</span>
                  {isOver && (
                    <span className="text-amber-400 text-[10px] flex items-center gap-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" /> Adjust
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Dependency Mapping & Commitment Chains */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dependency Mapping */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-amber-400" />
                Dependency Mapping &amp; Blockers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upstream conditions, stakeholder handoffs, and prerequisite tasks.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {commitments.filter(c => c.dependencyNode?.type !== 'independent').length} Dependencies
            </span>
          </div>

          <div className="space-y-3">
            {commitments.map((cmt) => {
              const dep = cmt.dependencyNode;
              const hasDep = dep && dep.type !== 'independent';

              return (
                <div
                  key={cmt.id}
                  className={`p-3.5 rounded-xl border text-left ${
                    hasDep
                      ? 'bg-amber-950/15 border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1 font-mono">
                    <span className="text-white font-semibold line-clamp-1">{cmt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      hasDep ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {dep?.type.replace(/_/g, ' ') || 'Independent'}
                    </span>
                  </div>

                  {hasDep ? (
                    <div className="text-xs text-slate-300 mt-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>
                          Waiting for approval / delivery from <strong className="text-amber-300">{dep.targetEntity}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onToast(`Marked dependency for "${cmt.title}" as resolved`);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-colors cursor-pointer shrink-0"
                      >
                        Resolve
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>Self-contained execution; zero blocking upstream tasks.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Commitment Chains & Intelligent Rescheduling */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Commitment Chains */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Commitment Chains (Sequential Pipelines)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-phase handoffs where downstream promises depend on earlier delivery.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CRITICAL PATH
              </span>
            </div>

            {chains.map((chain) => (
              <div key={chain.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{chain.name}</span>
                  <span className="text-xs font-mono text-indigo-300">
                    Step {chain.currentStepIndex + 1} of {chain.stepIds.length}
                  </span>
                </div>

                {/* Steps sequence */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {chain.stepIds.map((stepId, idx) => {
                    const stepItem = commitments.find((c) => c.id === stepId);
                    const isPassed = idx < chain.currentStepIndex;
                    const isCurrent = idx === chain.currentStepIndex;

                    return (
                      <React.Fragment key={stepId}>
                        <div className={`p-2.5 rounded-lg border text-xs min-w-[140px] shrink-0 font-mono ${
                          isCurrent
                            ? 'bg-amber-950/30 border-amber-500 text-amber-200'
                            : isPassed
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <div className="text-[10px] text-slate-500 font-bold mb-0.5">
                            Phase {idx + 1}
                          </div>
                          <div className="truncate font-semibold text-slate-200">
                            {stepItem?.title || `Deliverable ${idx + 1}`}
                          </div>
                        </div>

                        {idx < chain.stepIds.length - 1 && (
                          <MoveRight className="h-4 w-4 text-slate-600 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Intelligent Rescheduling Agent Recommendations */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Intelligent Rescheduling Agent
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Streak Safe
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Friday is currently at <strong className="text-rose-400">7.5 hours</strong> (94% capacity). 
              The agent recommends rebalancing non-blocking deliverables to preserve your 14-day reliability streak.
            </p>

            {commitments.slice(0, 2).map((cmt) => {
              const resched = cmt.reschedulingSuggestion;
              if (!resched) return null;

              return (
                <div key={cmt.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-900/40 text-left">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{cmt.title}</span>
                    <span className="font-mono text-blue-400 text-[11px]">
                      ➔ {new Date(resched.suggestedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">
                    {resched.reason}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[11px] font-mono text-emerald-400">
                      Downstream impact: None
                    </span>
                    <button
                      onClick={() => {
                        onUpdateCommitmentDate(cmt.id, resched.suggestedDate);
                        onToast(`Rescheduled "${cmt.title}" to ${new Date(resched.suggestedDate).toLocaleDateString()}! Streak protected.`);
                      }}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Accept Proactive Reschedule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
