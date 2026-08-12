import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credentialId, email } = body;

    const merchant = await prisma.merchant.findFirst({
      where: email ? { email } : undefined,
      include: { authenticators: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 444 });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      merchant: {
        id: merchant.id,
        storeName: merchant.storeName,
        email: merchant.email,
        stellarPublicKey: merchant.stellarPublicKey,
        sorobanContractId: merchant.sorobanContractId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
