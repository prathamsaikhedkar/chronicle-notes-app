import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import type { ConfidentialityLevel, TaskChecklistItem } from '../../types';

interface VaultTaskEditorProps {
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

export const VaultTaskEditor: React.FC<VaultTaskEditorProps> = ({ isOpen, onClose, onSave }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500">
              Encrypted Checklist
            </span>
            <h3 className="font-editorial text-lg text-stone-100 font-medium">New Secret Checklist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 mt-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1">
              List Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Critical deployment procedure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1.5">
              Confidentiality Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfidentiality('strictly-confidential')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  confidentiality === 'strictly-confidential'
                    ? 'bg-rose-950/30 border-rose-600/80 ring-1 ring-rose-500/50'
                    : 'bg-stone-900/60 border-stone-800 hover:bg-stone-900'
                }`}
              >
                <div className="font-editorial text-xs font-medium text-rose-300 mb-1">Strict Zero-Knowledge</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Unrecoverable if master PIN or pattern is lost.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfidentiality('semi-confidential')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  confidentiality === 'semi-confidential'
                    ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
                    : 'bg-stone-900/60 border-stone-800 hover:bg-stone-900'
                }`}
              >
                <div className="font-editorial text-xs font-medium text-amber-300 mb-1">Semi-Confidential</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Challenge recoverable if password is lost.
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1">Target Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono-code text-stone-400 uppercase tracking-wider">Action Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono-code text-stone-500 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder={`Item description #${idx + 1}`}
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 rounded-lg"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? 'Encrypting...' : 'Save Encrypted Checklist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
