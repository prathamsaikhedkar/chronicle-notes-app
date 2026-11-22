import React, { useState } from 'react';
import { X, Clock, Smartphone, Shield, KeyRound, Grid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PinPad } from '../auth/PinPad';
import { PatternLock } from '../auth/PatternLock';
import type { UnlockMethod } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, metadata, changeSecret, isLocked } = useAuth();
  const [autoLockMin, setAutoLockMin] = useState<number>(settings.autoLockMinutes);
  const [lockOnBlur, setLockOnBlur] = useState<boolean>(settings.lockOnTabBlur);

  // Credential modification modal/flow
  const [showChangeCred, setShowChangeCred] = useState(false);
  const [newMethod, setNewMethod] = useState<UnlockMethod>(metadata?.unlockMethod === 'pattern' ? 'pin' : 'pattern');
  const [credStep, setCredStep] = useState<'verify-current' | 'enter-new' | 'confirm-new'>('verify-current');
  const [currentSecretInput, setCurrentSecretInput] = useState<string>('');
  const [newSecretInput, setNewSecretInput] = useState<string>('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  if (!isOpen) return null;

  const currentMethod: UnlockMethod = metadata?.unlockMethod || 'pin';

  const handleSavePreferences = async () => {
    await updateSettings({
      autoLockMinutes: autoLockMin,
      lockOnTabBlur: lockOnBlur,
    });
    onClose();
  };

  const handleResetFlow = () => {
    setShowChangeCred(false);
    setCredStep('verify-current');
    setCurrentSecretInput('');
    setNewSecretInput('');
    setCredError(null);
    setCredSuccess(null);
  };

  // Step 1: User verifies their current credential
  const handleVerifyCurrent = (secret: string) => {
    setCredError(null);
    setCurrentSecretInput(secret);
    setCredStep('enter-new');
  };

  // Step 2: User draws/enters the new credential for the first time
  const handleEnterNew = (secret: string) => {
    setCredError(null);
    setNewSecretInput(secret);
    setCredStep('confirm-new');
  };

  // Step 3: User confirms the new credential
  const handleConfirmNew = async (confirmedSecret: string) => {
    if (confirmedSecret !== newSecretInput) {
      setCredError('New code does not match. Please draw/enter again.');
      setCredStep('enter-new');
      return;
    }

    setIsRotating(true);
    setCredError(null);
    try {
      const res = await changeSecret(currentSecretInput, confirmedSecret, newMethod);
      if (!res.success) {
        setCredError(res.error || 'Failed to update credentials. Please check current code.');
        setCredStep('verify-current');
        setIsRotating(false);
      } else {
        setCredSuccess('Credentials updated & all records safely re-encrypted!');
        setTimeout(() => {
          handleResetFlow();
        }, 1600);
      }
    } catch {
      setCredError('Unexpected error updating secret.');
      setIsRotating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative flex flex-col max-h-[92vh] my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500">
              Vault Configuration
            </span>
            <h3 className="font-editorial text-lg text-stone-100 font-medium">Security Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-5">
          {/* Auto Lock Timer */}
          <div>
            <label className="block text-xs font-mono-code text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Inactivity Auto-Lock</span>
            </label>
            <select
              value={autoLockMin}
              onChange={(e) => setAutoLockMin(Number(e.target.value))}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value={1}>Lock after 1 minute of inactivity</option>
              <option value={3}>Lock after 3 minutes of inactivity</option>
              <option value={5}>Lock after 5 minutes of inactivity</option>
              <option value={10}>Lock after 10 minutes of inactivity</option>
              <option value={0}>Manual lock only</option>
            </select>
          </div>

          {/* Tab Blur / Minimize Lock */}
          <div>
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-stone-800 cursor-pointer hover:bg-stone-800/60 transition-colors">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-stone-200">
                    Lock on tab switch or minimize
                  </span>
                  <span className="block text-[11px] text-stone-500">
                    Immediately purges in-memory keys upon leaving view
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={lockOnBlur}
                onChange={(e) => setLockOnBlur(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </label>
          </div>

          {/* Master Secret Change Section */}
          {!isLocked && (
            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  if (showChangeCred) {
                    handleResetFlow();
                  } else {
                    setShowChangeCred(true);
                    setCredStep('verify-current');
                  }
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 text-xs font-medium text-stone-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Update Unlock Code or Pattern</span>
                </span>
                <span className="text-stone-500 font-mono-code text-[11px]">
                  {showChangeCred ? 'Cancel' : 'Change'}
                </span>
              </button>

              {showChangeCred && (
                <div className="mt-4 p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3 animate-fade-in">
                  {/* Target method selector */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code text-stone-400 uppercase tracking-wide">
                      Select New Format:
                    </span>
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setNewMethod('pin');
                          setCredStep('verify-current');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          newMethod === 'pin'
                            ? 'bg-stone-800 text-amber-300 shadow-sm'
                            : 'text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>PIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewMethod('pattern');
                          setCredStep('verify-current');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          newMethod === 'pattern'
                            ? 'bg-stone-800 text-amber-300 shadow-sm'
                            : 'text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        <Grid className="w-3 h-3" />
                        <span>Pattern</span>
                      </button>
                    </div>
                  </div>

                  {credSuccess ? (
                    <div className="p-3 text-center text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-xl">
                      {credSuccess}
                    </div>
                  ) : isRotating ? (
                    <div className="py-6 text-center text-xs text-amber-400">
                      Re-encrypting all notes & checklists with new master key...
                    </div>
                  ) : credStep === 'verify-current' ? (
                    <div>
                      <div className="text-center mb-1">
                        <span className="text-[10px] font-mono-code text-amber-400 uppercase">Step 1 of 3</span>
                      </div>
                      {currentMethod === 'pin' ? (
                        <PinPad
                          onComplete={handleVerifyCurrent}
                          title="Enter Current PIN"
                          subtitle="Authenticate to authorize change"
                          error={credError || undefined}
                        />
                      ) : (
                        <PatternLock
                          onComplete={handleVerifyCurrent}
                          title="Draw Current Pattern"
                          subtitle="Authenticate to authorize change"
                          error={credError || undefined}
                        />
                      )}
                    </div>
                  ) : credStep === 'enter-new' ? (
                    <div>
                      <div className="text-center mb-1">
                        <span className="text-[10px] font-mono-code text-amber-400 uppercase">Step 2 of 3</span>
                      </div>
                      {newMethod === 'pin' ? (
                        <PinPad
                          onComplete={handleEnterNew}
                          isSettingUp={true}
                          title="Enter New PIN"
                          subtitle="Enter your new 4-8 digit code"
                          error={credError || undefined}
                        />
                      ) : (
                        <PatternLock
                          onComplete={handleEnterNew}
                          isSettingUp={true}
                          title="Draw New Pattern"
                          subtitle="Connect at least 4 nodes"
                          error={credError || undefined}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-1">
                        <span className="text-[10px] font-mono-code text-amber-400 uppercase">Step 3 of 3</span>
                      </div>
                      {newMethod === 'pin' ? (
                        <PinPad
                          onComplete={handleConfirmNew}
                          isSettingUp={true}
                          title="Confirm New PIN"
                          subtitle="Re-enter to confirm code"
                          error={credError || undefined}
                        />
                      ) : (
                        <PatternLock
                          onComplete={handleConfirmNew}
                          isSettingUp={true}
                          title="Confirm New Pattern"
                          subtitle="Redraw the pattern to confirm"
                          error={credError || undefined}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs tracking-wider uppercase shadow-md"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
