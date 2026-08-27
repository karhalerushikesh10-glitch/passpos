import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  Address,
  Contract,
  nativeToScVal,
  xdr,
} from '@stellar/stellar-sdk';
import { signTransaction, getNetwork } from '@stellar/freighter-api';
import { STELLAR_CONFIG } from '@/config/stellar';

const server = new SorobanRpc.Server(STELLAR_CONFIG.SOROBAN_RPC_URL);

/**
 * Invokes Soroban `process_payment` contract method via Freighter Wallet
 */
export async function executeSorobanPayment(
  customerPublicKey: string,
  merchantPublicKey: string,
  amountXlm: number,
  txRef: string
) {
  try {
    const account = await server.getAccount(customerPublicKey);

    // Build the Contract Call Operation
    const contract = new Contract(STELLAR_CONFIG.CONTRACT_ID);
    
    // Amount in stroops (1 XLM = 10,000,000 stroops)
    const amountStroops = BigInt(Math.floor(amountXlm * 10000000));
    
    const operation = contract.call(
      'process_payment',
      nativeToScVal(new Address(customerPublicKey).toString(), { type: 'address' }),
      nativeToScVal(new Address(merchantPublicKey).toString(), { type: 'address' }),
      nativeToScVal(amountStroops, { type: 'i128' }),
      nativeToScVal(txRef, { type: 'string' })
    );

    // Assemble base transaction
    let transaction = new TransactionBuilder(account, {
      fee: '100', // Basic fee, will be updated after simulation
      networkPassphrase: STELLAR_CONFIG.PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // 1 & 2. Simulate and Prepare Transaction with footprints
    const preparedTransaction = await server.prepareTransaction(transaction);

    // 3. Sign with Freighter
    const network = await getNetwork();
    const signedXdr = await signTransaction(preparedTransaction.toXDR(), { network: network || 'TESTNET' });
    
    // 4. Send Transaction
    const sendResponse = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, STELLAR_CONFIG.PASSPHRASE) as any);
    if (sendResponse.errorResult) {
      throw new Error('Failed to submit transaction to Soroban network.');
    }

    // 5. Poll for Transaction Status
    let txStatus = await server.getTransaction(sendResponse.hash);
    let attempts = 0;
    while (txStatus.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      txStatus = await server.getTransaction(sendResponse.hash);
      attempts++;
    }

    if (txStatus.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return { success: true, txHash: sendResponse.hash };
    } else {
      throw new Error(`Transaction failed with status: ${txStatus.status}`);
    }
  } catch (error: any) {
    console.error('Soroban payment error:', error);
    return { success: false, error: error.message || 'Soroban transaction failed.' };
  }
}
