import React, { useState } from 'react';
import { CommitmentItem, LinkedTask } from '../utils/types';
import { 
  CheckSquare, 
  X, 
  Calendar, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LinkedTasksModalProps {
  commitments: CommitmentItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTaskStatus: (commitmentId: string, newStatus: 'todo' | 'in_progress' | 'completed') => void;
  onOpenCommitment: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const LinkedTasksModal: React.FC<LinkedTasksModalProps> = ({
  commitments,
  isOpen,
  onClose,
  onUpdateTaskStatus,
  onOpenCommitment,
  onToast,
}) => {
  if (!isOpen) return null;

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

  // Extract all linked tasks
  const tasks: Array<{ task: LinkedTask; commitment: CommitmentItem }> = [];
  commitments.forEach((c) => {
    if (c.linkedTask) {
      tasks.push({ task: c.linkedTask, commitment: c });
    }
  });

  const filteredTasks = tasks.filter(({ task }) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleLaunchGoogleTasks = () => {
    window.open('https://tasks.google.com/', '_blank');
    onToast('Opening Google Tasks web app...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Actionable Tasks &amp; Google Tasks Sync</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {tasks.length} Generated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Action-oriented commitments converted into concrete deliverables with assigned owners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchGoogleTasks}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Google Tasks</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          {(['all', 'todo', 'in_progress', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                filter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? `All Tasks (${tasks.length})` : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs sm:text-sm">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(({ task, commitment }) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`bg-slate-950 p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                    isDone
                      ? 'border-slate-800/80 opacity-60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() =>
                          onUpdateTaskStatus(
                            commitment.id,
                            isDone ? 'todo' : 'completed'
                          )
                        }
                        className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                            : 'border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>

                      <div>
                        <h4
                          className={`font-semibold text-white leading-snug ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold shrink-0 ${
                        task.priority === 'critical'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                          : task.priority === 'high'
                          ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                          : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Task Meta: Assignee & Due Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-300">
                        <User className="h-3 w-3" />
                        {task.owner}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-blue-300">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenCommitment(commitment);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
                    >
                      <span>Originating Commitment</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
              No tasks found for the selected filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Synced with CommitmentOS_V2 Task Engine</span>
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
