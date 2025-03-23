// Import polyfills
import 'react-native-get-random-values';

// Import core modules
import { StellarWallet } from './core/StellarWallet';

// Export core modules
export { StellarWallet } from './core/StellarWallet';
export { KeyManager } from './core/KeyManager';
export { HorizonService } from './core/HorizonService';
export { TransactionService } from './core/TransactionService';
export { EventService } from './core/EventService';

// Export types
export * from './types';

// Default export
export default { StellarWallet };
