import { describe, it, expect } from 'vitest';
import {
  deriveKeyFromSecret,
  encryptData,
  decryptData,
  createVaultVerificationToken,
  verifyMasterKey,
  generateRandomBytes,
  deriveEmergencyKeyFromPuzzle,
} from './crypto';
import { EMERGENCY_RESCUE_TOKEN } from './puzzles';

describe('ShadowVault Cryptography Pipeline', () => {
  it('should derive key, encrypt and decrypt notes correctly with valid PIN', async () => {
    const pin = '4829';
    const salt = generateRandomBytes(16);
    const key = await deriveKeyFromSecret(pin, salt);

    const testPayload = {
      title: 'Secret Bank Account Keys',
      content: 'Account: 9482-1928-1092, Routing: 021000021',
      tags: ['finance', 'strictly-confidential'],
    };

    // Encrypt
    const encrypted = await encryptData(testPayload, key);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(typeof encrypted.ciphertext).toBe('string');

    // Decrypt
    const decrypted = await decryptData<typeof testPayload>(
      encrypted.ciphertext,
      encrypted.iv,
      key
    );

    expect(decrypted.title).toBe(testPayload.title);
    expect(decrypted.content).toBe(testPayload.content);
    expect(decrypted.tags).toEqual(testPayload.tags);
  });

  it('should fail decryption when using an incorrect key/PIN', async () => {
    const correctPin = '7391';
    const wrongPin = '0000';
    const salt = generateRandomBytes(16);

    const key = await deriveKeyFromSecret(correctPin, salt);
    const wrongKey = await deriveKeyFromSecret(wrongPin, salt);

    const encrypted = await encryptData({ text: 'Confidential message' }, key);

    await expect(
      decryptData(encrypted.ciphertext, encrypted.iv, wrongKey)
    ).rejects.toThrow();
  });

  it('should verify master key correctly and reject wrong master key', async () => {
    const patternGesture = '0-1-2-5-8';
    const salt = generateRandomBytes(16);
    const validKey = await deriveKeyFromSecret(patternGesture, salt);
    const invalidKey = await deriveKeyFromSecret('0-1-2-5-7', salt);

    const token = await createVaultVerificationToken(validKey);

    const validResult = await verifyMasterKey(
      validKey,
      token.verifierCiphertext,
      token.verifierIv
    );
    expect(validResult).toBe(true);

    const invalidResult = await verifyMasterKey(
      invalidKey,
      token.verifierCiphertext,
      token.verifierIv
    );
    expect(invalidResult).toBe(false);
  });

  it('should enable emergency rescue decryption for semi-confidential notes using puzzle token', async () => {
    // Emergency rescue key
    const rescueKey = await deriveEmergencyKeyFromPuzzle(EMERGENCY_RESCUE_TOKEN);

    const semiConfidentialNote = {
      title: 'Semi-Confidential Tax Document Info',
      content: 'Ref number: TAX-2026-991',
    };

    // Encrypted with emergency key
    const emergencyEncrypted = await encryptData(semiConfidentialNote, rescueKey);

    // Pretend user lost their PIN: recover using solved puzzle token
    const recoveredNote = await decryptData<typeof semiConfidentialNote>(
      emergencyEncrypted.ciphertext,
      emergencyEncrypted.iv,
      rescueKey
    );

    expect(recoveredNote.title).toBe(semiConfidentialNote.title);
    expect(recoveredNote.content).toBe(semiConfidentialNote.content);
  });
});
