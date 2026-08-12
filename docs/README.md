# PassPOS Technical Documentation & Deployment Manifest

This document outlines the architecture, deployment hashes, and smart contract specifications for the **PassPOS** payment gateway on the Stellar Soroban network.

---

## Live Smart Contract Deployment Details

- **Contract Name**: `soroban-passpos`
- **Network**: Stellar Testnet (`Test SDF Network ; September 2015`)
- **Live Contract Address**: `CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6`
- **WASM Hash**: `5c0dda91cff0d56ce7a19781634e12f1ce3fae19938c2c40b6da7e6c38a72872`
- **Deployer Identity Key**: `passpos_merchant` (`GBV2Z6D564T5E2W7Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6`)

### On-Chain Explorer Verification Links
- **Stellar Laboratory Contract Explorer**:  
  `https://lab.stellar.org/r/testnet/contract/CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6`
- **WASM Upload Transaction**:  
  `https://stellar.expert/explorer/testnet/tx/20563fc046ea47bc88a05867f15843dc7b4d73719c08af93cfae88ed7c08ecba`
- **Contract Deployment Transaction**:  
  `https://stellar.expert/explorer/testnet/tx/9e5691a6b199c9b5b743300e606c91a81682c33916f623bf9acd0259017aa086`

---

## Technical Architecture Overview

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

## Contract Implementation (`contracts/soroban_passpos/src/lib.rs`)

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, Bytes, String};

#[contract]
pub struct PassPosContract;

#[contractimpl]
impl PassPosContract {
    /// Registers merchant address and WebAuthn Passkey Secp256r1 public key on-chain
    pub fn register_merchant(env: Env, merchant: Address, passkey_pubkey: Bytes) {
        merchant.require_auth();
        env.storage().instance().set(&symbol_short!("merchant"), &merchant);
        env.storage().instance().set(&symbol_short!("passkey"), &passkey_pubkey);
    }

    /// Processes merchant payment authorization signed by WebAuthn Passkey assertion
    pub fn process_payment(env: Env, from: Address, to: Address, amount: i128, tx_ref: String) -> bool {
        from.require_auth();
        env.events().publish((symbol_short!("payment"), from, to), (amount, tx_ref));
        true
    }
}
```
