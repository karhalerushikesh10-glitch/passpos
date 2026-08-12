#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec, Address, String, Bytes};

#[contract]
pub struct PassPosContract;

#[contractimpl]
impl PassPosContract {
    /// Initialize merchant account metadata with WebAuthn Passkey Secp256r1 public key
    pub fn register_merchant(env: Env, merchant: Address, passkey_pubkey: Bytes) {
        merchant.require_auth();
        env.storage().instance().set(&symbol_short!("merchant"), &merchant);
        env.storage().instance().set(&symbol_short!("passkey"), &passkey_pubkey);
    }

    /// Process merchant payment signed via WebAuthn Passkey assertion
    pub fn process_payment(env: Env, from: Address, to: Address, amount: i128, tx_ref: String) -> bool {
        from.require_auth();
        // Record payment event on Soroban ledger
        env.events().publish((symbol_short!("payment"), from, to), (amount, tx_ref));
        true
    }
}
