import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, X, Tag as TagIcon } from 'lucide-react';
import type { DecryptedNote, ConfidentialityLevel } from '../../types';

interface NoteEditorModalProps {
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

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">
            {initialNote ? 'Edit Encrypted Note' : 'New Encrypted Note'}
          </h3>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Confidentiality Level Toggle */}
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
                  Unrecoverable if master password or pattern is lost. Zero-knowledge.
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
                  Can be recovered if password forgotten by solving emergency puzzle.
                </p>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-slate-400 mb-1">Note Content</label>
            <textarea
              required
              rows={8}
              placeholder="Write your private note here (encrypted with AES-256 before saving to storage)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Finances, Personal, Passwords, Ideas"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
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
              {isSaving ? 'Encrypting & Saving...' : 'Save Encrypted Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
