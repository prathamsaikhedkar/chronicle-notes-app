import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CoverNoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { title: string; content: string; category: string }) => Promise<void>;
}

export const CoverNoteEditor: React.FC<CoverNoteEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    await onSave({
      title: title.trim() || 'Untitled Note',
      content,
      category,
    });
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#fcfbf7] border border-stone-300 rounded-3xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="font-editorial text-lg text-stone-900 font-medium">New Journal Note</h3>
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
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Garden planning notes..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-stone-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-500"
            >
              <option value="Personal">Personal</option>
              <option value="Reading">Reading</option>
              <option value="Market">Market & Shopping</option>
              <option value="Rituals">Rituals & Daily</option>
              <option value="Work">Work Ideas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono-code text-stone-500 uppercase tracking-wider mb-1">
              Content
            </label>
            <textarea
              rows={6}
              required
              placeholder="Write thoughts, lists, or daily observations..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 resize-none font-sans leading-relaxed"
            />
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
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
