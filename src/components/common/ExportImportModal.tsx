import React, { useState } from 'react';
import { X, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAllEncryptedNotes, getAllEncryptedTasks, getVaultMetadata, saveEncryptedNote, saveEncryptedTask, saveVaultMetadata } from '../../services/storage';
import type { VaultMetadata, EncryptedNote, EncryptedTask } from '../../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

interface VaultBackupPayload {
  version: 2;
  exportDate: string;
  metadata: VaultMetadata;
  notes: EncryptedNote[];
  tasks: EncryptedTask[];
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const meta = await getVaultMetadata();
      if (!meta) {
        setErrorMessage('Vault is not yet initialized.');
        return;
      }

      const notes = await getAllEncryptedNotes();
      const tasks = await getAllEncryptedTasks();

      const backup: VaultBackupPayload = {
        version: 2,
        exportDate: new Date().toISOString(),
        metadata: meta,
        notes,
        tasks,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage('Encrypted vault exported. Store this file securely.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Export failed.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as VaultBackupPayload;

        if (!parsed.metadata || !Array.isArray(parsed.notes)) {
          setErrorMessage('Invalid backup structure.');
          return;
        }

        await saveVaultMetadata(parsed.metadata);
        for (const note of parsed.notes) {
          await saveEncryptedNote(note);
        }
        for (const task of parsed.tasks || []) {
          await saveEncryptedTask(task);
        }

        setStatusMessage('Vault successfully restored.');
        onDataRestored();
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to restore backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500">
              Data Management
            </span>
            <h3 className="font-editorial text-lg text-stone-100 font-medium">Backup & Restore</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            Backups contain only AES-GCM ciphertexts and your salt. Plaintext is never saved to the backup file.
          </p>

          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-stone-200">Export Encrypted Backup</div>
              <div className="text-[11px] text-stone-500">Save encrypted database to file</div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wide transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-stone-200">Import Vault Backup</div>
              <div className="text-[11px] text-stone-500">Restore from previously saved JSON</div>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {statusMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
