export type UnlockMethod = 'pin' | 'pattern';

export type ConfidentialityLevel = 'strictly-confidential' | 'semi-confidential';

export interface VaultMetadata {
  id: string; // 'vault_meta'
  unlockMethod: UnlockMethod;
  salt: string; // Base64 PBKDF2 salt
  verifierCiphertext: string; // Encrypted 'VAULT_VERIFIED' string to test key correctness
  verifierIv: string; // Base64 IV for verification
  puzzleKeyCiphertext: string; // Encrypted emergency key for semi-confidential notes
  puzzleKeyIv: string;
  createdAt: number;
  lastUnlockedAt?: number;
}

// Plaintext notes for the cover decoy mode (authentic working personal journal)
export interface PublicCoverNote {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: number;
}

export interface PublicCoverTask {
  id: string;
  title: string;
  items: { id: string; text: string; completed: boolean }[];
  updatedAt: number;
}

export interface EncryptedNote {
  id: string;
  iv: string; // Base64 IV
  ciphertext: string; // Base64 encrypted JSON
  confidentiality: ConfidentialityLevel;
  emergencyKeyIv?: string;
  emergencyKeyCiphertext?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DecryptedNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  confidentiality: ConfidentialityLevel;
  createdAt: number;
  updatedAt: number;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface EncryptedTask {
  id: string;
  iv: string;
  ciphertext: string;
  confidentiality: ConfidentialityLevel;
  emergencyKeyIv?: string;
  emergencyKeyCiphertext?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DecryptedTask {
  id: string;
  title: string;
  items: TaskChecklistItem[];
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  confidentiality: ConfidentialityLevel;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  autoLockMinutes: number; // e.g. 1, 3, 5, or 0 (manual only)
  lockOnTabBlur: boolean; // lock when switching tabs/apps
}
