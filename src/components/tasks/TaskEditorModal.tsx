import React, { useState } from 'react';
import { X, Plus, Trash, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { ConfidentialityLevel, TaskChecklistItem } from '../../types';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    items: TaskChecklistItem[];
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    confidentiality: ConfidentialityLevel;
  }) => Promise<void>;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: '', completed: false },
  ]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('strictly-confidential');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { id: Math.random().toString(), text: '', completed: false }]);
  };

  const handleItemTextChange = (id: string, text: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.text.trim().length > 0);
    if (!title.trim() || validItems.length === 0) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        items: validItems,
        priority,
        dueDate: dueDate || undefined,
        confidentiality,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">New Encrypted Task Checklist</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 mt-4 overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Task List Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Critical Server Migration Steps"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Confidentiality Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Confidentiality & Recovery Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfidentiality('strictly-confidential')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  confidentiality === 'strictly-confidential'
                    ? 'bg-rose-950/30 border-rose-500/80 ring-1 ring-rose-500/50'
                    : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Strict Confidential</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Unrecoverable if master password or pattern is lost.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfidentiality('semi-confidential')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  confidentiality === 'semi-confidential'
                    ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
                    : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Semi-Confidential</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Can be recovered if password forgotten by solving puzzle.
                </p>
              </button>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Items Checklist Builder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">Checklist Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder={`Item description #${idx + 1}`}
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {isSaving ? 'Encrypting & Saving...' : 'Save Encrypted Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
