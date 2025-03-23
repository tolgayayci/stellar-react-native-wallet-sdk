import { Networks } from '@stellar/stellar-sdk';
import { NetworkConfig, NetworkType, BalanceData } from '../types';

/**
 * HorizonService class for interacting with the Stellar Horizon API
 * Responsible for querying account data, submitting transactions, and accessing network information
 */
export class HorizonService {
  private server: any;
  private networkConfig: NetworkConfig;

  /**
   * Create a new HorizonService instance
   * @param networkConfig - Configuration for the Stellar network
   */
  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig;
    // Dynamically import Server to avoid TypeScript errors
    // This is a workaround for the Stellar SDK's TypeScript definitions
    const { Server } = require('@stellar/stellar-sdk');
    this.server = new Server(networkConfig.horizonUrl);
  }

  /**
   * Create a new HorizonService instance for the public network
   * @returns HorizonService - A new HorizonService instance for the public network
   */
  public static publicNetwork(): HorizonService {
    return new HorizonService({
      networkType: NetworkType.PUBLIC,
      networkPassphrase: Networks.PUBLIC,
      horizonUrl: 'https://horizon.stellar.org',
    });
  }

  /**
   * Create a new HorizonService instance for the test network
   * @returns HorizonService - A new HorizonService instance for the test network
   */
  public static testNetwork(): HorizonService {
    return new HorizonService({
      networkType: NetworkType.TESTNET,
      networkPassphrase: Networks.TESTNET,
      horizonUrl: 'https://horizon-testnet.stellar.org',
    });
  }

  /**
   * Create a new HorizonService instance for a custom network
   * @param horizonUrl - The URL of the Horizon server
   * @param networkPassphrase - The network passphrase
   * @returns HorizonService - A new HorizonService instance for the custom network
   */
  public static customNetwork(horizonUrl: string, networkPassphrase: string): HorizonService {
    return new HorizonService({
      networkType: NetworkType.CUSTOM,
      networkPassphrase,
      horizonUrl,
    });
  }

  /**
   * Get the current Horizon server instance
   * @returns Server - The Horizon server instance
   */
  public getServer(): any {
    return this.server;
  }

  /**
   * Get the network passphrase
   * @returns string - The network passphrase
   */
  public getNetworkPassphrase(): string {
    return this.networkConfig.networkPassphrase;
  }

  /**
   * Get the network type
   * @returns NetworkType - The network type
   */
  public getNetworkType(): NetworkType {
    return this.networkConfig.networkType;
  }

  /**
   * Get the network configuration
   * @returns The network configuration
   */
  public getNetworkConfig(): NetworkConfig {
    return this.networkConfig;
  }

  /**
   * Load account data from the Horizon server
   * @param publicKey - The public key of the account
   * @returns Promise<any> - The account data
   */
  public async loadAccount(publicKey: string): Promise<any> {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Error loading account: ${error}`);
    }
  }

  /**
   * Get account balances
   * @param publicKey - The public key of the account
   * @returns Promise<BalanceData[]> - The account balances
   */
  public async getAccountBalances(publicKey: string): Promise<BalanceData[]> {
    try {
      const account = await this.loadAccount(publicKey);
      return account.balances as BalanceData[];
    } catch (error) {
      throw new Error(`Error getting account balances: ${error}`);
    }
  }

  /**
   * Get transaction history for an account
   * @param publicKey - The public key of the account
   * @param limit - The maximum number of transactions to return (default: 10)
   * @returns Promise<any[]> - The transaction history
   */
  public async getTransactionHistory(
    publicKey: string,
    limit = 10
  ): Promise<any[]> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();
      return transactions.records || [];
    } catch (error) {
      throw new Error(`Error getting transaction history: ${error}`);
    }
  }

  /**
   * Get payment history for an account
   * @param publicKey - The public key of the account
   * @param limit - The maximum number of payments to return (default: 10)
   * @returns Promise<any[]> - The payment history
   */
  public async getPaymentHistory(
    publicKey: string,
    limit = 10
  ): Promise<any[]> {
    try {
      const payments = await this.server
        .payments()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();
      return payments.records || [];
    } catch (error) {
      throw new Error(`Error getting payment history: ${error}`);
    }
  }

  /**
   * Get balances
   * @param publicKey - The public key of the account
   * @returns Array of account balances
   */
  public async getBalances(publicKey: string): Promise<any[]> {
    try {
      const account = await this.loadAccount(publicKey);
      return account.balances || [];
    } catch (error) {
      console.error('Error getting balances:', error);
      throw error;
    }
  }

  /**
   * Submit a transaction envelope to the network
   * @param transactionEnvelope - The transaction envelope XDR
   * @returns Promise<any> - The transaction result
   */
  public async submitTransaction(transactionEnvelope: any): Promise<any> {
    try {
      return await this.server.submitTransaction(transactionEnvelope);
    } catch (error) {
      // @ts-ignore - Stellar SDK throws errors with additional properties
      if (error.response && error.response.data && error.response.data.extras) {
        // @ts-ignore
        throw new Error(`Transaction failed: ${JSON.stringify(error.response.data.extras.result_codes)}`);
      }
      throw new Error(`Error submitting transaction: ${error}`);
    }
  }

  /**
   * Submit a transaction to the network
   * @param transactionXDR - The transaction XDR
   * @returns The transaction result
   */
  public async submitTransactionXDR(transactionXDR: string): Promise<any> {
    try {
      const StellarSdk = require('@stellar/stellar-sdk');
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        transactionXDR,
        this.networkConfig.networkPassphrase
      );
      return await this.server.submitTransaction(transaction);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }

  /**
   * Check if an account exists
   * @param publicKey - The public key of the account
   * @returns Promise<boolean> - Whether the account exists
   */
  public async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}
