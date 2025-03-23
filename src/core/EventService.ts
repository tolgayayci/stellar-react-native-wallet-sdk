import { EventType, EventData, EventCallback } from '../types';
import { HorizonService } from './HorizonService';

/**
 * EventService class for handling Stellar events
 * Responsible for subscribing to account and payment events
 */
export class EventService {
  private horizonService: HorizonService;
  private listeners: Map<string, Set<EventCallback>>;
  private closeCallbacks: Map<string, () => void>;

  /**
   * Create a new EventService instance
   * @param horizonService - The HorizonService instance to use
   */
  constructor(horizonService: HorizonService) {
    this.horizonService = horizonService;
    this.listeners = new Map<string, Set<EventCallback>>();
    this.closeCallbacks = new Map<string, () => void>();
  }

  /**
   * Add an event listener
   * @param eventType - The type of event to listen for
   * @param callback - The callback to call when the event occurs
   */
  public addEventListener(eventType: EventType, callback: EventCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set<EventCallback>());
    }
    this.listeners.get(eventType)?.add(callback);
  }

  /**
   * Remove an event listener
   * @param eventType - The type of event to stop listening for
   * @param callback - The callback to remove
   */
  public removeEventListener(eventType: EventType, callback: EventCallback): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)?.delete(callback);
    }
  }

  /**
   * Emit an event to all listeners
   * @param eventData - The event data to emit
   */
  private emitEvent(eventData: EventData): void {
    const listeners = this.listeners.get(eventData.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`Error in event listener for ${eventData.type}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to account events for a specific account
   * @param publicKey - The public key of the account to monitor
   * @returns string - A subscription ID that can be used to unsubscribe
   */
  public subscribeToAccount(publicKey: string): string {
    const subscriptionId = `account-${publicKey}`;
    
    // Close existing subscription if there is one
    this.unsubscribe(subscriptionId);
    
    // Create a new subscription
    const server = this.horizonService.getServer();
    const closeCallback = server
      .accounts()
      .accountId(publicKey)
      .cursor('now')
      .stream({
        onmessage: (accountData: any) => {
          this.emitEvent({
            type: EventType.ACCOUNT_UPDATED,
            payload: accountData,
          });
        },
        onerror: (error: any) => {
          console.error('Error in account subscription:', error);
        },
      });
    
    this.closeCallbacks.set(subscriptionId, closeCallback);
    return subscriptionId;
  }

  /**
   * Subscribe to payment events for a specific account
   * @param publicKey - The public key of the account to monitor
   * @returns string - A subscription ID that can be used to unsubscribe
   */
  public subscribeToPayments(publicKey: string): string {
    const subscriptionId = `payments-${publicKey}`;
    
    // Close existing subscription if there is one
    this.unsubscribe(subscriptionId);
    
    // Create a new subscription
    const server = this.horizonService.getServer();
    const closeCallback = server
      .payments()
      .forAccount(publicKey)
      .cursor('now')
      .stream({
        onmessage: (paymentData: any) => {
          // Determine if this is an incoming or outgoing payment
          const eventType = paymentData.to === publicKey
            ? EventType.PAYMENT_RECEIVED
            : EventType.PAYMENT_SENT;
          
          this.emitEvent({
            type: eventType,
            payload: paymentData,
          });
        },
        onerror: (error: any) => {
          console.error('Error in payment subscription:', error);
        },
      });
    
    this.closeCallbacks.set(subscriptionId, closeCallback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   * @param subscriptionId - The subscription ID to unsubscribe
   * @returns boolean - Whether the unsubscription was successful
   */
  public unsubscribe(subscriptionId: string): boolean {
    const closeCallback = this.closeCallbacks.get(subscriptionId);
    if (closeCallback) {
      closeCallback();
      this.closeCallbacks.delete(subscriptionId);
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe from all events
   */
  public unsubscribeAll(): void {
    this.closeCallbacks.forEach(closeCallback => {
      closeCallback();
    });
    this.closeCallbacks.clear();
  }
}
