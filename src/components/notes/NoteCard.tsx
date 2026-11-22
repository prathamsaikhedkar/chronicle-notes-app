import React from 'react';
import { Tag, Calendar, ShieldCheck, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import type { DecryptedNote } from '../../types';

interface NoteCardProps {
  note: DecryptedNote;
  onEdit: (note: DecryptedNote) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 transition-all duration-200 shadow-md hover:shadow-emerald-500/5 hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
            {note.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {note.confidentiality === 'strictly-confidential' ? (
              <span
                title="Strictly Confidential (Zero-knowledge: Unrecoverable if PIN/Pattern forgotten)"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60"
              >
                <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                <span>Strict</span>
              </span>
            ) : (
              <span
                title="Semi-Confidential (Can be recovered by solving emergency puzzle challenge)"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                <span>Semi</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-5 mb-4 font-normal">
          {note.content}
        </p>
      </div>

      <div>
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer info & action buttons */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Edit Note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
