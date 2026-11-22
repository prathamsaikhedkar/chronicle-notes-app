import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PinPad } from './PinPad';
import { PatternLock } from './PatternLock';
import type { UnlockMethod } from '../../types';

export const SetupSecretModal: React.FC = () => {
  const { isConfigured, setupVault } = useAuth();
  const [method, setMethod] = useState<UnlockMethod>('pin');
  const [firstSecret, setFirstSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (isConfigured) return null;

  const handleInitialSecret = (secret: string) => {
    setError(undefined);
    setFirstSecret(secret);
  };

  const handleConfirmSecret = async (confirmedSecret: string) => {
    if (confirmedSecret !== firstSecret) {
      setError('Codes do not match. Please try again.');
      setFirstSecret(null);
      return;
    }

    setIsSubmitting(true);
    try {
      await setupVault(confirmedSecret, method);
    } catch {
      setError('Initialization failed.');
      setIsSubmitting(false);
    }
  };

  const resetSetup = () => {
    setFirstSecret(null);
    setError(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-sm bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-6 relative">
        <div className="text-center mb-5">
          <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500">Security Setup</span>
          <h2 className="font-editorial text-2xl font-normal text-stone-100 mt-1">Set Vault Code</h2>
          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
            Choose a secret PIN or gesture pattern. This will be the only way to reveal your hidden vault.
          </p>
        </div>

        {!firstSecret && (
          <div className="flex items-center justify-center gap-1 bg-stone-900 p-1 rounded-xl mb-4 max-w-[200px] mx-auto border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setMethod('pin');
                resetSetup();
              }}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                method === 'pin'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('pattern');
                resetSetup();
              }}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                method === 'pattern'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Pattern
            </button>
          </div>
        )}

        {method === 'pin' ? (
          <PinPad
            onComplete={firstSecret ? handleConfirmSecret : handleInitialSecret}
            isSettingUp={true}
            error={error}
            title={firstSecret ? 'Confirm Passcode' : 'Create 4-8 Digit PIN'}
            subtitle={firstSecret ? 'Re-enter your PIN' : 'Used to unlock secret items'}
          />
        ) : (
          <PatternLock
            onComplete={firstSecret ? handleConfirmSecret : handleInitialSecret}
            isSettingUp={true}
            error={error}
            title={firstSecret ? 'Confirm Gesture' : 'Draw 3x3 Pattern'}
            subtitle={firstSecret ? 'Redraw to verify' : 'Connect at least 4 nodes'}
          />
        )}

        {firstSecret && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={resetSetup}
              disabled={isSubmitting}
              className="text-xs text-stone-500 hover:text-stone-300 underline"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
