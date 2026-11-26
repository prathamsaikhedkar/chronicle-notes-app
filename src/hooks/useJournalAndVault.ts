import { useState, useEffect, useCallback } from 'react';
import type {
  DecryptedNote,
  DecryptedTask,
  PublicCoverNote,
  PublicCoverTask,
  TaskChecklistItem,
} from '../types';
import type { WeekdayKey, WeeklyTasksMap } from '../components/vault/WeeklyChecklist';
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

const VAULT_DAILY_ID = 'vault_daily_checklist';
const VAULT_WEEKLY_ID = 'vault_weekly_checklist';
const COVER_DAILY_STORAGE_KEY = 'chronicle_daily_tasks';
const COVER_DAILY_DATE_KEY = 'chronicle_daily_last_reset';

function getLocalTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTodayWeekdayKey(): WeekdayKey {
  const day = new Date().getDay();
  const map: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day];
}

const EMPTY_WEEKLY_TASKS: WeeklyTasksMap = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

const DEFAULT_COVER_DAILY: TaskChecklistItem[] = [
  { id: 'cd-1', text: 'Morning walk (20 mins)', completed: true },
  { id: 'cd-2', text: 'Review reading notes', completed: false },
  { id: 'cd-3', text: 'Pick up fresh groceries', completed: false },
];

export function useJournalAndVault() {
  const { activeKey, emergencyKey, isEmergencyUnlocked, isLocked } = useAuth();

  // Public cover journal state (shown when locked)
  const [coverNotes, setCoverNotes] = useState<PublicCoverNote[]>([]);
  const [coverTasks, setCoverTasks] = useState<PublicCoverTask[]>([]);
  const [coverDailyTasks, setCoverDailyTasks] = useState<TaskChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(COVER_DAILY_STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as TaskChecklistItem[]) : DEFAULT_COVER_DAILY;
      const today = getLocalTodayStr();
      const lastReset = localStorage.getItem(COVER_DAILY_DATE_KEY);
      if (lastReset !== today) {
        localStorage.setItem(COVER_DAILY_DATE_KEY, today);
        const resetItems = parsed.map((it) => ({ ...it, completed: false }));
        localStorage.setItem(COVER_DAILY_STORAGE_KEY, JSON.stringify(resetItems));
        return resetItems;
      }
      return parsed;
    } catch {
      return DEFAULT_COVER_DAILY;
    }
  });

  // Secret vault state (shown when unlocked)
  const [vaultNotes, setVaultNotes] = useState<DecryptedNote[]>([]);
  const [vaultTasks, setVaultTasks] = useState<DecryptedTask[]>([]);
  const [vaultDailyTasks, setVaultDailyTasks] = useState<TaskChecklistItem[]>([]);
  const [vaultWeeklyTasks, setVaultWeeklyTasks] = useState<WeeklyTasksMap>(EMPTY_WEEKLY_TASKS);
  const [vaultWeeklyLastReset, setVaultWeeklyLastReset] = useState<Partial<Record<WeekdayKey, string>>>({});

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
      setVaultDailyTasks([]);
      setVaultWeeklyTasks(EMPTY_WEEKLY_TASKS);
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
        let dailyItems: TaskChecklistItem[] = [];
        let dailyNeedsReset = false;
        let weeklyMap: WeeklyTasksMap = { ...EMPTY_WEEKLY_TASKS };
        let weeklyResetDates: Partial<Record<WeekdayKey, string>> = {};
        let weeklyNeedsReset = false;
        const todayStr = getLocalTodayStr();
        const todayWeekday = getTodayWeekdayKey();

        for (const raw of rawTasks) {
          try {
            if (raw.id === VAULT_DAILY_ID) {
              const t = await decryptData<DecryptedTask & { lastResetDate?: string }>(raw.ciphertext, raw.iv, activeKey);
              dailyItems = t.items || [];
              if (t.lastResetDate !== todayStr) {
                dailyItems = dailyItems.map((it) => ({ ...it, completed: false }));
                dailyNeedsReset = true;
              }
            } else if (raw.id === VAULT_WEEKLY_ID) {
              const w = await decryptData<{ weekly: WeeklyTasksMap; lastResetDates?: Partial<Record<WeekdayKey, string>> }>(
                raw.ciphertext,
                raw.iv,
                activeKey
              );
              weeklyMap = { ...EMPTY_WEEKLY_TASKS, ...(w.weekly || {}) };
              weeklyResetDates = { ...(w.lastResetDates || {}) };
              if (weeklyResetDates[todayWeekday] !== todayStr) {
                weeklyMap[todayWeekday] = (weeklyMap[todayWeekday] || []).map((it) => ({ ...it, completed: false }));
                weeklyResetDates[todayWeekday] = todayStr;
                weeklyNeedsReset = true;
              }
            } else {
              const t = await decryptData<DecryptedTask>(raw.ciphertext, raw.iv, activeKey);
              decTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
            }
          } catch (e) {
            console.error('Decryption failed for task', raw.id, e);
          }
        }

        setVaultNotes(decNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultTasks(decTasks.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultDailyTasks(dailyItems);
        setVaultWeeklyTasks(weeklyMap);
        setVaultWeeklyLastReset(weeklyResetDates);

        if (dailyNeedsReset) {
          const now = Date.now();
          const enc = await encryptData({ id: VAULT_DAILY_ID, items: dailyItems, lastResetDate: todayStr }, activeKey);
          await saveEncryptedTask({
            id: VAULT_DAILY_ID,
            iv: enc.iv,
            ciphertext: enc.ciphertext,
            confidentiality: 'strictly-confidential',
            createdAt: now,
            updatedAt: now,
          });
        }
        if (weeklyNeedsReset) {
          const now = Date.now();
          const enc = await encryptData({ weekly: weeklyMap, lastResetDates: weeklyResetDates }, activeKey);
          await saveEncryptedTask({
            id: VAULT_WEEKLY_ID,
            iv: enc.iv,
            ciphertext: enc.ciphertext,
            confidentiality: 'strictly-confidential',
            createdAt: now,
            updatedAt: now,
          });
        }
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
        let dailyItems: TaskChecklistItem[] = [];
        for (const raw of rawTasks) {
          if (raw.confidentiality === 'semi-confidential' && raw.emergencyKeyCiphertext && raw.emergencyKeyIv) {
            try {
              const t = await decryptData<DecryptedTask>(raw.emergencyKeyCiphertext, raw.emergencyKeyIv, emergencyKey);
              if (raw.id === VAULT_DAILY_ID) {
                dailyItems = t.items || [];
              } else {
                recTasks.push({ ...t, confidentiality: raw.confidentiality, id: raw.id });
              }
            } catch (e) {
              console.error('Emergency decryption error for task', raw.id, e);
            }
          }
        }

        setVaultNotes(recNotes.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultTasks(recTasks.sort((a, b) => b.updatedAt - a.updatedAt));
        setVaultDailyTasks(dailyItems);
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

  // --- Cover Daily Tasks ---
  const persistCoverDaily = (next: TaskChecklistItem[]) => {
    setCoverDailyTasks(next);
    try {
      localStorage.setItem(COVER_DAILY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  };

  const addCoverDailyTask = (text: string) => {
    const next = [...coverDailyTasks, { id: `cd-${Date.now()}`, text, completed: false }];
    persistCoverDaily(next);
  };

  const toggleCoverDailyTask = (id: string) => {
    const next = coverDailyTasks.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
    persistCoverDaily(next);
  };

  const deleteCoverDailyTask = (id: string) => {
    const next = coverDailyTasks.filter((it) => it.id !== id);
    persistCoverDaily(next);
  };

  const uncheckAllCoverDailyTasks = () => {
    const next = coverDailyTasks.map((it) => ({ ...it, completed: false }));
    persistCoverDaily(next);
  };

  // --- Vault Daily Tasks (Encrypted) ---
  const persistVaultDaily = async (next: TaskChecklistItem[]) => {
    if (!activeKey) return;
    setVaultDailyTasks(next);
    const now = Date.now();
    const payload = {
      id: VAULT_DAILY_ID,
      title: 'Daily Checklist',
      items: next,
      lastResetDate: getLocalTodayStr(),
      priority: 'medium' as const,
      confidentiality: 'strictly-confidential' as const,
      createdAt: now,
      updatedAt: now,
    };
    const masterEnc = await encryptData(payload, activeKey);
    await saveEncryptedTask({
      id: VAULT_DAILY_ID,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: 'strictly-confidential',
      createdAt: now,
      updatedAt: now,
    });
  };

  const addVaultDailyTask = async (text: string) => {
    const next = [...vaultDailyTasks, { id: `vd-${Date.now()}`, text, completed: false }];
    await persistVaultDaily(next);
  };

  const toggleVaultDailyTask = async (id: string) => {
    const next = vaultDailyTasks.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
    await persistVaultDaily(next);
  };

  const deleteVaultDailyTask = async (id: string) => {
    const next = vaultDailyTasks.filter((it) => it.id !== id);
    await persistVaultDaily(next);
  };

  const uncheckAllVaultDailyTasks = async () => {
    const next = vaultDailyTasks.map((it) => ({ ...it, completed: false }));
    await persistVaultDaily(next);
  };

  // --- Vault Weekly Tasks (Encrypted) ---
  const persistVaultWeekly = async (next: WeeklyTasksMap) => {
    if (!activeKey) return;
    setVaultWeeklyTasks(next);
    const updatedResetDates = {
      ...vaultWeeklyLastReset,
      [getTodayWeekdayKey()]: getLocalTodayStr(),
    };
    setVaultWeeklyLastReset(updatedResetDates);
    const now = Date.now();
    const masterEnc = await encryptData({ weekly: next, lastResetDates: updatedResetDates }, activeKey);
    await saveEncryptedTask({
      id: VAULT_WEEKLY_ID,
      iv: masterEnc.iv,
      ciphertext: masterEnc.ciphertext,
      confidentiality: 'strictly-confidential',
      createdAt: now,
      updatedAt: now,
    });
  };

  const addVaultWeeklyTask = async (day: WeekdayKey, text: string) => {
    const dayItems = vaultWeeklyTasks[day] || [];
    const next: WeeklyTasksMap = {
      ...vaultWeeklyTasks,
      [day]: [...dayItems, { id: `vw-${Date.now()}`, text, completed: false }],
    };
    await persistVaultWeekly(next);
  };

  const toggleVaultWeeklyTask = async (day: WeekdayKey, id: string) => {
    const dayItems = vaultWeeklyTasks[day] || [];
    const next: WeeklyTasksMap = {
      ...vaultWeeklyTasks,
      [day]: dayItems.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)),
    };
    await persistVaultWeekly(next);
  };

  const deleteVaultWeeklyTask = async (day: WeekdayKey, id: string) => {
    const dayItems = vaultWeeklyTasks[day] || [];
    const next: WeeklyTasksMap = {
      ...vaultWeeklyTasks,
      [day]: dayItems.filter((it) => it.id !== id),
    };
    await persistVaultWeekly(next);
  };

  const uncheckAllVaultWeeklyTasks = async (day: WeekdayKey) => {
    const dayItems = vaultWeeklyTasks[day] || [];
    const next: WeeklyTasksMap = {
      ...vaultWeeklyTasks,
      [day]: dayItems.map((it) => ({ ...it, completed: false })),
    };
    await persistVaultWeekly(next);
  };

  return {
    isLoading,
    // Cover
    coverNotes,
    coverTasks,
    coverDailyTasks,
    addCoverNote,
    removeCoverNote,
    addCoverTask,
    toggleCoverTaskItem,
    removeCoverTask,
    addCoverDailyTask,
    toggleCoverDailyTask,
    deleteCoverDailyTask,
    uncheckAllCoverDailyTasks,
    // Vault
    vaultNotes,
    vaultTasks,
    vaultDailyTasks,
    vaultWeeklyTasks,
    saveVaultNote,
    removeVaultNote,
    saveVaultTask,
    toggleVaultTaskItem,
    removeVaultTask,
    addVaultDailyTask,
    toggleVaultDailyTask,
    deleteVaultDailyTask,
    uncheckAllVaultDailyTasks,
    addVaultWeeklyTask,
    toggleVaultWeeklyTask,
    deleteVaultWeeklyTask,
    uncheckAllVaultWeeklyTasks,
    refreshVaultData,
  };
}
