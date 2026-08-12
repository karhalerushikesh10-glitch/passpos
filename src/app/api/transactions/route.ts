import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateMockTxHash } from '@/lib/stellar';

export async function GET(req: Request) {
  try {
    const transactions = await prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      txHash,
      amountUsd,
      amountXlm,
      paymentType,
      items,
      customerRef,
      merchantId,
      taxAmount = 0,
      discountAmount = 0,
    } = body;

    const finalTxHash = txHash || generateMockTxHash();

    let merchant = await prisma.merchant.findFirst();
    if (!merchant && merchantId) {
      merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    }

    const mId = merchant ? merchant.id : 'demo-merchant';

    // 1. Create Receipt Record
    const receiptNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        totalUsd: parseFloat(amountUsd),
        totalXlm: parseFloat(amountXlm),
        taxAmount: parseFloat(taxAmount),
        discountAmount: parseFloat(discountAmount),
        txHash: finalTxHash,
        itemsJson: JSON.stringify(items || []),
        merchantId: mId,
      },
    });

    // 2. Create Transaction Record
    const transaction = await prisma.transaction.create({
      data: {
        txHash: finalTxHash,
        amountUsd: parseFloat(amountUsd),
        amountXlm: parseFloat(amountXlm),
        paymentType: paymentType || 'WEBAUTHN_PASSKEY',
        status: 'CONFIRMED',
        customerRef: customerRef || 'Walk-in Customer',
        itemsJson: JSON.stringify(items || []),
        receiptId: receipt.id,
        merchantId: mId,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      receipt,
      stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${finalTxHash}`,
    });
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record transaction' }, { status: 500 });
  }
}
