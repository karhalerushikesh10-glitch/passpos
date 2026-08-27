import {
  Keypair,
  TransactionBuilder,
  Networks,
  Contract,
  Address,
  nativeToScVal,
  rpc
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6';
const PASSPHRASE = Networks.TESTNET;

const rpcServer = new rpc.Server(SOROBAN_URL, { allowHttp: true });

async function runTrafficGenerator() {
  console.log('--- STARTING ON-CHAIN TRAFFIC GENERATOR ---');
  const customerKeypair = Keypair.random();
  const merchantKeypair = Keypair.random();
  const customerAddress = customerKeypair.publicKey();
  const merchantAddress = merchantKeypair.publicKey();

  console.log(`Generated Customer Key: ${customerAddress}`);
  console.log('Funding customer account via Friendbot...');

  try {
    const friendbotRes = await fetch(`https://friendbot.stellar.org?addr=${customerAddress}`);
    if (!friendbotRes.ok) {
      throw new Error(`Friendbot funding failed: ${await friendbotRes.text()}`);
    }
    console.log('✅ Customer Funded.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const txHashes = [];
  const TOTAL_TX = 25;

  console.log(`\nInitializing loop for ${TOTAL_TX} transactions...`);

  const contract = new Contract(CONTRACT_ID);

  for (let i = 1; i <= TOTAL_TX; i++) {
    console.log(`\n[Iteration ${i}/${TOTAL_TX}] Fetching sequence & simulating...`);
    
    try {
      // Reload account state to get fresh sequence
      const account = await rpcServer.getAccount(customerAddress);
      
      const operation = contract.call(
        'process_payment',
        nativeToScVal(new Address(customerAddress).toString(), { type: 'address' }),
        nativeToScVal(new Address(merchantAddress).toString(), { type: 'address' }),
        nativeToScVal(BigInt(10000000 + i), { type: 'i128' }), // varies amount slightly
        nativeToScVal(`TRAFFIC-${Date.now()}-${i}`, { type: 'string' })
      );

      let transaction = new TransactionBuilder(account, {
        fee: '1000',
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      transaction = await rpcServer.prepareTransaction(transaction);
      transaction.sign(customerKeypair);

      const sendRes = await rpcServer.sendTransaction(transaction);
      if (sendRes.errorResult) {
        throw new Error('Failed to submit transaction to Soroban');
      }
      const txHash = sendRes.hash;
      console.log(`   ⏳ Submitted Transaction: ${txHash}. Polling...`);

      let txStatus = await rpcServer.getTransaction(txHash);
      let attempts = 0;
      while (txStatus.status === rpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        txStatus = await rpcServer.getTransaction(txHash);
        attempts++;
      }

      if (txStatus.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        console.log(`   ✅ SUCCESS!`);
        txHashes.push(txHash);
      } else {
        console.error(`   ❌ Failed with status: ${txStatus.status}`);
      }

    } catch (err) {
      console.error(`   ❌ Error on iteration ${i}:`, err.message);
    }

    // Delay 4 seconds to prevent rate limiting
    console.log(`   Waiting 4 seconds before next iteration...`);
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  console.log('\n=============================================');
  console.log('✅ TRAFFIC GENERATION COMPLETE');
  console.log('=============================================');
  console.log(`Successfully generated ${txHashes.length} transactions.\n`);

  console.log('### 📊 On-Chain Load Test Results (Transaction Hashes)');
  console.log(`All transactions executed on Soroban Smart Contract: \`${CONTRACT_ID}\`\n`);
  txHashes.forEach((hash, idx) => {
    console.log(`${idx + 1}. [\`${hash}\`](https://stellar.expert/explorer/testnet/tx/${hash})`);
  });
  console.log('\n=============================================');
}

runTrafficGenerator();
