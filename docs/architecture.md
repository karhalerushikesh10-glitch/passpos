# PassPOS Architecture & Specifications

PassPOS is a Point of Sale (POS) payment system built on the Stellar Network leveraging WebAuthn Passkeys and Soroban Smart Contracts.

## Directory Structure
- `src/`: Next.js 14 App Router frontend and API routes.
- `contracts/soroban_passpos/`: Rust Soroban smart contract source code for passkey payment validation.
- `docs/`: System documentation and architecture diagrams.
- `prisma/`: SQLite schema & migration seeds.

## Authentication & Blockchain Flow
1. **Merchant Onboarding**: Biometric Passkey created via WebAuthn API (`@simplewebauthn`).
2. **Stellar Keypair**: Automatic Testnet Keypair creation and funding via SDF Friendbot.
3. **Checkout & Authorization**: Cart total signed using Touch ID / Face ID hardware secure enclave.
4. **On-Chain Settlement**: Soroban smart contract verification and event publication.
