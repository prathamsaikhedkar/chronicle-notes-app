import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Sparkles } from 'lucide-react';

export interface DailyTaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyChecklistProps {
  items: DailyTaskItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUncheckAll: () => void;
  variant: 'cover-light' | 'cover-dark' | 'vault';
  title?: string;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({
  items,
  onAdd,
  onToggle,
  onDelete,
  onUncheckAll,
  variant,
  title = "Today's Checklist",
}) => {
  const [newItemText, setNewItemText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewItemText('');
  };

  const completedCount = items.filter((i) => i.completed).length;

  const isVault = variant === 'vault';
  const isDarkCover = variant === 'cover-dark';

  const containerClass = isVault
    ? 'bg-stone-900/90 border-stone-800 text-stone-200'
    : isDarkCover
    ? 'bg-[#211d1a] border-stone-800 text-stone-200'
    : 'bg-white/90 border-stone-200/90 text-stone-800';

  const inputClass = isVault
    ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-amber-500'
    : isDarkCover
    ? 'bg-[#171412] border-stone-800 text-stone-100 placeholder-stone-500 focus:border-stone-600'
    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-400';

  const buttonClass = isVault
    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
    : isDarkCover
    ? 'bg-stone-200 hover:bg-white text-stone-900'
    : 'bg-stone-900 hover:bg-stone-800 text-stone-100';

  return (
    <div className={`rounded-2xl border p-5 shadow-sm mb-6 transition-colors ${containerClass}`}>
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          {isVault && <Sparkles className="w-4 h-4 text-amber-400" />}
          <h3 className="font-editorial text-lg font-medium tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-mono-code ${
              isVault || isDarkCover ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            {completedCount}/{items.length} done
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onUncheckAll}
              className={`text-[11px] font-medium underline underline-offset-2 transition-colors ${
                isVault
                  ? 'text-stone-400 hover:text-amber-300'
                  : isDarkCover
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Uncheck all
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a daily task..."
          className={`flex-1 rounded-xl border px-3.5 py-2 text-xs focus:outline-none transition-colors ${inputClass}`}
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${buttonClass}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Checklist Items */}
      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl transition-colors group ${
                isVault || isDarkCover ? 'hover:bg-stone-800/60' : 'hover:bg-stone-100/80'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="flex-1 flex items-start gap-2.5 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckSquare
                      className={`w-4 h-4 ${
                        isVault ? 'text-amber-400' : isDarkCover ? 'text-emerald-400' : 'text-emerald-700'
                      }`}
                    />
                  ) : (
                    <Square
                      className={`w-4 h-4 ${
                        isVault || isDarkCover ? 'text-stone-500' : 'text-stone-400'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs leading-relaxed transition-all ${
                    item.completed
                      ? 'line-through text-stone-500'
                      : isVault || isDarkCover
                      ? 'text-stone-200'
                      : 'text-stone-800'
                  }`}
                >
                  {item.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-1 rounded-lg text-stone-500 hover:text-rose-500 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-500 italic py-2 text-center">
          No daily tasks yet. Add one above to get started.
        </p>
      )}
    </div>
  );
};
