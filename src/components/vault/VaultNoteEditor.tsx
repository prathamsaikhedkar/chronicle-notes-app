import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import type { DecryptedNote, ConfidentialityLevel } from '../../types';

interface VaultNoteEditorProps {
  isOpen: boolean;
  initialNote?: DecryptedNote | null;
  onClose: () => void;
  onSave: (note: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
    confidentiality: ConfidentialityLevel;
  }) => Promise<void>;
}

export const VaultNoteEditor: React.FC<VaultNoteEditorProps> = ({
  isOpen,
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('strictly-confidential');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTagsInput(initialNote.tags.join(', '));
      setConfidentiality(initialNote.confidentiality);
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      setConfidentiality('strictly-confidential');
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await onSave({
        id: initialNote?.id,
        title: title.trim() || 'Untitled Note',
        content,
        tags,
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
              Encrypted Record
            </span>
            <h3 className="font-editorial text-lg text-stone-100 font-medium">
              {initialNote ? 'Edit Secret Note' : 'New Secret Note'}
            </h3>
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
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master seed phrases, private contracts, thoughts..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1.5">
              Confidentiality & Recovery
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
                <div className="font-editorial text-xs font-medium text-rose-300 mb-1">
                  Strict Zero-Knowledge
                </div>
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
                <div className="font-editorial text-xs font-medium text-amber-300 mb-1">
                  Semi-Confidential
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Can be recovered by solving emergency puzzle challenge.
                </p>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1">
              Encrypted Body
            </label>
            <textarea
              required
              rows={8}
              placeholder="Content will be encrypted with AES-256 before storage..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-stone-500" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Finances, Credentials, Personal"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
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
              {isSaving ? 'Encrypting...' : 'Save Encrypted Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
