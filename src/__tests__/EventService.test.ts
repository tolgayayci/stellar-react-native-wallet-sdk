import { EventService } from '../core/EventService';
import { HorizonService } from '../core/HorizonService';
import { EventType } from '../types';

// Using global Jest types

describe('EventService', () => {
  let eventService: EventService;
  let horizonService: HorizonService;
  
  // Test account on Stellar testnet - DO NOT USE FOR REAL FUNDS
  const testPublicKey = 'GDJUIEGLARHHM6IVNFEMV5HRX3A2XJMVMJS372BLXCCDLR3LBOEGF5DJ';
  
  beforeEach(() => {
    // Create a new HorizonService instance for testnet
    horizonService = HorizonService.testNetwork();
    // Create a new EventService instance
    eventService = new EventService(horizonService);
  });
  
  test('should initialize correctly', () => {
    expect(eventService).toBeDefined();
  });
  
  test('should add and remove event listeners', () => {
    const mockCallback = jest.fn();
    
    // Add event listener
    eventService.addEventListener(EventType.ACCOUNT_UPDATED, mockCallback);
    
    // Check if event listener was added
    expect(eventService['listeners'][EventType.ACCOUNT_UPDATED]).toBeDefined();
    expect(eventService['listeners'][EventType.ACCOUNT_UPDATED].length).toBe(1);
    
    // Remove event listener
    eventService.removeEventListener(EventType.ACCOUNT_UPDATED, mockCallback);
    
    // Check if event listener was removed
    expect(eventService['listeners'][EventType.ACCOUNT_UPDATED].length).toBe(0);
  });
  
  test('should emit events correctly', () => {
    const mockCallback = jest.fn();
    const mockPayload = { data: 'test data' };
    
    // Add event listener
    eventService.addEventListener(EventType.ACCOUNT_UPDATED, mockCallback);
    
    // Emit event
    eventService['emit'](EventType.ACCOUNT_UPDATED, mockPayload);
    
    // Check if callback was called with correct payload
    expect(mockCallback).toHaveBeenCalledWith({
      type: EventType.ACCOUNT_UPDATED,
      payload: mockPayload,
      timestamp: expect.any(Number),
    });
  });
  
  // Integration tests with actual testnet
  describe('Integration tests', () => {
    // These tests interact with the actual Stellar testnet
    // They might be slow and could fail if the testnet is down
    
    test('should subscribe to account updates', async () => {
      const mockCallback = jest.fn();
      
      // Add event listener
      eventService.addEventListener(EventType.ACCOUNT_UPDATED, mockCallback);
      
      // Subscribe to account updates
      const subscriptionId = eventService.subscribeToAccount(testPublicKey);
      
      // Check if subscription was created
      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
      
      // Wait for a short time to allow for potential updates
      // In a real scenario, you'd need to trigger an account update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Unsubscribe
      eventService.unsubscribe(subscriptionId);
      
      // Note: We can't reliably test if the callback was called
      // as it depends on actual account updates on the testnet
    }, 15000);
    
    test('should subscribe to payments', async () => {
      const mockCallback = jest.fn();
      
      // Add event listener
      eventService.addEventListener(EventType.PAYMENT_RECEIVED, mockCallback);
      
      // Subscribe to payments
      const subscriptionId = eventService.subscribeToPayments(testPublicKey);
      
      // Check if subscription was created
      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
      
      // Wait for a short time to allow for potential payments
      // In a real scenario, you'd need to trigger a payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Unsubscribe
      eventService.unsubscribe(subscriptionId);
      
      // Note: We can't reliably test if the callback was called
      // as it depends on actual payments on the testnet
    }, 15000);
    
    test('should handle multiple subscriptions', () => {
      // Subscribe to account updates
      const accountSubscriptionId = eventService.subscribeToAccount(testPublicKey);
      
      // Subscribe to payments
      const paymentSubscriptionId = eventService.subscribeToPayments(testPublicKey);
      
      // Check if both subscriptions were created
      expect(accountSubscriptionId).toBeDefined();
      expect(paymentSubscriptionId).toBeDefined();
      expect(accountSubscriptionId).not.toBe(paymentSubscriptionId);
      
      // Unsubscribe from both
      eventService.unsubscribe(accountSubscriptionId);
      eventService.unsubscribe(paymentSubscriptionId);
    });
  });
});
