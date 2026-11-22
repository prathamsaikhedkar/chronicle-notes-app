import React from 'react';
import { CheckSquare, Square, ShieldAlert, ShieldCheck, Trash2, Calendar } from 'lucide-react';
import type { DecryptedTask } from '../../types';

interface TaskItemProps {
  task: DecryptedTask;
  onToggleItem: (taskId: string, itemId: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleItem, onDeleteTask }) => {
  const completedCount = task.items.filter((it) => it.completed).length;
  const totalCount = task.items.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priorityStyles = {
    low: 'text-slate-400 bg-slate-800/80 border-slate-700',
    medium: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    high: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 transition-all shadow-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-100 text-sm leading-snug">
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border ${
                priorityStyles[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {task.confidentiality === 'strictly-confidential' ? (
              <span
                title="Strict Confidential: Unrecoverable if PIN/Pattern forgotten"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60"
              >
                <ShieldAlert className="w-2.5 h-2.5" />
                <span>Strict</span>
              </span>
            ) : (
              <span
                title="Semi-Confidential: Recoverable via emergency puzzle challenge"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Semi</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-1.5 mb-3">
          {task.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(task.id, item.id)}
              className="w-full text-left flex items-start gap-2.5 py-1 px-1.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
              <div className="mt-0.5 shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors">
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs leading-relaxed transition-all ${
                  item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span>{completedCount} of {totalCount} completed</span>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onDeleteTask(task.id)}
          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
