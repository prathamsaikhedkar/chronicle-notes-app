import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { VaultMetadata, UserSettings, UnlockMethod } from '../types';
import {
  deriveKeyFromSecret,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  generateRandomBytes,
  createVaultVerificationToken,
  verifyMasterKey,
  deriveEmergencyKeyFromPuzzle,
} from '../services/crypto';
import {
  getVaultMetadata,
  saveVaultMetadata,
  getUserSettings,
  saveUserSettings,
} from '../services/storage';
import { EMERGENCY_RESCUE_TOKEN } from '../services/puzzles';

interface AuthContextType {
  isConfigured: boolean; // whether vault PIN/Pattern is already set up
  isLocked: boolean; // true = vault is locked
  activeKey: CryptoKey | null;
  emergencyKey: CryptoKey | null;
  isEmergencyUnlocked: boolean;
  metadata: VaultMetadata | null;
  settings: UserSettings;
  setupVault: (secret: string, method: UnlockMethod) => Promise<boolean>;
  unlockVault: (secret: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithEmergencyPuzzle: () => Promise<boolean>;
  lockVault: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  changeSecret: (oldSecret: string, newSecret: string, newMethod: UnlockMethod) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<CryptoKey | null>(null);
  const [emergencyKey, setEmergencyKey] = useState<CryptoKey | null>(null);
  const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);
  const [settings, setSettingsState] = useState<UserSettings>({
    autoLockMinutes: 3,
    lockOnTabBlur: true,
  });

  const reloadMetadata = useCallback(async () => {
    const meta = await getVaultMetadata();
    const sets = await getUserSettings();
    setSettingsState(sets);
    if (meta) {
      setMetadata(meta);
      setIsConfigured(true);
      setIsLocked(true);
    } else {
      setIsConfigured(false);
      setIsLocked(true);
    }
  }, []);

  useEffect(() => {
    reloadMetadata();
  }, [reloadMetadata]);

  const lockVault = useCallback(() => {
    setActiveKey(null);
    setEmergencyKey(null);
    setIsEmergencyUnlocked(false);
    setIsLocked(true);
  }, []);

  const setupVault = async (secret: string, method: UnlockMethod): Promise<boolean> => {
    try {
      const salt = generateRandomBytes(16);
      const masterKey = await deriveKeyFromSecret(secret, salt);
      const { verifierCiphertext, verifierIv } = await createVaultVerificationToken(masterKey);

      const emKey = await deriveEmergencyKeyFromPuzzle(EMERGENCY_RESCUE_TOKEN);
      const testToken = await createVaultVerificationToken(emKey);

      const newMeta: VaultMetadata = {
        id: 'vault_meta',
        unlockMethod: method,
        salt: arrayBufferToBase64(salt),
        verifierCiphertext,
        verifierIv,
        puzzleKeyCiphertext: testToken.verifierCiphertext,
        puzzleKeyIv: testToken.verifierIv,
        createdAt: Date.now(),
        lastUnlockedAt: Date.now(),
      };

      await saveVaultMetadata(newMeta);
      setMetadata(newMeta);
      setIsConfigured(true);
      setActiveKey(masterKey);
      setEmergencyKey(emKey);
      setIsEmergencyUnlocked(false);
      setIsLocked(false);
      return true;
    } catch (err) {
      console.error('Setup vault failed', err);
      return false;
    }
  };

  const unlockVault = async (secret: string): Promise<{ success: boolean; error?: string }> => {
    if (!metadata) {
      return { success: false, error: 'Vault credentials not initialized.' };
    }

    try {
      const saltBytes = new Uint8Array(base64ToArrayBuffer(metadata.salt));
      const keyCandidate = await deriveKeyFromSecret(secret, saltBytes);
      const isValid = await verifyMasterKey(keyCandidate, metadata.verifierCiphertext, metadata.verifierIv);

      if (!isValid) {
        return { success: false, error: 'Incorrect code. Access denied.' };
      }

      const emKey = await deriveEmergencyKeyFromPuzzle(EMERGENCY_RESCUE_TOKEN);

      setActiveKey(keyCandidate);
      setEmergencyKey(emKey);
      setIsEmergencyUnlocked(false);
      setIsLocked(false);

      const updatedMeta = { ...metadata, lastUnlockedAt: Date.now() };
      setMetadata(updatedMeta);
      await saveVaultMetadata(updatedMeta);

      return { success: true };
    } catch (err) {
      console.error('Unlock error', err);
      return { success: false, error: 'Authentication failed.' };
    }
  };

  const unlockWithEmergencyPuzzle = async (): Promise<boolean> => {
    try {
      const emKey = await deriveEmergencyKeyFromPuzzle(EMERGENCY_RESCUE_TOKEN);
      setEmergencyKey(emKey);
      setActiveKey(null);
      setIsEmergencyUnlocked(true);
      setIsLocked(false);
      return true;
    } catch (err) {
      console.error('Puzzle recovery failed', err);
      return false;
    }
  };

  const changeSecret = async (
    oldSecret: string,
    newSecret: string,
    newMethod: UnlockMethod
  ): Promise<{ success: boolean; error?: string }> => {
    if (!metadata) return { success: false, error: 'Vault not initialized.' };

    const saltBytes = new Uint8Array(base64ToArrayBuffer(metadata.salt));
    const oldKey = await deriveKeyFromSecret(oldSecret, saltBytes);
    const isValid = await verifyMasterKey(oldKey, metadata.verifierCiphertext, metadata.verifierIv);

    if (!isValid) {
      return { success: false, error: 'Current credential is incorrect.' };
    }

    const newSalt = generateRandomBytes(16);
    const newMasterKey = await deriveKeyFromSecret(newSecret, newSalt);
    const { verifierCiphertext, verifierIv } = await createVaultVerificationToken(newMasterKey);

    const updatedMeta: VaultMetadata = {
      ...metadata,
      unlockMethod: newMethod,
      salt: arrayBufferToBase64(newSalt),
      verifierCiphertext,
      verifierIv,
      lastUnlockedAt: Date.now(),
    };

    await saveVaultMetadata(updatedMeta);
    setMetadata(updatedMeta);
    setActiveKey(newMasterKey);
    return { success: true };
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettingsState(merged);
    await saveUserSettings(merged);
  };

  useEffect(() => {
    if (isLocked) return;

    let timeoutId: number | undefined;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (settings.autoLockMinutes > 0) {
        timeoutId = window.setTimeout(() => {
          lockVault();
        }, settings.autoLockMinutes * 60 * 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && settings.lockOnTabBlur) {
        lockVault();
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, settings.autoLockMinutes, settings.lockOnTabBlur, lockVault]);

  return (
    <AuthContext.Provider
      value={{
        isConfigured,
        isLocked,
        activeKey,
        emergencyKey,
        isEmergencyUnlocked,
        metadata,
        settings,
        setupVault,
        unlockVault,
        unlockWithEmergencyPuzzle,
        lockVault,
        updateSettings,
        changeSecret,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
