import React from 'react';
import { CheckSquare, Square, Trash2, Calendar } from 'lucide-react';
import type { DecryptedTask } from '../../types';

interface VaultTaskCardProps {
  task: DecryptedTask;
  onToggleItem: (taskId: string, itemId: string) => void;
  onDelete: (id: string) => void;
}

export const VaultTaskCard: React.FC<VaultTaskCardProps> = ({ task, onToggleItem, onDelete }) => {
  const completedCount = task.items.filter((it) => it.completed).length;
  const totalCount = task.items.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="group rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 p-5 transition-all duration-200 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <h3 className="font-editorial text-base font-medium text-stone-100 leading-snug">
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              {task.priority}
            </span>
            {task.confidentiality === 'strictly-confidential' ? (
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-900/70">
                Strict
              </span>
            ) : (
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-900/70">
                Semi
              </span>
            )}
          </div>
        </div>

        {/* Minimalist progress bar */}
        <div className="w-full bg-stone-800 rounded-full h-1 mb-3.5 overflow-hidden">
          <div
            className="bg-amber-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="space-y-2 mb-4">
          {task.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(task.id, item.id)}
              className="w-full text-left flex items-start gap-2.5 py-1 px-1.5 rounded-lg hover:bg-stone-800/50 transition-colors group/item"
            >
              <div className="mt-0.5 shrink-0 text-stone-500 group-hover/item:text-amber-400 transition-colors">
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs leading-relaxed transition-all font-sans ${
                  item.completed ? 'line-through text-stone-500' : 'text-stone-300'
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-800/80">
        <div className="flex items-center gap-2 font-mono-code">
          <span>{completedCount}/{totalCount} done</span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-stone-400">
              <Calendar className="w-3 h-3 text-stone-500" />
              {task.dueDate}
            </span>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
          title="Delete list"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
