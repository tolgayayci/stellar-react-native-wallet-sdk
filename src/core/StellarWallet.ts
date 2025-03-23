import { Networks } from '@stellar/stellar-sdk';
import { KeyManager } from './KeyManager';
import { HorizonService } from './HorizonService';
import { TransactionService } from './TransactionService';
import { EventService } from './EventService';
import { NetworkType, NetworkConfig, AccountData, PaymentOptions, TrustlineOptions } from '../types';

/**
 * StellarWallet class - Main entry point for the Stellar React Native Wallet SDK
 * Integrates all core modules: KeyManager, HorizonService, TransactionService, and EventService
 */
export class StellarWallet {
  private keyManager: KeyManager;
  private horizonService: HorizonService;
  private transactionService: TransactionService;
  private eventService: EventService;

  /**
   * Create a new StellarWallet instance
   * @param networkConfig - The network configuration to use
   */
  constructor(networkConfig: NetworkConfig) {
    this.keyManager = new KeyManager();
    this.horizonService = new HorizonService(networkConfig);
    this.transactionService = new TransactionService(this.horizonService);
    this.eventService = new EventService(this.horizonService);
  }

  /**
   * Create a new StellarWallet instance for the public network
   * @returns StellarWallet - A new StellarWallet instance for the public network
   */
  public static publicNetwork(): StellarWallet {
    return new StellarWallet({
      networkType: NetworkType.PUBLIC,
      networkPassphrase: Networks.PUBLIC,
      horizonUrl: 'https://horizon.stellar.org',
    });
  }

  /**
   * Create a new StellarWallet instance for the test network
   * @returns StellarWallet - A new StellarWallet instance for the test network
   */
  public static testNetwork(): StellarWallet {
    return new StellarWallet({
      networkType: NetworkType.TESTNET,
      networkPassphrase: Networks.TESTNET,
      horizonUrl: 'https://horizon-testnet.stellar.org',
    });
  }

  /**
   * Create a new StellarWallet instance for a custom network
   * @param horizonUrl - The URL of the Horizon server
   * @param networkPassphrase - The network passphrase
   * @returns StellarWallet - A new StellarWallet instance for the custom network
   */
  public static customNetwork(horizonUrl: string, networkPassphrase: string): StellarWallet {
    return new StellarWallet({
      networkType: NetworkType.CUSTOM,
      networkPassphrase,
      horizonUrl,
    });
  }

  /**
   * Get the KeyManager instance
   * @returns KeyManager - The KeyManager instance
   */
  public getKeyManager(): KeyManager {
    return this.keyManager;
  }

  /**
   * Get the HorizonService instance
   * @returns HorizonService - The HorizonService instance
   */
  public getHorizonService(): HorizonService {
    return this.horizonService;
  }

  /**
   * Get the TransactionService instance
   * @returns TransactionService - The TransactionService instance
   */
  public getTransactionService(): TransactionService {
    return this.transactionService;
  }

  /**
   * Get the EventService instance
   * @returns EventService - The EventService instance
   */
  public getEventService(): EventService {
    return this.eventService;
  }

  /**
   * Generate a new Stellar account
   * @param name - Optional name for the account
   * @returns AccountData - The new account data
   */
  public generateAccount(name?: string): AccountData {
    const keyPair = this.keyManager.generateKeypair();
    return {
      id: keyPair.publicKey,
      name: name || 'Account ' + keyPair.publicKey.substring(0, 5),
      keyPair,
    };
  }

  /**
   * Import an account from a secret key
   * @param secretKey - The secret key to import
   * @param name - Optional name for the account
   * @returns AccountData - The imported account data
   */
  public importAccount(secretKey: string, name?: string): AccountData {
    const keyPair = this.keyManager.importFromSecret(secretKey);
    return {
      id: keyPair.publicKey,
      name: name || 'Account ' + keyPair.publicKey.substring(0, 5),
      keyPair,
    };
  }

  /**
   * Store an account in secure storage
   * @param account - The account data to store
   * @returns Promise<boolean> - Whether the account was stored successfully
   */
  public async storeAccount(account: AccountData): Promise<boolean> {
    return this.keyManager.storeAccount(account);
  }

  /**
   * Get all stored accounts
   * @returns Promise<AccountData[]> - The stored accounts
   */
  public async getAccounts(): Promise<AccountData[]> {
    return this.keyManager.getAccounts();
  }

  /**
   * Get a specific account by ID
   * @param id - The account ID (public key)
   * @returns Promise<AccountData | null> - The account data or null if not found
   */
  public async getAccount(id: string): Promise<AccountData | null> {
    return this.keyManager.getAccount(id);
  }

  /**
   * Delete an account from secure storage
   * @param id - The account ID (public key) to delete
   * @returns Promise<boolean> - Whether the account was deleted successfully
   */
  public async deleteAccount(id: string): Promise<boolean> {
    return this.keyManager.deleteAccount(id);
  }

  /**
   * Load account data from the Horizon server
   * @param publicKey - The public key of the account
   * @returns Promise<AccountData> - The account data with updated balances
   */
  public async loadAccountData(publicKey: string): Promise<AccountData> {
    try {
      // Get account from storage
      const storedAccount = await this.keyManager.getAccount(publicKey);
      if (!storedAccount) {
        throw new Error(`Account not found: ${publicKey}`);
      }

      // Load account data from Horizon
      const accountRecord = await this.horizonService.loadAccount(publicKey);
      
      // Update account with balances
      const updatedAccount: AccountData = {
        ...storedAccount,
        balances: accountRecord.balances,
      };

      // Store updated account
      await this.keyManager.storeAccount(updatedAccount);

      return updatedAccount;
    } catch (error) {
      throw new Error(`Error loading account data: ${error}`);
    }
  }

  /**
   * Send a payment
   * @param sourcePublicKey - The public key of the source account
   * @param secretKey - The secret key of the source account
   * @param options - The payment options
   * @returns Promise<any> - The transaction result
   */
  public async sendPayment(
    sourcePublicKey: string,
    secretKey: string,
    options: PaymentOptions
  ): Promise<any> {
    return this.transactionService.sendPayment(sourcePublicKey, secretKey, options);
  }

  /**
   * Add a trustline for an asset
   * @param sourcePublicKey - The public key of the source account
   * @param secretKey - The secret key of the source account
   * @param options - The trustline options
   * @returns Promise<any> - The transaction result
   */
  public async addTrustline(
    sourcePublicKey: string,
    secretKey: string,
    options: TrustlineOptions
  ): Promise<any> {
    return this.transactionService.addTrustline(sourcePublicKey, secretKey, options);
  }

  /**
   * Create a new account on the Stellar network
   * @param sourcePublicKey - The public key of the source account
   * @param secretKey - The secret key of the source account
   * @param destinationPublicKey - The public key of the new account
   * @param startingBalance - The starting balance for the new account
   * @returns Promise<any> - The transaction result
   */
  public async createAccount(
    sourcePublicKey: string,
    secretKey: string,
    destinationPublicKey: string,
    startingBalance = '1'
  ): Promise<any> {
    return this.transactionService.createAccount(
      sourcePublicKey,
      secretKey,
      destinationPublicKey,
      startingBalance
    );
  }

  /**
   * Subscribe to account updates
   * @param publicKey - The public key of the account to monitor
   * @returns string - A subscription ID that can be used to unsubscribe
   */
  public subscribeToAccount(publicKey: string): string {
    return this.eventService.subscribeToAccount(publicKey);
  }

  /**
   * Subscribe to payment events
   * @param publicKey - The public key of the account to monitor
   * @returns string - A subscription ID that can be used to unsubscribe
   */
  public subscribeToPayments(publicKey: string): string {
    return this.eventService.subscribeToPayments(publicKey);
  }

  /**
   * Unsubscribe from events
   * @param subscriptionId - The subscription ID to unsubscribe
   * @returns boolean - Whether the unsubscription was successful
   */
  public unsubscribe(subscriptionId: string): boolean {
    return this.eventService.unsubscribe(subscriptionId);
  }

  /**
   * Unsubscribe from all events
   */
  public unsubscribeAll(): void {
    this.eventService.unsubscribeAll();
  }
}
