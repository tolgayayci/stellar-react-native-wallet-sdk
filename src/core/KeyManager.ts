import { Keypair } from '@stellar/stellar-sdk';
import * as Keychain from 'react-native-keychain';
import 'react-native-get-random-values';
import { KeyPairData, AccountData } from '../types';

/**
 * KeyManager class for handling Stellar keypair operations
 * Responsible for generating, importing, and securely storing Stellar keypairs
 */
export class KeyManager {
  private readonly SERVICE_NAME = 'stellar-react-native-wallet-sdk';
  private readonly ACCOUNTS_KEY = 'accounts';

  /**
   * Generate a new Stellar keypair
   * @returns KeyPairData containing the public and secret keys
   */
  public generateKeypair(): KeyPairData {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Import a keypair from a secret key
   * @param secretKey - The Stellar secret key
   * @returns KeyPairData containing the public and secret keys
   */
  public importFromSecret(secretKey: string): KeyPairData {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
      };
    } catch (error) {
      throw new Error(`Invalid secret key: ${error}`);
    }
  }

  /**
   * Store an account in secure storage
   * @param account - The account data to store
   * @returns Promise<boolean> indicating success or failure
   */
  public async storeAccount(account: AccountData): Promise<boolean> {
    try {
      // Get existing accounts
      const accounts = await this.getAccounts();
      
      // Check if account already exists
      const existingIndex = accounts.findIndex(acc => acc.id === account.id);
      if (existingIndex >= 0) {
        accounts[existingIndex] = account;
      } else {
        accounts.push(account);
      }

      // Store accounts
      await Keychain.setGenericPassword(
        this.ACCOUNTS_KEY,
        JSON.stringify(accounts),
        { service: this.SERVICE_NAME }
      );

      return true;
    } catch (error) {
      console.error('Error storing account:', error);
      return false;
    }
  }

  /**
   * Get all stored accounts
   * @returns Promise<AccountData[]> - Array of stored accounts
   */
  public async getAccounts(): Promise<AccountData[]> {
    try {
      const result = await Keychain.getGenericPassword({ service: this.SERVICE_NAME });
      if (result) {
        return JSON.parse(result.password);
      }
      return [];
    } catch (error) {
      console.error('Error retrieving accounts:', error);
      return [];
    }
  }

  /**
   * Get a specific account by ID
   * @param id - The account ID (public key)
   * @returns Promise<AccountData | null> - The account data or null if not found
   */
  public async getAccount(id: string): Promise<AccountData | null> {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.id === id);
    return account || null;
  }

  /**
   * Delete an account from secure storage
   * @param id - The account ID (public key) to delete
   * @returns Promise<boolean> indicating success or failure
   */
  public async deleteAccount(id: string): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      const filteredAccounts = accounts.filter(acc => acc.id !== id);
      
      if (accounts.length === filteredAccounts.length) {
        return false; // Account not found
      }

      await Keychain.setGenericPassword(
        this.ACCOUNTS_KEY,
        JSON.stringify(filteredAccounts),
        { service: this.SERVICE_NAME }
      );

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  /**
   * Sign data with a keypair
   * @param data - The data to sign as a Buffer
   * @param secretKey - The secret key to sign with
   * @returns Buffer - The signature
   */
  public signData(data: Buffer, secretKey: string): Buffer {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      return keypair.sign(data);
    } catch (error) {
      throw new Error(`Error signing data: ${error}`);
    }
  }

  /**
   * Verify a signature
   * @param data - The data that was signed
   * @param signature - The signature to verify
   * @param publicKey - The public key to verify against
   * @returns boolean - Whether the signature is valid
   */
  public verifySignature(data: Buffer, signature: Buffer, publicKey: string): boolean {
    try {
      const keypair = Keypair.fromPublicKey(publicKey);
      return keypair.verify(data, signature);
    } catch (error) {
      throw new Error(`Error verifying signature: ${error}`);
    }
  }
}
