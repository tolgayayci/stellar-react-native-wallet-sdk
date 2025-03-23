import { Asset } from '@stellar/stellar-sdk';

// Network types
export enum NetworkType {
  PUBLIC = 'PUBLIC',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

export interface NetworkConfig {
  networkType: NetworkType;
  networkPassphrase: string;
  horizonUrl: string;
}

// Key Management types
export interface KeyPairData {
  publicKey: string;
  secretKey?: string;
}

export interface AccountData {
  id: string;
  name?: string;
  keyPair: KeyPairData;
  balances?: BalanceData[];
}

export interface BalanceData {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

// Transaction types
export interface PaymentOptions {
  destination: string;
  amount: string;
  asset: Asset;
  memo?: string;
}

export interface TrustlineOptions {
  asset: Asset;
  limit?: string;
}

// Event types
export enum EventType {
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_SENT = 'PAYMENT_SENT',
  TRANSACTION_SUBMITTED = 'TRANSACTION_SUBMITTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export interface EventData {
  type: EventType;
  payload: any;
}

export type EventCallback = (data: EventData) => void;

// Type definitions for Stellar SDK types that aren't properly exported
export interface ServerApiTypes {
  AccountRecord: any;
  CollectionPage: {
    new<T>(data: any): T;
  };
  TransactionRecord: any;
  PaymentOperationRecord: any;
}

export interface ServerType {
  loadAccount(publicKey: string): Promise<any>;
  accounts(): any;
  payments(): any;
  transactions(): any;
  submitTransaction(transactionEnvelope: any): Promise<any>;
}
