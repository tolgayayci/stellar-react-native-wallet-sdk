import { HorizonService } from '../core/HorizonService';
import { NetworkType } from '../types';

// Import Jest types
import '@types/jest';

describe('HorizonService', () => {
  let horizonService: HorizonService;
  
  // Test account on Stellar testnet - DO NOT USE FOR REAL FUNDS
  const testPublicKey = 'GDJUIEGLARHHM6IVNFEMV5HRX3A2XJMVMJS372BLXCCDLR3LBOEGF5DJ';
  
  beforeEach(() => {
    // Create a new HorizonService instance for testnet
    horizonService = HorizonService.testNetwork();
  });
  
  test('should initialize correctly with testnet configuration', () => {
    expect(horizonService).toBeDefined();
    const config = horizonService.getNetworkConfig();
    expect(config.networkType).toBe(NetworkType.TESTNET);
    expect(config.horizonUrl).toBe('https://horizon-testnet.stellar.org');
  });
  
  test('should get server instance', () => {
    const server = horizonService.getServer();
    expect(server).toBeDefined();
  });
  
  test('should get network passphrase', () => {
    const passphrase = horizonService.getNetworkPassphrase();
    expect(passphrase).toBeDefined();
    expect(passphrase).toBe('Test SDF Network ; September 2015');
  });
  
  // Integration tests with actual testnet
  describe('Integration tests', () => {
    // These tests interact with the actual Stellar testnet
    // They might be slow and could fail if the testnet is down
    
    test('should load account from testnet', async () => {
      try {
        const account = await horizonService.loadAccount(testPublicKey);
        expect(account).toBeDefined();
        expect(account.id).toBe(testPublicKey);
        // Account should have balances
        expect(account.balances).toBeDefined();
      } catch (error) {
        console.error('Error loading account from testnet:', error);
        throw error;
      }
    }, 10000); // Increase timeout for network requests
    
    test('should get account balances from testnet', async () => {
      try {
        const balances = await horizonService.getBalances(testPublicKey);
        expect(balances).toBeDefined();
        expect(Array.isArray(balances)).toBe(true);
        // At least one balance (native XLM) should be present
        expect(balances.length).toBeGreaterThan(0);
        // Check if native balance exists
        const nativeBalance = balances.find(b => b.asset_type === 'native');
        expect(nativeBalance).toBeDefined();
      } catch (error) {
        console.error('Error getting balances from testnet:', error);
        throw error;
      }
    }, 10000);
    
    test('should get transaction history from testnet', async () => {
      try {
        const transactions = await horizonService.getTransactionHistory(testPublicKey, 5);
        expect(transactions).toBeDefined();
        expect(Array.isArray(transactions)).toBe(true);
        // Transactions might be empty if the account is new
        // So we don't assert on the length
      } catch (error) {
        console.error('Error getting transaction history from testnet:', error);
        throw error;
      }
    }, 10000);
    
    test('should get payment history from testnet', async () => {
      try {
        const payments = await horizonService.getPaymentHistory(testPublicKey, 5);
        expect(payments).toBeDefined();
        expect(Array.isArray(payments)).toBe(true);
        // Payments might be empty if the account is new
        // So we don't assert on the length
      } catch (error) {
        console.error('Error getting payment history from testnet:', error);
        throw error;
      }
    }, 10000);
  });
});
