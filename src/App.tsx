import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useJournalAndVault } from './hooks/useJournalAndVault';
import { SetupSecretModal } from './components/auth/SetupSecretModal';
import { UnlockModal } from './components/auth/UnlockModal';

// Cover Components (when locked)
import { CoverNoteCard } from './components/cover/CoverNoteCard';
import { CoverTaskCard } from './components/cover/CoverTaskCard';
import { CoverNoteEditor } from './components/cover/CoverNoteEditor';
import { CoverTaskEditor } from './components/cover/CoverTaskEditor';

// Vault Components (when unlocked)
import { VaultNoteCard } from './components/vault/VaultNoteCard';
import { VaultTaskCard } from './components/vault/VaultTaskCard';
import { VaultNoteEditor } from './components/vault/VaultNoteEditor';
import { VaultTaskEditor } from './components/vault/VaultTaskEditor';

import { SettingsModal } from './components/common/SettingsModal';
import { ExportImportModal } from './components/common/ExportImportModal';
import type { DecryptedNote } from './types';
import {
  Lock,
  Unlock,
  Plus,
  Sliders,
  Database,
  Key,
} from 'lucide-react';

export const MainApp: React.FC = () => {
  const { isConfigured, isLocked, isEmergencyUnlocked, lockVault } = useAuth();
  const {
    coverNotes,
    coverTasks,
    addCoverNote,
    removeCoverNote,
    addCoverTask,
    toggleCoverTaskItem,
    removeCoverTask,
    vaultNotes,
    vaultTasks,
    saveVaultNote,
    removeVaultNote,
    saveVaultTask,
    toggleVaultTaskItem,
    removeVaultTask,
    refreshVaultData,
  } = useJournalAndVault();

  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Cover creation modals
  const [isCoverNoteEditorOpen, setIsCoverNoteEditorOpen] = useState(false);
  const [isCoverTaskEditorOpen, setIsCoverTaskEditorOpen] = useState(false);

  // Vault creation & editing modals
  const [isVaultNoteEditorOpen, setIsVaultNoteEditorOpen] = useState(false);
  const [editingVaultNote, setEditingVaultNote] = useState<DecryptedNote | null>(null);
  const [isVaultTaskEditorOpen, setIsVaultTaskEditorOpen] = useState(false);

  // Current formatted date for editorial display
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  /* -------------------------------------------------------------------------- */
  /*                      LOCKED STATE: EDITORIAL COVER APP                     */
  /* -------------------------------------------------------------------------- */
  if (isLocked) {
    return (
      <div className="min-h-screen bg-parchment text-stone-800 flex flex-col font-sans transition-colors duration-300">
        {/* Cover Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#fcfbf7]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Innocent Journal Title with an elegant monogram */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-editorial text-sm font-semibold tracking-wider">
                C
              </div>
              <div>
                <h1 className="font-editorial text-lg font-medium text-stone-900 leading-none">
                  Chronicle
                </h1>
                <span className="text-[11px] font-mono-code text-stone-500">{todayFormatted}</span>
              </div>
            </div>

            {/* Simple tab toggle: Notes / Tasks */}
            <div className="flex items-center bg-stone-200/60 p-0.5 rounded-full border border-stone-300/50">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'notes'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Journal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Routines
              </button>
            </div>

            {/* Right Action: innocent Add Entry + Secret Unlock Key */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  activeTab === 'notes'
                    ? setIsCoverNoteEditorOpen(true)
                    : setIsCoverTaskEditorOpen(true)
                }
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>

              {/* The ONLY unlock button: minimalist, discreet key icon */}
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                title="Access Vault"
                aria-label="Unlock"
              >
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
          {activeTab === 'notes' ? (
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-stone-200/60">
                <div>
                  <h2 className="font-editorial text-2xl font-light text-stone-900 tracking-tight">
                    Personal Entries
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Reflections, reading logs, and culinary notes.
                  </p>
                </div>
                <span className="text-xs font-mono-code text-stone-400">
                  {coverNotes.length} entries
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coverNotes.map((note) => (
                  <CoverNoteCard key={note.id} note={note} onDelete={removeCoverNote} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-stone-200/60">
                <div>
                  <h2 className="font-editorial text-2xl font-light text-stone-900 tracking-tight">
                    Daily Routines
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Household chores, focus items, and upkeep lists.
                  </p>
                </div>
                <span className="text-xs font-mono-code text-stone-400">
                  {coverTasks.length} lists
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coverTasks.map((task) => (
                  <CoverTaskCard
                    key={task.id}
                    task={task}
                    onToggleItem={toggleCoverTaskItem}
                    onDelete={removeCoverTask}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Floating Add on mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden z-20">
          <button
            onClick={() =>
              activeTab === 'notes'
                ? setIsCoverNoteEditorOpen(true)
                : setIsCoverTaskEditorOpen(true)
            }
            className="w-13 h-13 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Modals & Secret Trigger */}
        {!isConfigured && <SetupSecretModal />}

        <UnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
        />

        <CoverNoteEditor
          isOpen={isCoverNoteEditorOpen}
          onClose={() => setIsCoverNoteEditorOpen(false)}
          onSave={addCoverNote}
        />

        <CoverTaskEditor
          isOpen={isCoverTaskEditorOpen}
          onClose={() => setIsCoverTaskEditorOpen(false)}
          onSave={addCoverTask}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                  UNLOCKED STATE: BESPOKE LUXURY VAULT                      */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-vault text-stone-200 flex flex-col font-sans transition-colors duration-300">
      {/* Vault Header: Now full security controls & settings are revealed */}
      <header className="sticky top-0 z-30 bg-[#0b0f14]/90 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono-code text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-lg font-normal text-stone-100 leading-none">
                  Secret Vault
                </h1>
                <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {isEmergencyUnlocked ? 'Rescue Mode' : 'AES-GCM Decrypted'}
                </span>
              </div>
              <p className="text-[11px] font-mono-code text-stone-400 mt-0.5">
                Zeroized from memory on auto-lock or tab blur
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-stone-900 p-0.5 rounded-full border border-stone-800">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Secret Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Secret Checklists
            </button>
          </div>

          {/* Action Bar (Lock, Add, Backup, Settings) */}
          <div className="flex items-center gap-2">
            {!isEmergencyUnlocked && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'notes') {
                    setEditingVaultNote(null);
                    setIsVaultNoteEditorOpen(true);
                  } else {
                    setIsVaultTaskEditorOpen(true);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-semibold transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>
            )}

            {/* Instant Lock */}
            <button
              type="button"
              onClick={lockVault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 border border-stone-800 text-stone-300 text-xs font-medium transition-all"
              title="Lock immediately and conceal vault"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>

            {/* Backup & Settings (Only visible in unlocked mode) */}
            <button
              type="button"
              onClick={() => setIsBackupOpen(true)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
              title="Vault Backup & Restore"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
              title="Vault Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Unlocked Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {isEmergencyUnlocked && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start gap-3">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div>
              <h3 className="font-editorial text-sm font-medium text-amber-300">
                Emergency Challenge Recovery View
              </h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                You authenticated via the emergency challenge. Only <strong>semi-confidential</strong>{' '}
                records are shown. Strictly confidential records remain locked.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notes' ? (
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-stone-800">
              <div>
                <h2 className="font-editorial text-2xl font-light text-stone-100 tracking-tight">
                  Encrypted Notes
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Stored as AES-256 ciphertexts in IndexedDB. Decrypted in RAM only.
                </p>
              </div>
              <span className="text-xs font-mono-code text-stone-500">
                {vaultNotes.length} notes
              </span>
            </div>

            {vaultNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaultNotes.map((note) => (
                  <VaultNoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => {
                      setEditingVaultNote(n);
                      setIsVaultNoteEditorOpen(true);
                    }}
                    onDelete={removeVaultNote}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-stone-800 rounded-3xl">
                <p className="font-editorial text-lg text-stone-400">Vault notes repository is empty</p>
                <p className="text-xs text-stone-500 mt-1">
                  Create your first encrypted note using the button above.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-stone-800">
              <div>
                <h2 className="font-editorial text-2xl font-light text-stone-100 tracking-tight">
                  Encrypted Checklists
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Confidential checklists with interactive progress tracking.
                </p>
              </div>
              <span className="text-xs font-mono-code text-stone-500">
                {vaultTasks.length} lists
              </span>
            </div>

            {vaultTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaultTasks.map((task) => (
                  <VaultTaskCard
                    key={task.id}
                    task={task}
                    onToggleItem={toggleVaultTaskItem}
                    onDelete={removeVaultTask}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-stone-800 rounded-3xl">
                <p className="font-editorial text-lg text-stone-400">No encrypted checklists</p>
                <p className="text-xs text-stone-500 mt-1">
                  Create an encrypted to-do list for confidential tasks.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Add for mobile */}
      {!isEmergencyUnlocked && (
        <div className="fixed bottom-6 right-6 sm:hidden z-20">
          <button
            onClick={() => {
              if (activeTab === 'notes') {
                setEditingVaultNote(null);
                setIsVaultNoteEditorOpen(true);
              } else {
                setIsVaultTaskEditorOpen(true);
              }
            }}
            className="w-13 h-13 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Vault Modals */}
      <VaultNoteEditor
        isOpen={isVaultNoteEditorOpen}
        initialNote={editingVaultNote}
        onClose={() => setIsVaultNoteEditorOpen(false)}
        onSave={async (n) => {
          await saveVaultNote(n);
        }}
      />

      <VaultTaskEditor
        isOpen={isVaultTaskEditorOpen}
        onClose={() => setIsVaultTaskEditorOpen(false)}
        onSave={async (t) => {
          await saveVaultTask(t);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ExportImportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={refreshVaultData}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
