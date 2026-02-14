# ChainBooks

A blockchain-powered e-book marketplace built with Next.js and NEAR Protocol. Buy curated e-books with crypto through PingPay's decentralized checkout — instant downloads, transparent payments, and no middlemen.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth & Database:** Supabase (PostgreSQL with Row Level Security)
- **Payments:** PingPay (wNEAR via NEAR Protocol)
- **Package Manager:** pnpm

## Features

- Browse and purchase e-books with wNEAR cryptocurrency
- PingPay hosted checkout with webhook payment verification
- Supabase authentication (OAuth)
- Instant PDF downloads after successful payment
- Dark/light theme support
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Supabase project
- A PingPay API key (from [pay.pingpay.io/dashboard](https://pay.pingpay.io/dashboard))

### 1. Clone and install

```bash
git clone <repo-url>
cd chain-books
pnpm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PingPay
PINGPAY_API_KEY=your_pingpay_api_key
PINGPAY_RECIPIENT_ADDRESS=your_near_wallet.near
PINGPAY_WEBHOOK_SECRET=your_pingpay_webhook_secret
```

### 3. Set up the database

Run the SQL schema in your Supabase SQL editor. The schema file is located at `.github/prompts/all.sql` and creates:

- `books` table with public read-only access
- `purchases` table with user-scoped RLS policies
- Sample seed data (5 books)

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  api/
    orders/           POST /api/orders — create PingPay checkout session
      verify/         GET  /api/orders/verify — verify payment status
    pingpay/
      webhook/        POST /api/pingpay/webhook — PingPay webhook handler
  auth/
    login/            Login page
    callback/         OAuth callback handler
  store/              Book listing
    [slug]/           Book detail + purchase page
  dashboard/          User dashboard (purchased books)
  purchases/          Purchase history
  payment/status/     Payment status page
components/
  ui/                 shadcn/ui components
  navbar.tsx          Navigation bar
  book-card.tsx       Book card component
  hero-buttons.tsx    Hero section CTA buttons
  auth-provider.tsx   Auth context provider
lib/
  supabase/           Supabase client utilities (server + client)
  types.ts            TypeScript type definitions
  utils.ts            Utility functions
```

## Payment Flow

1. User clicks "Buy with NEAR" on a book detail page
2. Frontend calls `POST /api/orders` with the `book_id`
3. Backend creates a PingPay checkout session and stores a pending purchase record
4. User is redirected to PingPay's hosted checkout page
5. After payment, user is redirected back to `/payment/status`
6. Payment status is verified via `GET /api/orders/verify`
7. PingPay webhook confirms the payment and updates the purchase to `completed`

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Production build         |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## License

All rights reserved.
