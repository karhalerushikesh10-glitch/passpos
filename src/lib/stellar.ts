import {
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
  Asset,
} from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getContractExplorerUrl, getTransactionExplorerUrl } from '@/config/stellar';

export { getContractExplorerUrl, getTransactionExplorerUrl };

const server = new Horizon.Server(STELLAR_CONFIG.HORIZON_URL);

export interface StellarAccountInfo {
  publicKey: string;
  balances: {
    assetType: string;
    balance: string;
    assetCode?: string;
    assetIssuer?: string;
  }[];
}

/**
 * Creates a new random Stellar Keypair for merchant / customer passkey wallet
 */
export function createStellarKeypair() {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

/**
 * Funds a Testnet account using SDF Friendbot
 */
export async function fundWithFriendbot(publicKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${STELLAR_CONFIG.FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
    if (response.ok) {
      return { success: true, message: 'Account successfully funded with 10,000 Testnet XLM!' };
    }
    const data = await response.json();
    return { success: false, message: data.detail || 'Friendbot funding request failed.' };
  } catch (error: any) {
    console.error('Friendbot funding error:', error);
    return { success: false, message: error.message || 'Network error during Friendbot funding' };
  }
}

/**
 * Fetches XLM and token balances for a Stellar public key
 */
export async function getAccountBalances(publicKey: string): Promise<StellarAccountInfo> {
  try {
    const account = await server.loadAccount(publicKey);
    const balances = account.balances.map((b: any) => ({
      assetType: b.asset_type,
      balance: b.balance,
      assetCode: b.asset_code,
      assetIssuer: b.asset_issuer,
    }));

    return {
      publicKey,
      balances,
    };
  } catch (error) {
    // If account doesn't exist yet, return 0 XLM balance
    return {
      publicKey,
      balances: [{ assetType: 'native', balance: '0.0000000' }],
    };
  }
}

/**
 * Submits a native XLM payment transaction on Stellar Testnet
 */
export async function submitXlmPayment({
  senderSecret,
  destinationPublicKey,
  amountXlm,
  memo = 'PassPOS Payment',
}: {
  senderSecret: string;
  destinationPublicKey: string;
  amountXlm: string;
  memo?: string;
}): Promise<{ success: boolean; txHash?: string; ledger?: number; error?: string }> {
  try {
    const sourceKeypair = Keypair.fromSecret(senderSecret);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: STELLAR_CONFIG.PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: Asset.native(),
          amount: amountXlm,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    return {
      success: true,
      txHash: result.hash,
      ledger: result.ledger,
    };
  } catch (error: any) {
    console.error('Stellar payment submission failed:', error);
    return {
      success: false,
      error: error.response?.data?.extras?.result_codes?.transaction || error.message || 'Transaction submission failed',
    };
  }
}

/**
 * Helper to generate mock transaction hash for passkey WebAuthn simulated payment demo
 */
export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Formats Stellar address for display (e.g. GABC...WXYZ)
 */
export function truncateStellarAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}
