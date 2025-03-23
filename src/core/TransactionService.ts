import {
  Asset,
  Networks,
  Operation,
  TransactionBuilder,
  Keypair,
} from '@stellar/stellar-sdk';
import { HorizonService } from './HorizonService';
import { PaymentOptions, TrustlineOptions } from '../types';

/**
 * TransactionService class for handling Stellar transactions
 * Responsible for creating, signing, and submitting transactions
 */
export class TransactionService {
  private horizonService: HorizonService;

  /**
   * Create a new TransactionService instance
   * @param horizonService - The HorizonService instance to use
   */
  constructor(horizonService: HorizonService) {
    this.horizonService = horizonService;
  }

  /**
   * Create a payment transaction
   * @param sourcePublicKey - The public key of the source account
   * @param options - The payment options
   * @returns Promise<any> - The transaction envelope
   */
  public async createPaymentTransaction(
    sourcePublicKey: string,
    options: PaymentOptions
  ): Promise<any> {
    try {
      const sourceAccount = await this.horizonService.loadAccount(sourcePublicKey);
      const networkPassphrase = this.horizonService.getNetworkPassphrase();
      
      // Create a transaction builder
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: options.destination,
          asset: options.asset,
          amount: options.amount,
        }));

      // Add a memo if provided
      if (options.memo) {
        // Import Memo dynamically to avoid TypeScript errors
        const { Memo } = require('@stellar/stellar-sdk');
        transaction.addMemo(Memo.text(options.memo));
      }

      // Build the transaction
      return transaction.setTimeout(30).build();
    } catch (error) {
      throw new Error(`Error creating payment transaction: ${error}`);
    }
  }

  /**
   * Create a trustline transaction
   * @param sourcePublicKey - The public key of the source account
   * @param options - The trustline options
   * @returns Promise<any> - The transaction envelope
   */
  public async createTrustlineTransaction(
    sourcePublicKey: string,
    options: TrustlineOptions
  ): Promise<any> {
    try {
      const sourceAccount = await this.horizonService.loadAccount(sourcePublicKey);
      const networkPassphrase = this.horizonService.getNetworkPassphrase();
      
      // Create a transaction builder
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase,
      })
        .addOperation(Operation.changeTrust({
          asset: options.asset,
          limit: options.limit,
        }));

      // Build the transaction
      return transaction.setTimeout(30).build();
    } catch (error) {
      throw new Error(`Error creating trustline transaction: ${error}`);
    }
  }

  /**
   * Sign a transaction with a secret key
   * @param transaction - The transaction to sign
   * @param secretKey - The secret key to sign with
   * @returns any - The signed transaction
   */
  public signTransaction(transaction: any, secretKey: string): any {
    try {
      const keyPair = Keypair.fromSecret(secretKey);
      transaction.sign(keyPair);
      return transaction;
    } catch (error) {
      throw new Error(`Error signing transaction: ${error}`);
    }
  }

  /**
   * Submit a transaction to the network
   * @param transaction - The transaction to submit
   * @returns Promise<any> - The transaction result
   */
  public async submitTransaction(transaction: any): Promise<any> {
    try {
      return await this.horizonService.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Error submitting transaction: ${error}`);
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
    try {
      const transaction = await this.createPaymentTransaction(sourcePublicKey, options);
      const signedTransaction = this.signTransaction(transaction, secretKey);
      return await this.submitTransaction(signedTransaction);
    } catch (error) {
      throw new Error(`Error sending payment: ${error}`);
    }
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
    try {
      const transaction = await this.createTrustlineTransaction(sourcePublicKey, options);
      const signedTransaction = this.signTransaction(transaction, secretKey);
      return await this.submitTransaction(signedTransaction);
    } catch (error) {
      throw new Error(`Error adding trustline: ${error}`);
    }
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
    try {
      const sourceAccount = await this.horizonService.loadAccount(sourcePublicKey);
      const networkPassphrase = this.horizonService.getNetworkPassphrase();
      
      // Create a transaction builder
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase,
      })
        .addOperation(Operation.createAccount({
          destination: destinationPublicKey,
          startingBalance,
        }))
        .setTimeout(30)
        .build();

      // Sign and submit the transaction
      const signedTransaction = this.signTransaction(transaction, secretKey);
      return await this.submitTransaction(signedTransaction);
    } catch (error) {
      throw new Error(`Error creating account: ${error}`);
    }
  }
}
