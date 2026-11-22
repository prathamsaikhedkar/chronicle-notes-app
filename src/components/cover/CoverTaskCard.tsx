import React from 'react';
import { CheckSquare, Square, Trash2 } from 'lucide-react';
import type { PublicCoverTask } from '../../types';

interface CoverTaskCardProps {
  task: PublicCoverTask;
  onToggleItem: (taskId: string, itemId: string) => void;
  onDelete: (id: string) => void;
}

export const CoverTaskCard: React.FC<CoverTaskCardProps> = ({ task, onToggleItem, onDelete }) => {
  const completedCount = task.items.filter((it) => it.completed).length;
  const totalCount = task.items.length;

  return (
    <div className="group rounded-2xl bg-white/80 border border-stone-200/80 hover:border-stone-300 p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-editorial text-base font-medium text-stone-900 leading-snug">
            {task.title}
          </h3>
          <span className="shrink-0 text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {task.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(task.id, item.id)}
              className="w-full text-left flex items-start gap-2.5 py-1 px-1.5 rounded-lg hover:bg-stone-50 transition-colors group/item"
            >
              <div className="mt-0.5 shrink-0 text-stone-400 group-hover/item:text-stone-700 transition-colors">
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs leading-relaxed transition-all font-sans ${
                  item.completed ? 'line-through text-stone-400' : 'text-stone-700'
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400">
        <span>{new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-stone-50 transition-colors"
          title="Delete list"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
