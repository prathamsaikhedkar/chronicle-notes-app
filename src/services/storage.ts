import { openDB, type IDBPDatabase } from 'idb';
import type {
  EncryptedNote,
  EncryptedTask,
  VaultMetadata,
  UserSettings,
  PublicCoverNote,
  PublicCoverTask,
} from '../types';

const DB_NAME = 'chronicle_journal_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

const INITIAL_COVER_NOTES: PublicCoverNote[] = [
  {
    id: 'cn-1',
    title: 'Weekend Farmer’s Market & Pantry Essentials',
    content: '1. Sourdough country loaf\n2. Aged gruyère cheese & unsalted grass-fed butter\n3. Fresh thyme, rosemary sprigs, and garlic bulbs\n4. Heirloom tomatoes and wild arugula\n5. Lavender hand soap for guest bath',
    category: 'Market',
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'cn-2',
    title: 'Recommended Architectural & Design Reads',
    content: '• "The Eyes of the Skin: Architecture and Sensory Perception" — Juhani Pallasmaa\n• "In Praise of Shadows" — Jun\'ichirō Tanizaki (re-read notes on subtle contrast and natural materials)\n• "The Design of Everyday Things" — Don Norman',
    category: 'Reading',
    updatedAt: Date.now() - 3600000 * 28,
  },
  {
    id: 'cn-3',
    title: 'Morning Pourover Coffee Recipe',
    content: 'Ratio: 1:16 (18g washed Ethiopian beans, 288g water at 93°C).\nPour 50g bloom for 45s, then circular pour to 180g, settle at 1:30, final pour to 288g. Total brew duration: 2:45 min.',
    category: 'Rituals',
    updatedAt: Date.now() - 3600000 * 52,
  },
];

const INITIAL_COVER_TASKS: PublicCoverTask[] = [
  {
    id: 'ct-1',
    title: 'Weekly Studio & Home Reset',
    items: [
      { id: 'i1', text: 'Water indoor monstera and fern collection', completed: true },
      { id: 'i2', text: 'Schedule dentist routine hygiene visit', completed: false },
      { id: 'i3', text: 'Clean coffee grinder burrs and wipe counter', completed: true },
      { id: 'i4', text: 'Sort paper mail and recycle packaging boxes', completed: false },
    ],
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'ct-2',
    title: 'Car Maintenance Checklist',
    items: [
      { id: 'i5', text: 'Check front & rear tire pressure', completed: true },
      { id: 'i6', text: 'Refill windshield wiper wash fluid', completed: false },
      { id: 'i7', text: 'Book upcoming annual inspection', completed: false },
    ],
    updatedAt: Date.now() - 3600000 * 40,
  },
];

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cover_notes')) {
          db.createObjectStore('cover_notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cover_tasks')) {
          db.createObjectStore('cover_tasks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Cover notes operations
export async function getCoverNotes(): Promise<PublicCoverNote[]> {
  const db = await getDB();
  const notes = await db.getAll('cover_notes');
  if (notes.length === 0) {
    for (const note of INITIAL_COVER_NOTES) {
      await db.put('cover_notes', note);
    }
    return INITIAL_COVER_NOTES;
  }
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveCoverNote(note: PublicCoverNote): Promise<void> {
  const db = await getDB();
  await db.put('cover_notes', note);
}

export async function deleteCoverNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cover_notes', id);
}

// Cover tasks operations
export async function getCoverTasks(): Promise<PublicCoverTask[]> {
  const db = await getDB();
  const tasks = await db.getAll('cover_tasks');
  if (tasks.length === 0) {
    for (const task of INITIAL_COVER_TASKS) {
      await db.put('cover_tasks', task);
    }
    return INITIAL_COVER_TASKS;
  }
  return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveCoverTask(task: PublicCoverTask): Promise<void> {
  const db = await getDB();
  await db.put('cover_tasks', task);
}

export async function deleteCoverTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cover_tasks', id);
}

// Vault Metadata & Encrypted Stores
export async function getVaultMetadata(): Promise<VaultMetadata | undefined> {
  const db = await getDB();
  return db.get('metadata', 'vault_meta');
}

export async function saveVaultMetadata(meta: VaultMetadata): Promise<void> {
  const db = await getDB();
  await db.put('metadata', meta);
}

export async function getAllEncryptedNotes(): Promise<EncryptedNote[]> {
  const db = await getDB();
  return db.getAll('notes');
}

export async function saveEncryptedNote(note: EncryptedNote): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function deleteEncryptedNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function getAllEncryptedTasks(): Promise<EncryptedTask[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function saveEncryptedTask(task: EncryptedTask): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteEncryptedTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

const DEFAULT_SETTINGS: UserSettings = {
  autoLockMinutes: 3,
  lockOnTabBlur: true,
};

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDB();
  const stored = await db.get('settings', 'user_settings');
  return stored ? (stored.data as UserSettings) : DEFAULT_SETTINGS;
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { id: 'user_settings', data: settings });
}

export async function clearAllVaultData(): Promise<void> {
  const db = await getDB();
  await db.clear('notes');
  await db.clear('tasks');
  await db.clear('metadata');
}
