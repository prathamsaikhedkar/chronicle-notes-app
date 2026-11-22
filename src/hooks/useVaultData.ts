import { useState, useEffect, useCallback } from 'react';
import type { DecryptedNote, DecryptedTask, EncryptedNote, EncryptedTask } from '../types';
import { useAuth } from '../context/AuthContext';
import { encryptData, decryptData } from '../services/crypto';
import {
  getAllEncryptedNotes,
  saveEncryptedNote,
  deleteEncryptedNote,
  getAllEncryptedTasks,
  saveEncryptedTask,
  deleteEncryptedTask,
} from '../services/storage';

export function useVaultData() {
  const { activeKey, emergencyKey, isEmergencyUnlocked, isLocked } = useAuth();
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [tasks, setTasks] = useState<DecryptedTask[]>([]);
  const [encryptedNotesRaw, setEncryptedNotesRaw] = useState<EncryptedNote[]>([]);
  const [encryptedTasksRaw, setEncryptedTasksRaw] = useState<EncryptedTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load raw encrypted data & decrypt if key is available
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawNotes = await getAllEncryptedNotes();
      const rawTasks = await getAllEncryptedTasks();
      setEncryptedNotesRaw(rawNotes);
      setEncryptedTasksRaw(rawTasks);

      // Decrypt notes & tasks
      if (activeKey) {
        // Master key is active - can decrypt everything
        const decryptedNotes: DecryptedNote[] = [];
        for (const raw of rawNotes) {
          try {
            const n = await decryptData<DecryptedNote>(raw.ciphertext, raw.iv, activeKey);
            decryptedNotes.push({ ...n, confidentiality: raw.confidentiality, id: raw.id });
          } catch (e) {
            console.error('Failed to decrypt note', raw.id, e);
          }
        }

        const decryptedTasks: DecryptedTask[] = [];
        for (const raw of rawTasks) {
          try {
            const t = await decryptData<DecryptedTask>(raw.ciphertext, raw.iv, activeKey);
            decryptedTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
          } catch (e) {
            console.error('Failed to decrypt task', raw.id, e);
          }
        }

        setNotes(decryptedNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setTasks(decryptedTasks.sort((a, b) => b.updatedAt - a.updatedAt));
      } else if (isEmergencyUnlocked && emergencyKey) {
        // Emergency recovery mode - ONLY semi-confidential notes can be deciphered!
        const rescuedNotes: DecryptedNote[] = [];
        for (const raw of rawNotes) {
          if (raw.confidentiality === 'semi-confidential' && raw.emergencyKeyCiphertext && raw.emergencyKeyIv) {
            try {
              const n = await decryptData<DecryptedNote>(raw.emergencyKeyCiphertext, raw.emergencyKeyIv, emergencyKey);
              rescuedNotes.push({ ...n, confidentiality: raw.confidentiality, id: raw.id });
            } catch (e) {
              console.error('Failed to emergency decrypt note', raw.id, e);
            }
          }
        }

        const rescuedTasks: DecryptedTask[] = [];
        for (const raw of rawTasks) {
          if (raw.confidentiality === 'semi-confidential' && raw.emergencyKeyCiphertext && raw.emergencyKeyIv) {
            try {
              const t = await decryptData<DecryptedTask>(raw.emergencyKeyCiphertext, raw.emergencyKeyIv, emergencyKey);
              rescuedTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
            } catch (e) {
              console.error('Failed to emergency decrypt task', raw.id, e);
            }
          }
        }

        setNotes(rescuedNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setTasks(rescuedTasks.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        // Clear plaintext when locked
        setNotes([]);
        setTasks([]);
      }
    } catch (err) {
      console.error('Error refreshing vault data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeKey, emergencyKey, isEmergencyUnlocked]);

  useEffect(() => {
    refreshData();
  }, [refreshData, isLocked]);

  // Save or update a note
  const saveNote = async (note: Omit<DecryptedNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!activeKey) throw new Error('Cannot save note while locked or in recovery-only mode');

    const now = Date.now();
    const id = note.id || `note_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const fullNote: DecryptedNote = {
      id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      confidentiality: note.confidentiality,
      createdAt: now,
      updatedAt: now,
    };

    // Encrypt with master key
    const masterEnc = await encryptData(fullNote, activeKey);

    let emergencyEnc: { ciphertext: string; iv: string } | undefined;
    if (note.confidentiality === 'semi-confidential' && emergencyKey) {
      emergencyEnc = await encryptData(fullNote, emergencyKey);
    }

    const encryptedRecord: EncryptedNote = {
      id,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: note.confidentiality,
      emergencyKeyIv: emergencyEnc?.iv,
      emergencyKeyCiphertext: emergencyEnc?.ciphertext,
      createdAt: now,
      updatedAt: now,
    };

    await saveEncryptedNote(encryptedRecord);
    await refreshData();
    return fullNote;
  };

  // Delete note
  const deleteNote = async (id: string) => {
    await deleteEncryptedNote(id);
    await refreshData();
  };

  // Save or update a task
  const saveTask = async (task: Omit<DecryptedTask, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!activeKey) throw new Error('Cannot save task while locked or in recovery-only mode');

    const now = Date.now();
    const id = task.id || `task_${now}_${Math.random().toString(36).substring(2, 7)}`;
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

    // Encrypt with master key
    const masterEnc = await encryptData(fullTask, activeKey);

    let emergencyEnc: { ciphertext: string; iv: string } | undefined;
    if (task.confidentiality === 'semi-confidential' && emergencyKey) {
      emergencyEnc = await encryptData(fullTask, emergencyKey);
    }

    const encryptedRecord: EncryptedTask = {
      id,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: task.confidentiality,
      emergencyKeyIv: emergencyEnc?.iv,
      emergencyKeyCiphertext: emergencyEnc?.ciphertext,
      createdAt: now,
      updatedAt: now,
    };

    await saveEncryptedTask(encryptedRecord);
    await refreshData();
    return fullTask;
  };

  // Toggle checklist item
  const toggleTaskItem = async (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedItems = task.items.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it));

    await saveTask({
      id: task.id,
      title: task.title,
      items: updatedItems,
      priority: task.priority,
      dueDate: task.dueDate,
      confidentiality: task.confidentiality,
    });
  };

  // Delete task
  const deleteTask = async (id: string) => {
    await deleteEncryptedTask(id);
    await refreshData();
  };

  return {
    notes,
    tasks,
    encryptedNotesRaw,
    encryptedTasksRaw,
    isLoading,
    saveNote,
    deleteNote,
    saveTask,
    toggleTaskItem,
    deleteTask,
    refreshData,
  };
}
