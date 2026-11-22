import React from 'react';
import { Trash2 } from 'lucide-react';
import type { PublicCoverNote } from '../../types';

interface CoverNoteCardProps {
  note: PublicCoverNote;
  onDelete: (id: string) => void;
}

export const CoverNoteCard: React.FC<CoverNoteCardProps> = ({ note, onDelete }) => {
  return (
    <div className="group rounded-2xl bg-white/80 border border-stone-200/80 hover:border-stone-300 p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-editorial text-base font-medium text-stone-900 leading-snug">
            {note.title}
          </h3>
          <span className="shrink-0 text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {note.category}
          </span>
        </div>

        <p className="text-xs text-stone-600 font-sans leading-relaxed whitespace-pre-line line-clamp-6 mb-4">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400">
        <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-stone-50 transition-colors"
          title="Delete entry"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
