import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, CalendarDays } from 'lucide-react';
import type { TaskChecklistItem } from '../../types';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WeeklyTasksMap = Record<WeekdayKey, TaskChecklistItem[]>;

const WEEKDAYS: { key: WeekdayKey; label: string; full: string }[] = [
  { key: 'mon', label: 'Mon', full: 'Monday' },
  { key: 'tue', label: 'Tue', full: 'Tuesday' },
  { key: 'wed', label: 'Wed', full: 'Wednesday' },
  { key: 'thu', label: 'Thu', full: 'Thursday' },
  { key: 'fri', label: 'Fri', full: 'Friday' },
  { key: 'sat', label: 'Sat', full: 'Saturday' },
  { key: 'sun', label: 'Sun', full: 'Sunday' },
];

function getTodayWeekdayKey(): WeekdayKey {
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  const map: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day];
}

interface WeeklyChecklistProps {
  weeklyTasks: WeeklyTasksMap;
  onAdd: (day: WeekdayKey, text: string) => void;
  onToggle: (day: WeekdayKey, id: string) => void;
  onDelete: (day: WeekdayKey, id: string) => void;
  onClearCompleted: (day: WeekdayKey) => void;
}

export const WeeklyChecklist: React.FC<WeeklyChecklistProps> = ({
  weeklyTasks,
  onAdd,
  onToggle,
  onDelete,
  onClearCompleted,
}) => {
  const [selectedDay, setSelectedDay] = useState<WeekdayKey>(getTodayWeekdayKey);
  const [newItemText, setNewItemText] = useState('');

  const currentItems = weeklyTasks[selectedDay] || [];
  const completedCount = currentItems.filter((i) => i.completed).length;
  const selectedDayInfo = WEEKDAYS.find((d) => d.key === selectedDay)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAdd(selectedDay, trimmed);
    setNewItemText('');
  };

  return (
    <div className="rounded-2xl border bg-stone-900/90 border-stone-800 text-stone-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <h3 className="font-editorial text-lg font-medium tracking-tight">
            Weekly Checklist
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-code text-stone-400">
            {completedCount}/{currentItems.length} done
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => onClearCompleted(selectedDay)}
              className="text-[11px] font-medium underline underline-offset-2 text-stone-400 hover:text-amber-300 transition-colors"
            >
              Clear done
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Selector */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-4">
        {WEEKDAYS.map((day) => {
          const dayItems = weeklyTasks[day.key] || [];
          const pendingCount = dayItems.filter((i) => !i.completed).length;
          const isSelected = selectedDay === day.key;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day.key)}
              className={`relative py-2 px-1 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center border ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-stone-950/70 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <span>{day.label}</span>
              {pendingCount > 0 && (
                <span
                  className={`mt-0.5 text-[9px] font-mono-code px-1.5 rounded-full ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 font-semibold'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Add Form for Selected Weekday */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder={`Add task for ${selectedDayInfo.full}...`}
          className="flex-1 rounded-xl border bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-amber-500 px-3.5 py-2 text-xs focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none bg-amber-500 hover:bg-amber-400 text-stone-950"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Checklist Items for Selected Day */}
      {currentItems.length > 0 ? (
        <div className="space-y-1.5">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl transition-colors group hover:bg-stone-800/60"
            >
              <button
                type="button"
                onClick={() => onToggle(selectedDay, item.id)}
                className="flex-1 flex items-start gap-2.5 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-500" />
                  )}
                </div>
                <span
                  className={`text-xs leading-relaxed transition-all ${
                    item.completed ? 'line-through text-stone-500' : 'text-stone-200'
                  }`}
                >
                  {item.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(selectedDay, item.id)}
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
          No tasks for {selectedDayInfo.full}. Add one above.
        </p>
      )}
    </div>
  );
};
