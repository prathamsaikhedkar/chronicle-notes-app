import React from 'react';
import { Lock, Unlock, ShieldCheck, ShieldAlert, Sliders, Database, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onUnlockClick: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  onNewNote: () => void;
  onNewTask: () => void;
  activeTab: 'notes' | 'tasks';
  onTabChange: (tab: 'notes' | 'tasks') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onUnlockClick,
  onOpenSettings,
  onOpenBackup,
  onNewNote,
  onNewTask,
  activeTab,
  onTabChange,
}) => {
  const { isLocked, isEmergencyUnlocked, lockVault } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={isLocked ? onUnlockClick : undefined}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isLocked
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 cursor-pointer hover:bg-rose-500/25'
                : isEmergencyUnlocked
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            }`}
            title={isLocked ? 'Click to Unlock Vault' : 'Vault Unlocked & Active'}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : isEmergencyUnlocked ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">ShadowVault</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                PWA
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {isLocked ? (
                <span className="text-rose-400 font-medium">Locked (AES-256)</span>
              ) : isEmergencyUnlocked ? (
                <span className="text-amber-400 font-medium">Emergency Rescue Mode</span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Decrypted in Memory
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Notes
          </button>
          <button
            type="button"
            onClick={() => onTabChange('tasks')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tasks
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isLocked && !isEmergencyUnlocked && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={onNewNote}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
              <button
                type="button"
                onClick={onNewTask}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>
            </div>
          )}

          {/* Quick Lock / Unlock Button */}
          {isLocked ? (
            <button
              type="button"
              onClick={onUnlockClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unlock</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={lockVault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
              title="Lock Vault immediately"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}

          {/* Backup / Restore */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Backup & Restore"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
