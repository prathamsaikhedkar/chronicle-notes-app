import React from 'react';
import { Tag, Calendar } from 'lucide-react';
import type { DecryptedNote } from '../../types';

interface DecoyCardProps {
  note: DecryptedNote;
  onCardClick: () => void;
}

export const DecoyCard: React.FC<DecoyCardProps> = ({ note, onCardClick }) => {
  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-slate-200 text-sm group-hover:text-slate-100 line-clamp-1">
          {note.title}
        </h4>
      </div>

      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line mb-3">
        {note.content}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-[10px]"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
