import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const products = await prisma.product.findMany({
      where: category && category !== 'All' ? { category } : undefined,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priceUsd, priceXlm, category, imageEmoji, stock, merchantId } = body;

    if (!title || priceUsd === undefined) {
      return NextResponse.json({ error: 'Title and priceUsd are required' }, { status: 400 });
    }

    const defaultMerchant = await prisma.merchant.findFirst();
    const mId = merchantId || (defaultMerchant ? defaultMerchant.id : 'demo-merchant');

    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || '',
        priceUsd: parseFloat(priceUsd),
        priceXlm: parseFloat(priceXlm || priceUsd * 10),
        category: category || 'General',
        imageEmoji: imageEmoji || '📦',
        stock: parseInt(stock || '100', 10),
        merchantId: mId,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
