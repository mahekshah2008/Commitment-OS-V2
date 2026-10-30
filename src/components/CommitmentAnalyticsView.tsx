import React from 'react';
import { CommitmentItem, CommitmentHeatmapDay, CommitmentCategoryBreakdown } from '../utils/types';
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  PieChart, 
  Sparkles,
  ShieldCheck,
  Target
} from 'lucide-react';

interface CommitmentAnalyticsViewProps {
  commitments: CommitmentItem[];
  onOpenDetails: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const CommitmentAnalyticsView: React.FC<CommitmentAnalyticsViewProps> = ({
  commitments,
  onOpenDetails,
  onToast,
}) => {
  // Category breakdown calculation
  const categories: CommitmentCategoryBreakdown[] = [
    {
      category: 'operations',
      count: commitments.filter((c) => c.category === 'operations' || !c.category).length,
      onTimeRate: 94,
      color: 'bg-blue-500',
    },
    {
      category: 'legal',
      count: commitments.filter((c) => c.category === 'legal').length,
      onTimeRate: 100,
      color: 'bg-rose-500',
    },
    {
      category: 'technical',
      count: commitments.filter((c) => c.category === 'technical').length,
      onTimeRate: 88,
      color: 'bg-emerald-500',
    },
    {
      category: 'product',
      count: commitments.filter((c) => c.category === 'product').length,
      onTimeRate: 92,
      color: 'bg-amber-500',
    },
    {
      category: 'client',
      count: commitments.filter((c) => c.category === 'client').length,
      onTimeRate: 96,
      color: 'bg-purple-500',
    },
  ];

  // Heatmap generation across Weekdays (Mon - Sun) & Business Hours (9 AM - 5 PM)
  const days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [9, 11, 13, 15, 17];

  const heatmap: CommitmentHeatmapDay[] = days.map((day, dIdx) => ({
    dayOfWeek: day,
    slots: hours.map((hour, hIdx) => {
      // Create realistic density distribution
      let count = 0;
      let riskCount = 0;
      if (day === 'Thu' || day === 'Fri') {
        count = (dIdx + hIdx) % 3 + 1;
        if (day === 'Fri' && hour === 17) riskCount = 2;
      } else if (day === 'Wed') {
        count = 2;
      } else if (day !== 'Sat' && day !== 'Sun') {
        count = (dIdx + hIdx) % 2;
      }
      return { hour, count, riskCount };
    }),
  }));

  const totalAssessed = commitments.length;
  const onTimePercentage = 92;
  const averageFulfillmentHours = 18.5;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span>Commitment Analytics &amp; Deep Productivity Insights</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
              MODULE D
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Commitment heatmaps, category breakdown, deadline accuracy variance, and bottleneck diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
            Accuracy Score: {onTimePercentage}%
          </span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-emerald-400" /> Deadline Accuracy
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {onTimePercentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Promises delivered strictly on or before stated date.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" /> Avg Cycle Time
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {averageFulfillmentHours}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Time elapsed from verbal undertaking to deliverable completion.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Congestion Point
          </div>
          <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">
            Friday 5 PM
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Peak deadline convergence requiring proactive load rebalancing.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Quality Index
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            9.4 / 10
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Based on clarity, attribution certainty, and recipient sign-off.
          </p>
        </div>
      </div>

      {/* Commitment Heatmap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Commitment Schedule Heatmap (Congestion by Day &amp; Hour)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies overloaded hours and imminent deadline risk clusters across the week.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
              <span>Free</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500/60" />
              <span>Critical Cluster</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-2 mb-2 text-center text-xs font-mono text-slate-400">
              <div className="text-left pl-2 font-bold">Day</div>
              {hours.map((h) => (
                <div key={h}>{h > 12 ? `${h - 12} PM` : `${h} AM`}</div>
              ))}
            </div>

            {/* Day rows */}
            {heatmap.map((d) => (
              <div key={d.dayOfWeek} className="grid grid-cols-6 gap-2 mb-2 items-center text-xs font-mono">
                <div className="font-bold text-slate-300 pl-2">{d.dayOfWeek}</div>
                {d.slots.map((s, idx) => (
                  <div
                    key={idx}
                    className={`h-10 rounded-lg border flex items-center justify-center font-bold transition-all cursor-pointer ${
                      s.riskCount > 0
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 ring-1 ring-rose-500/40'
                        : s.count >= 2
                        ? 'bg-blue-600/30 border-blue-500/40 text-blue-200'
                        : s.count === 1
                        ? 'bg-blue-950/30 border-blue-900/40 text-slate-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    onClick={() => {
                      if (s.count > 0) {
                        onToast(`${d.dayOfWeek} at ${s.hour}:00 — ${s.count} commitment(s)${s.riskCount ? ` (${s.riskCount} high risk)` : ''}`);
                      }
                    }}
                  >
                    {s.count > 0 ? s.count : '—'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Row: Categories & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Category Breakdown */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-400" />
              Commitment Category Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">
              5 Functional Domains
            </span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const share = totalAssessed > 0 ? Math.round((cat.count / totalAssessed) * 100) : 20;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="capitalize text-slate-200 font-semibold">{cat.category}</span>
                    <span className="text-slate-400">
                      {cat.count} items ({share}%) • {cat.onTimeRate}% on-time
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cat.color}`}
                      style={{ width: `${Math.max(8, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Bottleneck Diagnostics */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Recurring Bottleneck Diagnostics
            </h3>
            <span className="text-xs font-mono text-rose-400 font-bold">
              Root Cause
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30">
              <div className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Upstream Legal Prerequisite Delays
              </div>
              <p className="text-slate-300 leading-relaxed">
                Commitments involving contractual review or NDA release average 1.8 days longer to resolve due to legal sign-off dependencies.
              </p>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Recommendation: Trigger legal approval requests immediately at call conclusion.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> End-of-Week Deadline Clustering
              </div>
              <p className="text-slate-300 leading-relaxed">
                Over 60% of all verbal promises are informally assigned to &ldquo;Friday afternoon&rdquo;, causing bandwidth contention.
              </p>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Recommendation: Utilize the Intelligent Rescheduling Agent to shift non-blocking deliverables to mid-week.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
