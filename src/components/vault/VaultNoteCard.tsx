import React from 'react';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import type { DecryptedNote } from '../../types';

interface VaultNoteCardProps {
  note: DecryptedNote;
  onEdit: (note: DecryptedNote) => void;
  onDelete: (id: string) => void;
}

export const VaultNoteCard: React.FC<VaultNoteCardProps> = ({ note, onEdit, onDelete }) => {
  return (
    <div className="group rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 p-5 transition-all duration-200 shadow-md hover:shadow-amber-500/5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <h3 className="font-editorial text-base font-medium text-stone-100 leading-snug">
            {note.title}
          </h3>
          <div className="shrink-0">
            {note.confidentiality === 'strictly-confidential' ? (
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-900/70">
                Strict Zero-Knowledge
              </span>
            ) : (
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-900/70">
                Semi-Confidential (Challenge Recoverable)
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-stone-300 font-sans leading-relaxed whitespace-pre-wrap line-clamp-6 mb-4">
          {note.content}
        </p>
      </div>

      <div>
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 text-[10px] font-mono-code"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-800/80">
          <span className="font-mono-code">{new Date(note.updatedAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
              title="Edit Note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
