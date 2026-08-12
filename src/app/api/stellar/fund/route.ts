import { NextResponse } from 'next/server';
import { fundWithFriendbot, getAccountBalances } from '@/lib/stellar';

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json();

    if (!publicKey) {
      return NextResponse.json({ error: 'Stellar public key is required' }, { status: 400 });
    }

    const result = await fundWithFriendbot(publicKey);
    const balanceInfo = await getAccountBalances(publicKey);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      balances: balanceInfo.balances,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Friendbot funding request failed' }, { status: 500 });
  }
}
