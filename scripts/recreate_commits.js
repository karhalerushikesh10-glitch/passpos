const { execSync } = require('child_process');

// Ensure Git identity is set for all commits
execSync('git config user.name "Rushikesh Karhale"', { stdio: 'inherit' });
execSync('git config user.email "karhalerushikesh10-glitch@users.noreply.github.com"', { stdio: 'inherit' });

const commits = [
  {
    msg: "chore: initialize Next.js 14 project structure for PassPOS application",
    files: ["package.json", "tsconfig.json", ".gitignore"]
  },
  {
    msg: "style: configure Tailwind CSS design system and PostCSS options",
    files: ["tailwind.config.ts", "postcss.config.js", "next.config.mjs"]
  },
  {
    msg: "style: import Inter font, bottom blur mask, blur-fade-up keyframes, and liquid glass CSS utility",
    files: ["src/app/globals.css"]
  },
  {
    msg: "feat(hero): implement full-viewport cinematic hero component with background video loop and navbar",
    files: ["src/app/layout.tsx", "src/app/page.tsx"]
  },
  {
    msg: "feat(contract): configure Rust Soroban smart contract dependencies and release profile",
    files: ["contracts/soroban_passpos/Cargo.toml"]
  },
  {
    msg: "feat(contract): write PassPosContract for merchant registration and WebAuthn payment verification",
    files: ["contracts/soroban_passpos/src/lib.rs"]
  },
  {
    msg: "feat(db): define Prisma ORM models for Merchant, Authenticator, Product, Transaction, and Receipt",
    files: ["prisma/schema.prisma"]
  },
  {
    msg: "feat(db): add Prisma client singleton and database seed script for initial POS products",
    files: ["src/lib/db.ts", "prisma/seed.js"]
  },
  {
    msg: "feat(auth): build WebAuthn Passkeys manager for biometric TouchID signing and secure enclave challenges",
    files: ["src/lib/passkey.ts"]
  },
  {
    msg: "feat(stellar): integrate Stellar Testnet SDK, Horizon RPC, SDF Friendbot funder, and keypair generator",
    files: ["src/lib/stellar.ts"]
  },
  {
    msg: "feat(telemetry): add Sentry error tracking and PostHog analytics modules",
    files: ["src/lib/sentry.ts", "src/lib/posthog.ts"]
  },
  {
    msg: "feat(store): construct Zustand store for cart items, currency toggles, active merchant state, and receipts",
    files: ["src/store/usePosStore.ts"]
  },
  {
    msg: "feat(api): create Next.js serverless API routes for passkey auth, products, transactions, and Stellar funding",
    files: ["src/app/api"]
  },
  {
    msg: "feat(ui): build top Navbar component with Stellar Testnet balance badge and passkey status indicator",
    files: ["src/components/layout"]
  },
  {
    msg: "feat(ui): build POS cashier components including ProductGrid, CartDrawer, NumpadModal, PaymentModal, and QrPaymentModal",
    files: ["src/components/pos"]
  },
  {
    msg: "feat(ui): create Merchant Dashboard analytics cards, InventoryTable, TransactionHistory, and ReceiptView",
    files: ["src/components/dashboard", "src/components/ui"]
  },
  {
    msg: "feat(app): implement App Router pages for POS terminal, Merchant Dashboard, Onboarding, and Receipts",
    files: ["src/app/pos", "src/app/dashboard", "src/app/onboarding", "src/app/receipts"]
  },
  {
    msg: "docs: add comprehensive technical architecture diagram, setup guide, and Soroban deployment details",
    files: ["README.md", "docs"]
  },
  {
    msg: "test: add end-to-end integration test script for Soroban contract payloads and Freighter wallet",
    files: ["scripts/test_soroban_integration.js"]
  }
];

for (const commit of commits) {
  try {
    const fileList = commit.files.join(' ');
    execSync(`git add ${fileList}`, { stdio: 'inherit' });
    execSync(`git commit --author="Rushikesh Karhale <karhalerushikesh10-glitch@users.noreply.github.com>" -m "${commit.msg}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Commit failed for ${commit.msg}`, err.message);
  }
}
