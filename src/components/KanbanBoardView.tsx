import React, { useState } from 'react';
import { CommitmentItem, CommitmentStatus, CommitmentPriority } from '../utils/types';
import { 
  Columns, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  User, 
  Filter
} from 'lucide-react';

interface KanbanBoardViewProps {
  commitments: CommitmentItem[];
  onToggleStatus: (id: string, status: CommitmentStatus) => void;
  onOpenDetails: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  commitments,
  onToggleStatus,
  onOpenDetails,
  onToast,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  const filtered = commitments.filter((c) => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterOwner !== 'all' && c.owner !== filterOwner) return false;
    return true;
  });

  const columns: Array<{
    id: CommitmentStatus;
    label: string;
    description: string;
    badgeColor: string;
    items: CommitmentItem[];
  }> = [
    {
      id: 'detected',
      label: 'Pending Review',
      description: 'Extracted promises requiring owner confirmation',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      items: filtered.filter((c) => c.status === 'detected' || c.status === 'needs_clarification'),
    },
    {
      id: 'confirmed',
      label: 'Planned / Confirmed',
      description: 'Scheduled on calendar or sprint backlog',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      items: filtered.filter((c) => c.status === 'confirmed' || c.status === 'planned' || c.status === 'active'),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description: 'Currently in focus or execution',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      items: filtered.filter((c) => c.status === 'in_progress'),
    },
    {
      id: 'rescheduled',
      label: 'Rescheduled',
      description: 'Proactively renegotiated (streak protected)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      items: filtered.filter((c) => c.status === 'rescheduled'),
    },
    {
      id: 'completed',
      label: 'Completed',
      description: 'Delivered and verified',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      items: filtered.filter((c) => c.status === 'completed'),
    },
  ];

  const owners = Array.from(new Set(commitments.map((c) => c.owner).filter(Boolean)));

  const handleMove = (id: string, nextStatus: CommitmentStatus) => {
    onToggleStatus(id, nextStatus);
    onToast(`Commitment moved to "${nextStatus.replace(/_/g, ' ')}"`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-left">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Columns className="h-5 w-5 text-amber-400" />
            <span>Interactive Commitment Board (Kanban Workflow)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              MODULE E
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track commitments across lifecycle stages with keyboard and 1-click stage progression.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="all">All</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex overflow-x-auto gap-4 items-start pb-4 min-w-0">
        {columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 w-64 min-w-[240px] shrink-0"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {col.label}
                </h3>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {col.description}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${col.badgeColor}`}>
                {col.items.length}
              </span>
            </div>

            {/* Cards in Column */}
            <div className="space-y-2.5 min-h-[350px]">
              {col.items.length === 0 ? (
                <div className="p-6 text-center text-slate-600 text-[11px] font-mono">
                  No items
                </div>
              ) : (
                col.items.map((cmt) => (
                  <div
                    key={cmt.id}
                    onClick={() => onOpenDetails(cmt)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer shadow-md text-left group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-amber-300 font-bold truncate max-w-[110px]">
                        {cmt.owner}
                      </span>
                      <span className={`uppercase font-bold ${
                        cmt.priority === 'critical' ? 'text-rose-400' :
                        cmt.priority === 'high' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {cmt.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-2 mb-1.5 leading-snug">
                      {cmt.title}
                    </h4>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span className="truncate max-w-[120px]">
                        {cmt.deadlineOriginal || (cmt.date_time ? new Date(cmt.date_time).toLocaleDateString() : 'Open')}
                      </span>

                      {/* Quick Shift buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {colIdx > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(cmt.id, columns[colIdx - 1].id);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Move back"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {colIdx < columns.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(cmt.id, columns[colIdx + 1].id);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Move forward"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
