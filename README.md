# PassPOS — Passkey-Based Merchant Payments on Stellar Network

PassPOS is a production-ready Point of Sale (POS) MVP application enabling merchants to accept instant crypto payments on the Stellar network using WebAuthn Passkeys for seamless, passwordless login and transaction authorization.

---

## Live Soroban Smart Contract Deployment

- **Network**: Stellar Testnet
- **Contract Language**: Rust (Soroban SDK v21.7)
- **Source Code**: `contracts/soroban_passpos/src/lib.rs`
- **Live Contract Address**: `CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6`
- **WASM Hash**: `5c0dda91cff0d56ce7a19781634e12f1ce3fae19938c2c40b6da7e6c38a72872`
- **Stellar Laboratory Explorer**: `https://lab.stellar.org/r/testnet/contract/CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6`
- **WASM Upload Transaction**: `https://stellar.expert/explorer/testnet/tx/20563fc046ea47bc88a05867f15843dc7b4d73719c08af93cfae88ed7c08ecba`
- **Contract Deployment Transaction**: `https://stellar.expert/explorer/testnet/tx/9e5691a6b199c9b5b743300e606c91a81682c33916f623bf9acd0259017aa086`

---

## Technical Stack & Architecture

- **Frontend Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS v3, Lucide React, HTML5 Video Hero, Glassmorphism
- **Authentication**: WebAuthn Passkeys API (`@simplewebauthn/browser`, `@simplewebauthn/server`)
- **Blockchain**: Stellar SDK (`@stellar/stellar-sdk`), Soroban CLI, SDF Friendbot
- **Database**: Prisma ORM with SQLite (`dev.db`) & PostgreSQL schema
- **Monitoring & Telemetry**: Sentry (`@sentry/nextjs`), PostHog analytics

---

## Technical Architecture Diagram

```
+-------------------------------------------------------------------------+
|                                PassPOS UI                               |
|   +-------------------+    +--------------------+    +--------------+   |
|   | Cinematic Hero    |    | Touch POS Terminal |    | Merchant Dash|   |
|   | Landing Page      |    | & Cart Drawer      |    | Analytics    |   |
|   +---------+---------+    +---------+----------+    +------+-------+   |
+-------------|------------------------|----------------------|-----------+
              |                        |                      |
              v                        v                      v
+-------------------------------------------------------------------------+
|                         WebAuthn Passkeys Manager                       |
|   - Hardware Secure Enclave (TouchID / FaceID)                          |
|   - ES256 Signature Generation & Challenge Verification                 |
+--------------------------------------+----------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------+
|                     Stellar & Soroban Payment Gateway                   |
|   - Live Contract: CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6 |
|   - Horizon RPC: https://horizon-testnet.stellar.org                    |
|   - SDF Friendbot Auto-Funder                                           |
|   - Transaction Finality & Receipt Generation                           |
+-------------------------------------------------------------------------+
```

---

## Local Development & Spin-Up Instructions

```bash
# 1. Navigate to the project directory
cd "rushi 1"

# 2. Set Node PATH (if using Anaconda or custom Node path)
export PATH=/opt/anaconda3/bin:$PATH

# 3. Install dependencies
npm install

# 4. Sync Prisma schema & seed SQLite database
npx prisma db push
node prisma/seed.js

# 5. Start Next.js development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.
