# AlphaRadar

**Discover Alpha. Trade Smarter.**

Non-custodial discovery engine for tokenized stocks on BNB Chain  
(**bStocks · Ondo · xStocks**)

Built for **BNB Hack: Tokenized Stocks Edition** (16 Sep – 11 Oct 2026)

---

## The Problem

Tokenized equities arrived on-chain faster than the tooling.  
When traditional markets close, on-chain prices keep moving.  
Almost nobody systematically monitors the **premium or discount vs the underlying reference price**.

That gap is the signal. AlphaRadar makes it visible.

## Features

- **Premium / Discount vs Reference** — first-class metric and filter
- **Alpha Score** — volume + liquidity + momentum + gap
- **Why Now** explanations for every opportunity
- Sector filters, search, favorites (local)
- Real wallet connection (Binance Wallet, MetaMask, Trust)
- Guided testnet faucet flow
- Data layer ready for Binance Web3 RWA API
- Custom baskets with average gap tracking

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Using Live Data

1. Register for the hackathon → get free Binance Web3 API access  
2. Create a `.env.local` file:

```bash
NEXT_PUBLIC_BINANCE_WEB3_API_KEY=your_key_here
```

3. Restart the dev server. The app will automatically try the real RWA endpoints and fall back to mocks if anything fails.

## Deploy

```bash
npm run build
```

Already on GitHub. Import on Vercel → Deploy.

## License

MIT
