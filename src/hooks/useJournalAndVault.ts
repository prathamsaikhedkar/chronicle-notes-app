import { useState, useEffect, useCallback } from 'react';
import type {
  DecryptedNote,
  DecryptedTask,
  PublicCoverNote,
  PublicCoverTask,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { encryptData, decryptData } from '../services/crypto';
import {
  getAllEncryptedNotes,
  saveEncryptedNote,
  deleteEncryptedNote,
  getAllEncryptedTasks,
  saveEncryptedTask,
  deleteEncryptedTask,
  getCoverNotes,
  saveCoverNote,
  deleteCoverNote,
  getCoverTasks,
  saveCoverTask,
  deleteCoverTask,
} from '../services/storage';

export function useJournalAndVault() {
  const { activeKey, emergencyKey, isEmergencyUnlocked, isLocked } = useAuth();

  // Public cover journal state (shown when locked)
  const [coverNotes, setCoverNotes] = useState<PublicCoverNote[]>([]);
  const [coverTasks, setCoverTasks] = useState<PublicCoverTask[]>([]);

  // Secret vault state (shown when unlocked)
  const [vaultNotes, setVaultNotes] = useState<DecryptedNote[]>([]);
  const [vaultTasks, setVaultTasks] = useState<DecryptedTask[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load cover data
  const refreshCoverData = useCallback(async () => {
    try {
      const cNotes = await getCoverNotes();
      const cTasks = await getCoverTasks();
      setCoverNotes(cNotes);
      setCoverTasks(cTasks);
    } catch (e) {
      console.error('Error fetching cover journal', e);
    }
  }, []);

  // Load & decrypt vault data
  const refreshVaultData = useCallback(async () => {
    if (!activeKey && !(isEmergencyUnlocked && emergencyKey)) {
      setVaultNotes([]);
      setVaultTasks([]);
      return;
    }

    try {
      const rawNotes = await getAllEncryptedNotes();
      const rawTasks = await getAllEncryptedTasks();

      if (activeKey) {
        // Full master unlock
        const decNotes: DecryptedNote[] = [];
        for (const raw of rawNotes) {
          try {
            const n = await decryptData<DecryptedNote>(raw.ciphertext, raw.iv, activeKey);
            decNotes.push({ ...n, confidentiality: raw.confidentiality, id: raw.id });
          } catch (e) {
            console.error('Decryption failed for note', raw.id, e);
          }
        }

        const decTasks: DecryptedTask[] = [];
        for (const raw of rawTasks) {
          try {
            const t = await decryptData<DecryptedTask>(raw.ciphertext, raw.iv, activeKey);
            decTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
          } catch (e) {
            console.error('Decryption failed for task', raw.id, e);
          }
        }

        setVaultNotes(decNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultTasks(decTasks.sort((a, b) => b.updatedAt - a.updatedAt));
      } else if (isEmergencyUnlocked && emergencyKey) {
        // Emergency puzzle recovery: only decipher semi-confidential records!
        const recNotes: DecryptedNote[] = [];
        for (const raw of rawNotes) {
          if (raw.confidentiality === 'semi-confidential' && raw.emergencyKeyCiphertext && raw.emergencyKeyIv) {
            try {
              const n = await decryptData<DecryptedNote>(raw.emergencyKeyCiphertext, raw.emergencyKeyIv, emergencyKey);
              recNotes.push({ ...n, confidentiality: raw.confidentiality, id: raw.id });
            } catch (e) {
              console.error('Emergency decryption error for note', raw.id, e);
            }
          }
        }

        const recTasks: DecryptedTask[] = [];
        for (const raw of rawTasks) {
          if (raw.confidentiality === 'semi-confidential' && raw.emergencyKeyCiphertext && raw.emergencyKeyIv) {
            try {
              const t = await decryptData<DecryptedTask>(raw.emergencyKeyCiphertext, raw.emergencyKeyIv, emergencyKey);
              recTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
            } catch (e) {
              console.error('Emergency decryption error for task', raw.id, e);
            }
          }
        }

        setVaultNotes(recNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultTasks(recTasks.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    } catch (e) {
      console.error('Error refreshing vault data', e);
    }
  }, [activeKey, emergencyKey, isEmergencyUnlocked]);

  useEffect(() => {
    setIsLoading(true);
    refreshCoverData();
    refreshVaultData().finally(() => setIsLoading(false));
  }, [refreshCoverData, refreshVaultData, isLocked]);

  // --- Cover Actions (when locked) ---
  const addCoverNote = async (note: Omit<PublicCoverNote, 'id' | 'updatedAt'>) => {
    const newNote: PublicCoverNote = {
      id: `cn-${Date.now()}`,
      ...note,
      updatedAt: Date.now(),
    };
    await saveCoverNote(newNote);
    await refreshCoverData();
  };

  const removeCoverNote = async (id: string) => {
    await deleteCoverNote(id);
    await refreshCoverData();
  };

  const addCoverTask = async (title: string, items: { text: string; completed: boolean }[]) => {
    const newTask: PublicCoverTask = {
      id: `ct-${Date.now()}`,
      title,
      items: items.map((it, idx) => ({ id: `ci-${idx}-${Date.now()}`, text: it.text, completed: it.completed })),
      updatedAt: Date.now(),
    };
    await saveCoverTask(newTask);
    await refreshCoverData();
  };

  const toggleCoverTaskItem = async (taskId: string, itemId: string) => {
    const task = coverTasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = {
      ...task,
      items: task.items.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it)),
      updatedAt: Date.now(),
    };
    await saveCoverTask(updated);
    await refreshCoverData();
  };

  const removeCoverTask = async (id: string) => {
    await deleteCoverTask(id);
    await refreshCoverData();
  };

  // --- Vault Encrypted Actions (when unlocked) ---
  const saveVaultNote = async (note: Omit<DecryptedNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!activeKey) throw new Error('Cannot save encrypted note without active master key');

    const now = Date.now();
    const id = note.id || `vnote_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const fullNote: DecryptedNote = {
      id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      confidentiality: note.confidentiality,
      createdAt: now,
      updatedAt: now,
    };

    const masterEnc = await encryptData(fullNote, activeKey);

    let emergencyEnc: { ciphertext: string; iv: string } | undefined;
    if (note.confidentiality === 'semi-confidential' && emergencyKey) {
      emergencyEnc = await encryptData(fullNote, emergencyKey);
    }

    await saveEncryptedNote({
      id,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: note.confidentiality,
      emergencyKeyIv: emergencyEnc?.iv,
      emergencyKeyCiphertext: emergencyEnc?.ciphertext,
      createdAt: now,
      updatedAt: now,
    });

    await refreshVaultData();
    return fullNote;
  };

  const removeVaultNote = async (id: string) => {
    await deleteEncryptedNote(id);
    await refreshVaultData();
  };

  const saveVaultTask = async (task: Omit<DecryptedTask, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!activeKey) throw new Error('Cannot save task without master key');

    const now = Date.now();
    const id = task.id || `vtask_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const fullTask: DecryptedTask = {
      id,
      title: task.title,
      items: task.items,
      priority: task.priority,
      dueDate: task.dueDate,
      confidentiality: task.confidentiality,
      createdAt: now,
      updatedAt: now,
    };

    const masterEnc = await encryptData(fullTask, activeKey);

    let emergencyEnc: { ciphertext: string; iv: string } | undefined;
    if (task.confidentiality === 'semi-confidential' && emergencyKey) {
      emergencyEnc = await encryptData(fullTask, emergencyKey);
    }

    await saveEncryptedTask({
      id,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: task.confidentiality,
      emergencyKeyIv: emergencyEnc?.iv,
      emergencyKeyCiphertext: emergencyEnc?.ciphertext,
      createdAt: now,
      updatedAt: now,
    });

    await refreshVaultData();
    return fullTask;
  };

  const toggleVaultTaskItem = async (taskId: string, itemId: string) => {
    const task = vaultTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedItems = task.items.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it));

    await saveVaultTask({
      id: task.id,
      title: task.title,
      items: updatedItems,
      priority: task.priority,
      dueDate: task.dueDate,
      confidentiality: task.confidentiality,
    });
  };

  const removeVaultTask = async (id: string) => {
    await deleteEncryptedTask(id);
    await refreshVaultData();
  };

  return {
    isLoading,
    // Cover
    coverNotes,
    coverTasks,
    addCoverNote,
    removeCoverNote,
    addCoverTask,
    toggleCoverTaskItem,
    removeCoverTask,
    // Vault
    vaultNotes,
    vaultTasks,
    saveVaultNote,
    removeVaultNote,
    saveVaultTask,
    toggleVaultTaskItem,
    removeVaultTask,
    refreshVaultData,
  };
}
