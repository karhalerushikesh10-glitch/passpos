import { Networks } from '@stellar/stellar-sdk';

export const STELLAR_CONFIG = {
  NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
  PASSPHRASE: Networks.TESTNET,
  HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  CONTRACT_ID: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6',
  FRIENDBOT_URL: 'https://friendbot.stellar.org',
};

export function getTransactionExplorerUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function getContractExplorerUrl(contractId: string = STELLAR_CONFIG.CONTRACT_ID): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}
