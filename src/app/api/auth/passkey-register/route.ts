import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createStellarKeypair, fundWithFriendbot } from '@/lib/stellar';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeName, email, passkeyCredential } = body;

    if (!storeName || !email) {
      return NextResponse.json({ error: 'Store name and email are required' }, { status: 400 });
    }

    // Check if merchant exists or create new Stellar keypair
    let merchant = await prisma.merchant.findUnique({
      where: { email },
    });

    if (!merchant) {
      const keypair = createStellarKeypair();
      // Auto fund testnet account
      await fundWithFriendbot(keypair.publicKey);

      merchant = await prisma.merchant.create({
        data: {
          storeName,
          email,
          stellarPublicKey: keypair.publicKey,
          currencyPreference: 'USD',
        },
      });
    }

    // Save passkey authenticator metadata if provided
    if (passkeyCredential && passkeyCredential.id) {
      await prisma.authenticator.create({
        data: {
          credentialID: passkeyCredential.id,
          credentialPublicKey: Buffer.from(passkeyCredential.rawId || 'mock_pubkey'),
          counter: BigInt(1),
          credentialDeviceType: passkeyCredential.authenticatorAttachment || 'platform',
          credentialBackedUp: true,
          transports: JSON.stringify(passkeyCredential.clientExtensionResults || {}),
          merchantId: merchant.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        storeName: merchant.storeName,
        email: merchant.email,
        stellarPublicKey: merchant.stellarPublicKey,
        currencyPreference: merchant.currencyPreference,
      },
    });
  } catch (error: any) {
    console.error('Passkey register API error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
