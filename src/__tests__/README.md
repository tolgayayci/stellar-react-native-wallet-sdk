# Testing the Stellar React Native Wallet SDK

This directory contains tests for the Stellar React Native Wallet SDK. The tests are designed to verify the functionality of the SDK against the Stellar testnet.

## Setup

We use Jest as our testing framework. The tests are written in TypeScript and compiled to JavaScript before running.

## Running the Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- HorizonService
```

To run tests in watch mode (tests will re-run when files change):

```bash
npm test -- --watch
```

## Test Files

### HorizonService.test.ts

Tests the `HorizonService` class, which interacts with the Stellar Horizon API. It includes:

- Unit tests for initialization and configuration
- Integration tests that interact with the Stellar testnet:
  - Loading account data
  - Getting account balances
  - Getting transaction history
  - Getting payment history

### EventService.test.ts

Tests the `EventService` class, which manages subscriptions to Stellar network events. It includes:

- Unit tests for event listener management
- Integration tests that interact with the Stellar testnet:
  - Subscribing to account updates
  - Subscribing to payments
  - Managing multiple subscriptions

## Testnet Account

The tests use a predefined testnet account. This account is only for testing purposes and should not be used for real funds.

## Running the Testnet Demo

In addition to the tests, we've provided a testnet demo script that demonstrates how to use the SDK with the Stellar testnet. To run the demo:

1. Compile the TypeScript code:

```bash
npm run build
```

2. Run the demo script:

```bash
node lib/examples/testnet-demo.js
```

The demo performs the following operations:

1. Creates a new account
2. Funds the account using Friendbot (testnet only)
3. Checks account balances
4. Sets up event listeners for account updates and payments
5. Makes a payment to another account

## Writing New Tests

When writing new tests, follow these guidelines:

1. Place unit tests in the same file as integration tests, but separate them into different describe blocks
2. Use the `beforeEach` hook to set up fresh instances of services for each test
3. For integration tests that interact with the testnet, use longer timeouts (e.g., `10000ms`)
4. Mock external dependencies when appropriate
5. Use descriptive test names that clearly indicate what is being tested

## Troubleshooting

If the integration tests fail, it could be due to:

- The Stellar testnet being down or unreachable
- Rate limiting from the testnet services
- The test account not having sufficient funds

In these cases, try:

- Running the tests again after a short delay
- Using a different test account
- Funding the test account using Friendbot: `https://friendbot.stellar.org?addr=<PUBLIC_KEY>`
