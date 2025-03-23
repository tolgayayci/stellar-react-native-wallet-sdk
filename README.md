# React Native Wallet SDK for Stellar  

![Work in Progress](https://img.shields.io/badge/status-work%20in%20progress-orange.svg)  
*Note: This SDK is actively under development. Features may frequently change, and documentation will evolve rapidly.*

## Overview

The React Native Wallet SDK simplifies the creation of secure, cross-platform Stellar blockchain wallets for mobile applications (iOS and Android). Specifically built for React Native, it bridges a critical gap left by existing web and mobile SDKs, offering direct native mobile integrations alongside comprehensive Stellar support.

## Purpose and Use Case

While existing Stellar SDKs (e.g., TypeScript, Flutter, Swift) address specific platforms or use cases, none provide seamless React Native integration combined with robust mobile security features. This SDK fills that gap, enabling developers to quickly deliver secure, native-quality wallet applications using a single JavaScript/TypeScript codebase.

## Key Features and Technical Architecture

### Core Modules
- **Secure Key Management**: Native hardware-backed storage (Keychain on iOS, Keystore on Android).
- **Transaction Management**: Easy Stellar transaction building, signing, and submission.
- **Horizon API Integration**: Simple methods to query accounts, transactions, and balances.

### SEP Integration Layer
- **Supported SEPs**: SEP-01, SEP-06, SEP-07, SEP-09, SEP-10, SEP-12, SEP-24, SEP-30, SEP-38.

### Security & Authentication
- Device-native biometric authentication (Face ID, fingerprint).
- Encrypted handling of sensitive data and secure key storage.

### Pre-built UI Components
- Ready-to-use components for interactive SEP flows, QR scanning, asset management, and transaction confirmations.

## SDK Comparison

| Feature/Capability             | React Native SDK | Swift SDK | Flutter SDK | TypeScript SDK |
|--------------------------------|------------------|-----------|-------------|----------------|
| Cross-platform (iOS & Android) | ✅ Yes           | ❌ iOS Only| ✅ Yes      | ⚠️ Web Only    |
| Native Secure Key Storage      | ✅ Yes           | ✅ Yes    | ⚠️ Partial  | ❌ No          |
| Biometric Authentication       | ✅ Yes           | ✅ Yes    | ⚠️ Partial  | ❌ No          |
| Stellar SEP Integration        | ✅ Complete      | ⚠️ Partial| ⚠️ Partial  | ✅ Complete    |
| Native Mobile UI Components    | ✅ Yes           | ❌ No     | ⚠️ Partial  | ❌ No          |
| Ease of Use (JS ecosystem)     | ✅ High          | ❌ Low    | ⚠️ Medium   | ✅ High        |
| Mobile-Specific Optimizations  | ✅ Extensive     | ✅ Good   | ⚠️ Moderate | ❌ Minimal     |
| Community & Popularity         | ✅ High          | ⚠️ Medium | ⚠️ Medium   | ✅ High        |

### Summary of Comparison
- **React Native Wallet SDK** uniquely offers complete mobile-native integration with extensive SEP support and robust security features, leveraging a popular and accessible developer ecosystem.
- **Swift SDK** is platform-specific (iOS only), limiting cross-platform flexibility.
- **Flutter SDK** offers cross-platform capabilities but has limited native security and UI integration.
- **TypeScript SDK** primarily targets web applications, lacking essential mobile-native features such as biometric authentication and secure hardware storage.

## Development Roadmap

### Milestone 1: Core Functionality
- Core SDK setup, key management, and basic transaction handling.

### Milestone 2: SEP Integrations & Enhanced Security
- Complete SEP implementations and biometric security integration.

### Milestone 3: UI Toolkit, Documentation & Examples
- Pre-built UI components, detailed documentation, and example apps.

## Intended Audience

This SDK is tailored for React Native developers seeking to efficiently integrate Stellar blockchain features into mobile wallets, emphasizing both security and usability.

## Contribution & Community

We welcome contributions, bug reports, and feature suggestions. Please open an issue or submit a pull request.

## License

This project will be open-sourced under the MIT License.
