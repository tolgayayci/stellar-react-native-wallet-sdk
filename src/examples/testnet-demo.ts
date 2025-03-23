import { StellarWallet, EventType } from '../index';
import { Asset } from '@stellar/stellar-sdk';

/**
 * This script demonstrates how to use the Stellar Wallet SDK with the testnet.
 * It performs the following operations:
 * 1. Creates a new account
 * 2. Funds the account using Friendbot (testnet only)
 * 3. Checks account balances
 * 4. Sets up event listeners for account updates and payments
 * 5. Makes a payment to another account
 */
async function runTestnetDemo() {
  try {
    console.log('Starting Stellar Testnet Demo');
    
    // Create a wallet instance for the testnet
    const wallet = StellarWallet.testNetwork();
    console.log('Wallet initialized for testnet');
    
    // Generate a new account
    const account = await wallet.generateAccount('Test Account');
    console.log(`Generated new account: ${account.id}`);
    
    // Fund the account using Friendbot (testnet only)
    console.log('Funding account with Friendbot...');
    await fundAccountWithFriendbot(account.id);
    console.log('Account funded successfully');
    
    // Check account balances
    const balances = await wallet.getHorizonService().getBalances(account.id);
    console.log('Account balances:');
    balances.forEach(balance => {
      if (balance.asset_type === 'native') {
        console.log(`  XLM: ${balance.balance}`);
      } else {
        console.log(`  ${balance.asset_code}: ${balance.balance}`);
      }
    });
    
    // Set up event listeners
    const eventService = wallet.getEventService();
    
    // Listen for account updates
    eventService.addEventListener(EventType.ACCOUNT_UPDATED, (event) => {
      console.log('Account updated:', event.payload);
    });
    
    // Listen for payments
    eventService.addEventListener(EventType.PAYMENT_RECEIVED, (event) => {
      console.log('Payment received:', event.payload);
    });
    
    // Subscribe to account updates and payments
    const accountSubscriptionId = eventService.subscribeToAccount(account.id);
    const paymentSubscriptionId = eventService.subscribeToPayments(account.id);
    console.log('Subscribed to account updates and payments');
    
    // Create a second account for testing payments
    const destinationAccount = await wallet.generateAccount('Destination Account');
    console.log(`Generated destination account: ${destinationAccount.id}`);
    
    // Fund the destination account
    console.log('Funding destination account with Friendbot...');
    await fundAccountWithFriendbot(destinationAccount.id);
    console.log('Destination account funded successfully');
    
    // Make a payment from the first account to the second account
    console.log('Making a payment...');
    const paymentResult = await wallet.getTransactionService().sendPayment(
      account.id,
      account.keyPair.secretKey as string,
      {
        destination: destinationAccount.id,
        amount: '10',
        asset: Asset.native(),
      }
    );
    console.log('Payment successful:', paymentResult);
    
    // Wait for a moment to allow event listeners to receive updates
    console.log('Waiting for events...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Unsubscribe from events
    eventService.unsubscribe(accountSubscriptionId);
    eventService.unsubscribe(paymentSubscriptionId);
    console.log('Unsubscribed from events');
    
    console.log('Demo completed successfully');
  } catch (error) {
    console.error('Error running testnet demo:', error);
  }
}

/**
 * Fund an account on the testnet using Friendbot
 * @param publicKey The public key of the account to fund
 */
async function fundAccountWithFriendbot(publicKey: string): Promise<void> {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fund account: ${response.statusText}`);
  }
  return;
}

// Run the demo
runTestnetDemo().then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Script execution failed:', error);
});
