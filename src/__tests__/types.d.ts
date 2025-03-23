// Add Jest global types
import '@types/jest';

// Declare global Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}
