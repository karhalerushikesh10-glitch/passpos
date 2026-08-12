const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PassPOS database...');

  // Create demo merchant
  const merchant = await prisma.merchant.upsert({
    where: { email: 'merchant@passpos.stellar' },
    update: {},
    create: {
      storeName: 'Stellar Artisanal Coffee & Bakery',
      email: 'merchant@passpos.stellar',
      stellarPublicKey: 'GBV2Z6D564T5E2W7Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6',
      sorobanContractId: 'CC3W75W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7W7',
      currencyPreference: 'USD',
    },
  });

  console.log('Created merchant:', merchant.storeName);

  // Seed sample POS products
  const products = [
    {
      title: 'Espresso Double Shot',
      description: 'Rich organic Ethiopian single-origin espresso',
      priceUsd: 3.50,
      priceXlm: 35.0,
      category: 'Beverages',
      imageEmoji: '☕',
      stock: 250,
      barcode: 'POS-1001',
    },
    {
      title: 'Cold Brew Stellar',
      description: '18-hour cold steeped nitro coffee with oat milk',
      priceUsd: 4.80,
      priceXlm: 48.0,
      category: 'Beverages',
      imageEmoji: '🥤',
      stock: 180,
      barcode: 'POS-1002',
    },
    {
      title: 'Matcha Latte Soroban',
      description: 'Ceremonial grade Uji matcha with vanilla bean',
      priceUsd: 5.20,
      priceXlm: 52.0,
      category: 'Beverages',
      imageEmoji: '🍵',
      stock: 120,
      barcode: 'POS-1003',
    },
    {
      title: 'Butter Croissant',
      description: 'Flaky French butter pastry baked fresh daily',
      priceUsd: 3.80,
      priceXlm: 38.0,
      category: 'Bakery',
      imageEmoji: '🥐',
      stock: 90,
      barcode: 'POS-2001',
    },
    {
      title: 'Avocado Toast Deluxe',
      description: 'Sourdough, smashed avocado, microgreens & poached egg',
      priceUsd: 9.50,
      priceXlm: 95.0,
      category: 'Food',
      imageEmoji: '🥑',
      stock: 60,
      barcode: 'POS-3001',
    },
    {
      title: 'Smoked Salmon Bagel',
      description: 'Everything bagel with dill cream cheese & capers',
      priceUsd: 11.00,
      priceXlm: 110.0,
      category: 'Food',
      imageEmoji: '🥯',
      stock: 45,
      barcode: 'POS-3002',
    },
    {
      title: 'Acai Bowl Supreme',
      description: 'Organic acai, hemp seeds, banana & agave nectar',
      priceUsd: 8.50,
      priceXlm: 85.0,
      category: 'Food',
      imageEmoji: '🫐',
      stock: 50,
      barcode: 'POS-3003',
    },
    {
      title: 'Stellar Merch Tote Bag',
      description: 'Heavyweight organic cotton POS branded tote bag',
      priceUsd: 15.00,
      priceXlm: 150.0,
      category: 'Merch',
      imageEmoji: '🛍️',
      stock: 30,
      barcode: 'POS-4001',
    },
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: {
        ...prod,
        merchantId: merchant.id,
      },
    });
  }

  console.log(`Successfully seeded ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
