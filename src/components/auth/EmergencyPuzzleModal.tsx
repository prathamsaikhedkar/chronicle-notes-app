import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { PUZZLE_BANK, type PuzzleChallenge } from '../../services/puzzles';

interface EmergencyPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmergencyPuzzleModal: React.FC<EmergencyPuzzleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const REQUIRED_SOLVES = 2;
  const currentPuzzle: PuzzleChallenge = PUZZLE_BANK[currentIdx % PUZZLE_BANK.length];

  if (!isOpen) return null;

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
    setErrorMsg(null);
  };

  const handleVerify = () => {
    if (!selectedAnswer) return;
    setIsAnswerChecked(true);

    if (selectedAnswer === currentPuzzle.correctAnswer) {
      const nextScore = score + 1;
      setScore(nextScore);

      if (nextScore >= REQUIRED_SOLVES) {
        setIsFinished(true);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } else {
      setErrorMsg('Incorrect answer. Challenge verification not met.');
    }
  };

  const handleNextPuzzle = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setErrorMsg(null);
    setCurrentIdx((prev) => (prev + 1) % PUZZLE_BANK.length);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setErrorMsg(null);
    setIsFinished(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-amber-400">
              Emergency Verification
            </span>
            <h3 className="font-editorial text-xl font-medium text-stone-100 mt-0.5">
              Recovery Challenge
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="text-stone-400 hover:text-stone-200 text-sm p-1.5 rounded-full hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 mb-5 text-xs text-stone-300 leading-relaxed font-sans">
          Solving this verification challenge will restore access to your <strong>semi-confidential</strong> notes. Strictly confidential notes remain locked.
        </div>

        {isFinished ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-editorial text-lg text-stone-100">Verification Complete</h4>
            <p className="text-xs text-stone-400 mt-1">
              Opening semi-confidential notes...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2 font-mono-code">
              <span>Step {score + 1} of {REQUIRED_SOLVES}</span>
              <span>Question #{currentIdx + 1}</span>
            </div>

            <div className="bg-stone-950/90 border border-stone-800/80 rounded-2xl p-4 mb-4">
              <p className="text-sm font-medium text-stone-100 leading-snug">
                {currentPuzzle.question}
              </p>
              <p className="text-xs text-stone-400 mt-2 italic">
                Hint: {currentPuzzle.hint}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {currentPuzzle.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                let btnStyle = 'bg-stone-950/70 border-stone-800 hover:bg-stone-800 text-stone-200';

                if (isAnswerChecked) {
                  if (opt === currentPuzzle.correctAnswer) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-600 text-emerald-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/60 border-rose-600 text-rose-300';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-amber-500/20 border-amber-500/80 text-amber-200';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && opt === currentPuzzle.correctAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {isAnswerChecked && isSelected && opt !== currentPuzzle.correctAnswer && (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 mb-4">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2.5">
              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={!selectedAnswer}
                  onClick={handleVerify}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
                >
                  Verify Response
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextPuzzle}
                  className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{selectedAnswer === currentPuzzle.correctAnswer ? 'Next Challenge' : 'Try Another'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
