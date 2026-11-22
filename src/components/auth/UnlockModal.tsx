import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PinPad } from './PinPad';
import { PatternLock } from './PatternLock';
import { EmergencyPuzzleModal } from './EmergencyPuzzleModal';
import type { UnlockMethod } from '../../types';

interface UnlockModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ isOpen, onClose }) => {
  const { metadata, unlockVault, unlockWithEmergencyPuzzle } = useAuth();
  const [activeMethod, setActiveMethod] = useState<UnlockMethod>(metadata?.unlockMethod || 'pin');
  const [error, setError] = useState<string | undefined>();
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (metadata?.unlockMethod) {
      setActiveMethod(metadata.unlockMethod);
    }
  }, [metadata]);

  if (!isOpen) return null;

  const handleUnlockAttempt = async (secret: string) => {
    setError(undefined);
    const res = await unlockVault(secret);
    if (!res.success) {
      setError(res.error || 'Authentication rejected. Incorrect code.');
    } else {
      if (onClose) onClose();
    }
  };

  const handlePuzzleRecoverySuccess = async () => {
    await unlockWithEmergencyPuzzle();
    setShowEmergencyModal(false);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-sm bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-6 relative">
          {/* Subtle close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 p-1.5 rounded-full hover:bg-stone-900"
            >
              ✕
            </button>
          )}

          {/* Minimalist Switcher */}
          <div className="flex items-center justify-center gap-1 bg-stone-900 p-1 rounded-xl mb-4 max-w-[200px] mx-auto border border-stone-800/80">
            <button
              type="button"
              onClick={() => {
                setActiveMethod('pin');
                setError(undefined);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeMethod === 'pin'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMethod('pattern');
                setError(undefined);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeMethod === 'pattern'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Pattern
            </button>
          </div>

          {activeMethod === 'pin' ? (
            <PinPad
              onComplete={handleUnlockAttempt}
              error={error}
              title="Passcode"
              subtitle="Enter your access code"
            />
          ) : (
            <PatternLock
              onComplete={handleUnlockAttempt}
              error={error}
              title="Gesture"
              subtitle="Draw your pattern sequence"
            />
          )}

          {/* Discreet recovery prompt */}
          <div className="mt-5 pt-3 border-t border-stone-900 text-center">
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="text-[11px] text-stone-500 hover:text-amber-400 transition-colors py-1 px-2 rounded-lg"
            >
              Forgot code? Emergency Challenge Recovery &rarr;
            </button>
          </div>
        </div>
      </div>

      <EmergencyPuzzleModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        onSuccess={handlePuzzleRecoverySuccess}
      />
    </>
  );
};
