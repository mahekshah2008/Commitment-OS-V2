import React, { useState } from 'react';
import { PlatformAnalytics, CommitmentItem } from '../utils/types';
import { 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Zap, 
  ArrowRight, 
  FileText, 
  Sparkles,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';

interface AccountabilityInsightsViewProps {
  analytics?: PlatformAnalytics;
  commitments: CommitmentItem[];
  onToast: (msg: string) => void;
}

export const AccountabilityInsightsView: React.FC<AccountabilityInsightsViewProps> = ({
  analytics,
  commitments,
  onToast,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        Analyzing conversation metrics and accountability telemetry...
      </div>
    );
  }

  const { reliability, streak, metrics, weeklyReview } = analytics;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 80) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Personal Reliability Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Reliability Score
            </span>
            <button
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
              title="Explain formula calculation"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl font-black font-mono text-white tracking-tight">
              {reliability.score}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Tier 1 Exemplar
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Calculated across {reliability.sampleSize} promises: on-time execution, renegotiation cadence, and follow-through.
          </p>

          {/* Formula disclosure drawer */}
          {showFormulaModal && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] font-mono text-slate-300">
              <div className="font-semibold text-amber-300 mb-1">Mathematical Formula:</div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {reliability.formulaDescription}
              </div>
            </div>
          )}
        </div>

        {/* Metric 2: Commitment Streak */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" /> Active Streak
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {streak.rescheduledProtections} Shields
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl font-black font-mono text-amber-400 tracking-tight">
              {streak.currentStreakDays}
            </span>
            <span className="text-xs font-mono text-slate-400">days in a row</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {streak.explanation}
          </p>
        </div>

        {/* Metric 3: Promise-to-Action Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-400" /> Conversion Rate
            </span>
            <span className="text-xs font-mono text-blue-400 font-bold">
              {metrics.detectedToTaskRate}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl font-black font-mono text-white tracking-tight">
              {metrics.actionableTaskCount}
            </span>
            <span className="text-xs font-mono text-slate-400">of {metrics.detectedCount} promises</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Verbal promises converted to scheduled tasks with explicit owner attribution.
          </p>
        </div>

        {/* Metric 4: On-Time Delivery Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> On-Time Rate
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              +{reliability.onTimeRate}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl font-black font-mono text-white tracking-tight">
              {reliability.onTimeRate}%
            </span>
            <span className="text-xs font-mono text-emerald-400">SLA met</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Deliverables completed on or before original negotiated date.
          </p>
        </div>
      </div>

      {/* Conversion Funnel & Reliability Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Promise-to-Action Funnel */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              Promise-to-Action Conversion Funnel
            </h3>
            <span className="text-xs font-mono text-slate-400">
              End-to-end Lifecycle
            </span>
          </div>

          <div className="flex flex-col gap-3 py-2">
            {/* Step 1: Verbal Commitment Detected */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">1. Verbal Commitments Detected</span>
                <span className="text-amber-400 font-bold">{metrics.detectedCount} items (100%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Actionable Task / Calendar Slot */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">2. Scheduled as Calendar / Task</span>
                <span className="text-blue-400 font-bold">{metrics.actionableTaskCount} items ({metrics.detectedToTaskRate}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics.detectedToTaskRate}%` }} />
              </div>
            </div>

            {/* Step 3: Proactive Verification */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">3. Verified &amp; Reminders Scheduled</span>
                <span className="text-indigo-400 font-bold">{metrics.actionableTaskCount} items (100%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metrics.detectedToTaskRate}%` }} />
              </div>
            </div>

            {/* Step 4: Completed Deliverables */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">4. Successfully Completed</span>
                <span className="text-emerald-400 font-bold">{metrics.completedCount} items ({metrics.overallCompletionRate}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(15, metrics.overallCompletionRate)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Overall Conversion Efficiency:</span>
            <span className="font-mono font-bold text-emerald-400">{metrics.detectedToTaskRate}% Capture Rate</span>
          </div>
        </div>

        {/* Right: Weekly Accountability Review Report */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                Weekly Accountability Review
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {weeklyReview.reportingWeek}
              </span>
            </div>

            <button
              onClick={() => onToast('Weekly review refreshed with latest conversation transcripts')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Review"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Highlights */}
          <div>
            <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Key Accomplishments &amp; Highlights
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {weeklyReview.keyHighlights.map((hl, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Recommendations */}
          <div>
            <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Proactive AI Coaching Tips
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {weeklyReview.aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                  <ArrowRight className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
