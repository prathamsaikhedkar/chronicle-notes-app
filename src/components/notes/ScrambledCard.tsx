import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Binary } from 'lucide-react';
import type { EncryptedNote } from '../../types';

interface ScrambledCardProps {
  note: EncryptedNote;
  index: number;
  onCardClick: () => void;
}

const GLYPHS = '0123456789ABCDEF!@#$%&*<>{}[]=+/\\';

export const ScrambledCard: React.FC<ScrambledCardProps> = ({ note, index, onCardClick }) => {
  const [scrambledSnippet, setScrambledSnippet] = useState<string>('');

  // Dynamically cycle glyphs subtly to create authentic matrix / encrypted effect
  useEffect(() => {
    const rawCipher = note.ciphertext.slice(0, 140);

    const scramble = () => {
      let output = '';
      for (let i = 0; i < rawCipher.length; i++) {
        if (Math.random() < 0.15) {
          output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else {
          output += rawCipher[i];
        }
      }
      setScrambledSnippet(output);
    };

    scramble();
    const interval = setInterval(scramble, 1200 + index * 150);
    return () => clearInterval(interval);
  }, [note.ciphertext, index]);

  return (
    <div
      onClick={onCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/50 p-4 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 cipher-scanline select-none"
    >
      {/* Header with lock icon */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/90">
          <Binary className="w-3.5 h-3.5" />
          <span>CIPHER_BLOCK #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          {note.confidentiality === 'strictly-confidential' ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/50">
              <ShieldAlert className="w-2.5 h-2.5" />
              STRICT_CONFIDENTIAL
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/50">
              SEMI_CONFIDENTIAL
            </span>
          )}
          <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors ml-1" />
        </div>
      </div>

      {/* Scrambled Cipher Display */}
      <div className="font-mono text-xs text-slate-400 break-all leading-relaxed py-2 opacity-80 group-hover:opacity-100 group-hover:text-emerald-300/80 transition-colors">
        {scrambledSnippet || note.ciphertext.slice(0, 100)}...
      </div>

      {/* Footer metadata info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-2 pt-2 border-t border-slate-800/80">
        <span>IV: {note.iv.slice(0, 10)}...</span>
        <span className="text-emerald-500/60 group-hover:text-emerald-400 transition-colors">
          Click to decrypt →
        </span>
      </div>
    </div>
  );
};
