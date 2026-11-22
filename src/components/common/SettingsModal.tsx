import React, { useState } from 'react';
import { X, Clock, Smartphone, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UnlockMethod } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, metadata, changeSecret, isLocked } = useAuth();
  const [autoLockMin, setAutoLockMin] = useState<number>(settings.autoLockMinutes);
  const [lockOnBlur, setLockOnBlur] = useState<boolean>(settings.lockOnTabBlur);

  const [showChangeCred, setShowChangeCred] = useState(false);
  const [newMethod, setNewMethod] = useState<UnlockMethod>(metadata?.unlockMethod || 'pin');
  const [currentSecret, setCurrentSecret] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSavePreferences = async () => {
    await updateSettings({
      autoLockMinutes: autoLockMin,
      lockOnTabBlur: lockOnBlur,
    });
    onClose();
  };

  const handleChangeCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (newSecret.length < 4) {
      setCredError('New secret must be at least 4 digits or nodes.');
      return;
    }

    const res = await changeSecret(currentSecret, newSecret, newMethod);
    if (!res.success) {
      setCredError(res.error || 'Failed to update credentials.');
    } else {
      setCredSuccess('Master access credentials updated successfully!');
      setCurrentSecret('');
      setNewSecret('');
      setTimeout(() => setShowChangeCred(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500">
              Vault Configuration
            </span>
            <h3 className="font-editorial text-lg text-stone-100 font-medium">Security Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900"
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
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Master Secret Change Section */}
          {!isLocked && (
            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowChangeCred(!showChangeCred)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 text-xs font-medium text-stone-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Update Master Code or Pattern</span>
                </span>
                <span className="text-stone-500 font-mono-code text-[11px]">{showChangeCred ? 'Hide' : 'Change'}</span>
              </button>

              {showChangeCred && (
                <form onSubmit={handleChangeCredential} className="mt-3 p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/90 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setNewMethod('pin')}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium ${
                        newMethod === 'pin' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMethod('pattern')}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium ${
                        newMethod === 'pattern' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      Pattern (0-1-2-5)
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-code text-stone-400 mb-1">Current Credential</label>
                    <input
                      type="password"
                      required
                      placeholder="Current PIN or pattern"
                      value={currentSecret}
                      onChange={(e) => setCurrentSecret(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-code text-stone-400 mb-1">New Credential</label>
                    <input
                      type="password"
                      required
                      placeholder="New PIN or pattern string"
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {credError && <p className="text-[11px] text-rose-400">{credError}</p>}
                  {credSuccess && <p className="text-[11px] text-emerald-400">{credSuccess}</p>}

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase"
                  >
                    Save New Credential
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
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
