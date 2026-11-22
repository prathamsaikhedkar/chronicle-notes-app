import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';

interface CoverTaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, items: { text: string; completed: boolean }[]) => Promise<void>;
}

export const CoverTaskEditor: React.FC<CoverTaskEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: '', completed: false },
  ]);

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

    await onSave(
      title.trim(),
      validItems.map((it) => ({ text: it.text.trim(), completed: false }))
    );
    setTitle('');
    setItems([{ id: '1', text: '', completed: false }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#fcfbf7] border border-stone-300 rounded-3xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="font-editorial text-lg text-stone-900 font-medium">New Daily Checklist</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono-code text-stone-500 uppercase tracking-wider mb-1">
              List Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Travel packing checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono-code text-stone-500 uppercase tracking-wider">
                Checklist Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-stone-800 hover:text-stone-950 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono-code text-stone-400 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder={`Item #${idx + 1}`}
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs shadow-sm"
            >
              Save List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
