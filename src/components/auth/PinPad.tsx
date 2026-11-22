import React, { useState } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onComplete: (pin: string) => void;
  title?: string;
  subtitle?: string;
  error?: string;
  isSettingUp?: boolean;
}

export const PinPad: React.FC<PinPadProps> = ({
  onComplete,
  title = 'Passcode',
  subtitle = 'Enter 4-8 digits to authenticate',
  error,
  isSettingUp = false,
}) => {
  const [pin, setPin] = useState<string>('');

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onComplete(pin);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-xs mx-auto select-none">
      <div className="text-center mb-6">
        <h3 className="font-editorial text-xl font-light text-stone-100 tracking-wide">{title}</h3>
        <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
      </div>

      {/* Modern minimal dots */}
      <div className="flex items-center justify-center space-x-3 mb-7 h-6">
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const filled = idx < pin.length;
          return (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                filled
                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] scale-110'
                  : 'bg-stone-800 border border-stone-700/80'
              }`}
            />
          );
        })}
      </div>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-1.5 mb-4 text-center">
          {error}
        </div>
      )}

      {/* Tactile Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-14 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500/20 active:border-amber-500/50 border border-stone-800 text-xl font-mono-code text-stone-100 transition-all flex items-center justify-center shadow-sm"
          >
            {d}
          </button>
        ))}

        <button
          type="button"
          onClick={handleClear}
          className="h-14 rounded-2xl bg-stone-950 hover:bg-stone-900 text-xs font-medium text-stone-500 hover:text-stone-300 transition-colors flex items-center justify-center"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500/20 active:border-amber-500/50 border border-stone-800 text-xl font-mono-code text-stone-100 transition-all flex items-center justify-center shadow-sm"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-stone-200 transition-colors flex items-center justify-center"
          aria-label="Delete"
        >
          <Delete className="w-5 h-5 text-stone-400" />
        </button>
      </div>

      <button
        type="button"
        disabled={pin.length < 4}
        onClick={handleSubmit}
        className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:pointer-events-none text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98]"
      >
        {isSettingUp ? 'Confirm Passcode' : 'Authorize & Open'}
      </button>
    </div>
  );
};
