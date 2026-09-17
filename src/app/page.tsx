"use client";

import { useState, useMemo, useEffect } from "react";

type Sector = "Technology" | "Consumer" | "Finance" | "Energy" | "Healthcare" | "ETF" | "Pre-IPO";
type Issuer = "bStocks" | "xStocks" | "Ondo";

interface TokenizedAsset {
  id: string;
  symbol: string;
  name: string;
  underlying: string;
  issuer: Issuer;
  sector: Sector;
  price: number;
  referencePrice: number;
  premiumGapPct: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  alphaScore: number;
  whyNow: string;
  momentum: "Strong" | "Moderate" | "Weak";
  risk: "Low" | "Medium" | "High";
  hasMeaningfulGap: boolean;
}

const SECTORS: Sector[] = ["Technology", "Consumer", "Finance", "Energy", "Healthcare", "ETF", "Pre-IPO"];

const MOCK_ASSETS: TokenizedAsset[] = [
  { id: "nvdab", symbol: "NVDAB", name: "NVIDIA bStock", underlying: "NVIDIA Corp", issuer: "bStocks", sector: "Technology", price: 128.45, referencePrice: 126.10, premiumGapPct: 1.86, change24h: 4.82, volume24h: 24500000, liquidity: 8900000, marketCap: 3120000000, alphaScore: 94, whyNow: "On-chain premium +1.86% vs reference after AI earnings. Volume +180% vs 7d avg.", momentum: "Strong", risk: "Medium", hasMeaningfulGap: true },
  { id: "tslab", symbol: "TSLAB", name: "Tesla bStock", underlying: "Tesla Inc", issuer: "bStocks", sector: "Consumer", price: 248.12, referencePrice: 251.40, premiumGapPct: -1.30, change24h: -1.35, volume24h: 18700000, liquidity: 7200000, marketCap: 1890000000, alphaScore: 81, whyNow: "Trading at a -1.3% discount to reference. Classic weekend gap setup.", momentum: "Moderate", risk: "High", hasMeaningfulGap: true },
  { id: "pltrb", symbol: "PLTRB", name: "Palantir bStock", underlying: "Palantir Technologies", issuer: "bStocks", sector: "Technology", price: 68.9, referencePrice: 65.20, premiumGapPct: 5.67, change24h: 6.75, volume24h: 15600000, liquidity: 4800000, marketCap: 890000000, alphaScore: 97, whyNow: "Largest premium in the set (+5.67%). Explosive momentum after contract wins.", momentum: "Strong", risk: "High", hasMeaningfulGap: true },
  { id: "crclb", symbol: "CRCLB", name: "Circle bStock", underlying: "Circle Internet Group", issuer: "bStocks", sector: "Finance", price: 38.4, referencePrice: 36.90, premiumGapPct: 4.07, change24h: 5.1, volume24h: 5600000, liquidity: 2100000, marketCap: 410000000, alphaScore: 90, whyNow: "USDC growth narrative + potential IPO catalysts. Meaningful premium.", momentum: "Strong", risk: "Medium", hasMeaningfulGap: true },
  { id: "msftb", symbol: "MSFTB", name: "Microsoft bStock", underlying: "Microsoft Corp", issuer: "bStocks", sector: "Technology", price: 421.8, referencePrice: 420.55, premiumGapPct: 0.30, change24h: 1.12, volume24h: 9800000, liquidity: 5400000, marketCap: 1560000000, alphaScore: 85, whyNow: "Tight premium. Steady accumulation. Cloud growth narrative intact.", momentum: "Strong", risk: "Low", hasMeaningfulGap: false },
  { id: "spcxb", symbol: "SPCXB", name: "SpaceX bStock", underlying: "SpaceX (Pre-IPO)", issuer: "bStocks", sector: "Pre-IPO", price: 112.5, referencePrice: 109.80, premiumGapPct: 2.46, change24h: 3.2, volume24h: 8200000, liquidity: 3100000, marketCap: 670000000, alphaScore: 84, whyNow: "Continued demand for pre-IPO exposure. Premium reflects Starlink narrative.", momentum: "Moderate", risk: "High", hasMeaningfulGap: true },
  { id: "qqqb", symbol: "QQQB", name: "Invesco QQQ Trust", underlying: "QQQ ETF", issuer: "bStocks", sector: "ETF", price: 478.2, referencePrice: 477.10, premiumGapPct: 0.23, change24h: 0.95, volume24h: 14500000, liquidity: 9200000, marketCap: 2100000000, alphaScore: 76, whyNow: "Broad tech exposure with deep liquidity.", momentum: "Moderate", risk: "Low", hasMeaningfulGap: false },
  { id: "amdb", symbol: "AMDB", name: "AMD bStock", underlying: "Advanced Micro Devices", issuer: "bStocks", sector: "Technology", price: 142.6, referencePrice: 143.85, premiumGapPct: -0.87, change24h: -0.8, volume24h: 7800000, liquidity: 3900000, marketCap: 720000000, alphaScore: 74, whyNow: "Slight discount. Consolidation after strong run.", momentum: "Weak", risk: "Medium", hasMeaningfulGap: false },
  { id: "metab", symbol: "METAB", name: "Meta bStock", underlying: "Meta Platforms", issuer: "bStocks", sector: "Technology", price: 512.3, referencePrice: 508.90, premiumGapPct: 0.67, change24h: 2.45, volume24h: 11200000, liquidity: 6100000, marketCap: 1340000000, alphaScore: 88, whyNow: "Advertising recovery + AI investments. Moderate premium.", momentum: "Strong", risk: "Medium", hasMeaningfulGap: false },
  { id: "mub", symbol: "MUB", name: "Micron bStock", underlying: "Micron Technology", issuer: "bStocks", sector: "Technology", price: 98.75, referencePrice: 97.40, premiumGapPct: 1.39, change24h: 2.15, volume24h: 4300000, liquidity: 1800000, marketCap: 350000000, alphaScore: 80, whyNow: "Memory cycle recovery thesis. Positive gap.", momentum: "Moderate", risk: "Medium", hasMeaningfulGap: true },
];

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}
function formatNumber(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}
function formatGap(pct: number) {
  return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
}

export default function Home() {
  const [sector, setSector] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"alphaScore" | "premiumGapPct" | "volume24h">("alphaScore");
  const [gapsOnly, setGapsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TokenizedAsset | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const f = localStorage.getItem("alpharadar_favorites");
      if (f) setFavorites(JSON.parse(f));
    } catch {}
  }, []);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("alpharadar_favorites", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...MOCK_ASSETS];
    if (sector !== "All") list = list.filter((a) => a.sector === sector);
    if (gapsOnly) list = list.filter((a) => a.hasMeaningfulGap);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.underlying.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === "premiumGapPct") return Math.abs(b.premiumGapPct) - Math.abs(a.premiumGapPct);
      return (b[sortBy] as number) - (a[sortBy] as number);
    });
    return list;
  }, [sector, sortBy, gapsOnly, search]);

  const gapCount = MOCK_ASSETS.filter((a) => a.hasMeaningfulGap).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20">AR</div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none tracking-tight">AlphaRadar</h1>
              <p className="text-[10px] text-zinc-500 tracking-wide">Tokenized Stocks · BNB Chain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://bnbchain.org/en/hackathons/tokenized-stocks" target="_blank" rel="noreferrer" className="hidden sm:inline text-xs text-zinc-400 hover:text-amber-400">BNB Hack</a>
            <span className="px-2 py-1 rounded-full text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700">Demo Data</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium mb-4">
            BNB Hack · Tokenized Stocks Edition
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Discovery layer for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">tokenized stocks</span>
          </h2>
          <p className="mt-3 text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            AlphaRadar ranks activity, liquidity, momentum and the{" "}
            <span className="text-zinc-200 font-medium">premium or discount vs reference price</span>{" "}
            on BNB Chain. Built for bStocks, Ondo and xStocks.
          </p>
        </section>

        <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-amber-400 text-sm font-semibold mb-1">Premium Gap</div>
            <p className="text-xs text-zinc-500">See when on-chain price diverges from the underlying reference — the signal when traditional markets are closed.</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-amber-400 text-sm font-semibold mb-1">Alpha Score</div>
            <p className="text-xs text-zinc-500">Composite ranking of volume, liquidity, momentum and gap size.</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-amber-400 text-sm font-semibold mb-1">Why Now</div>
            <p className="text-xs text-zinc-500">Human-readable context for every opportunity before you trade.</p>
          </div>
        </section>

        <section className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="search" placeholder="Search symbol or name..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500/50">
              <option value="alphaScore">Sort: Alpha Score</option>
              <option value="premiumGapPct">Sort: Premium Gap</option>
              <option value="volume24h">Sort: Volume</option>
            </select>
            <button onClick={() => setGapsOnly((v) => !v)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${gapsOnly ? "bg-amber-500 text-black border-amber-500" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
              Gaps ({gapCount})
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSector("All")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sector === "All" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>All</button>
            {SECTORS.map((s) => (
              <button key={s} onClick={() => setSector(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sector === s ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-4">Opportunity Explorer <span className="text-sm font-normal text-zinc-500">{filtered.length} assets</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((asset) => (
              <div key={asset.id} onClick={() => setSelected(asset)}
                className={`relative bg-zinc-900/80 border rounded-xl p-4 cursor-pointer transition hover:shadow-lg ${asset.hasMeaningfulGap ? "border-amber-500/50 hover:border-amber-400/70" : "border-zinc-800 hover:border-amber-500/40"}`}>
                {asset.hasMeaningfulGap && <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold">GAP</div>}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">{asset.symbol.slice(0, 3)}</div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">{asset.symbol}<span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">{asset.issuer}</span></div>
                      <div className="text-xs text-zinc-500">{asset.underlying}</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(asset.id); }} className={`p-1.5 rounded-lg ${favorites.includes(asset.id) ? "text-amber-400" : "text-zinc-600 hover:text-amber-400"}`}>
                    {favorites.includes(asset.id) ? "★" : "☆"}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-zinc-500 text-xs">On-chain</div><div className="font-medium text-white">{formatPrice(asset.price)}</div></div>
                  <div><div className="text-zinc-500 text-xs">vs Reference</div><div className={`font-semibold ${asset.premiumGapPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatGap(asset.premiumGapPct)}</div></div>
                  <div><div className="text-zinc-500 text-xs">24h</div><div className={`font-medium ${asset.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>{asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%</div></div>
                  <div><div className="text-zinc-500 text-xs">Volume</div><div className="text-zinc-300">${formatNumber(asset.volume24h)}</div></div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Alpha</span>
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${asset.alphaScore >= 90 ? "bg-emerald-400" : asset.alphaScore >= 75 ? "bg-amber-400" : "bg-zinc-500"}`} style={{ width: `${asset.alphaScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white">{asset.alphaScore}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${asset.momentum === "Strong" ? "bg-emerald-500/15 text-emerald-400" : asset.momentum === "Moderate" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-700 text-zinc-400"}`}>{asset.momentum}</span>
                </div>
                <div className="mt-3 text-xs text-zinc-500 line-clamp-2">{asset.whyNow}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600">
          <p>AlphaRadar · Non-custodial discovery for tokenized equities on BNB Chain</p>
          <p className="mt-1">Built for BNB Hack: Tokenized Stocks Edition · bStocks · Ondo · xStocks</p>
        </footer>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400">{selected.symbol.slice(0, 3)}</div>
                <div><h2 className="text-xl font-bold text-white">{selected.symbol}</h2><p className="text-sm text-zinc-400">{selected.name}</p></div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="text-3xl font-bold text-white">{formatPrice(selected.price)}</div>
                <div className="text-sm text-zinc-400">On-chain · Ref {formatPrice(selected.referencePrice)}</div>
                <div className={`text-sm font-medium mt-1 ${selected.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>{selected.change24h >= 0 ? "+" : ""}{selected.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div className={`rounded-xl p-4 border ${selected.hasMeaningfulGap ? "bg-amber-500/10 border-amber-500/40" : "bg-zinc-950/50 border-zinc-800"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-300">Premium / Discount vs Reference</span>
                  <span className={`text-xl font-bold ${selected.premiumGapPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatGap(selected.premiumGapPct)}</span>
                </div>
                <p className="text-xs text-zinc-500">On-chain price relative to underlying reference. The core white space of tokenized equities.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/40 rounded-lg p-3"><div className="text-xs text-zinc-500">Volume 24h</div><div className="text-sm font-medium text-white">${formatNumber(selected.volume24h)}</div></div>
                <div className="bg-zinc-950/40 rounded-lg p-3"><div className="text-xs text-zinc-500">Liquidity</div><div className="text-sm font-medium text-white">${formatNumber(selected.liquidity)}</div></div>
                <div className="bg-zinc-950/40 rounded-lg p-3"><div className="text-xs text-zinc-500">Alpha Score</div><div className="text-sm font-medium text-amber-400">{selected.alphaScore}</div></div>
                <div className="bg-zinc-950/40 rounded-lg p-3"><div className="text-xs text-zinc-500">Issuer</div><div className="text-sm font-medium text-white">{selected.issuer}</div></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Why Now</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{selected.whyNow}</p>
              </div>
              <a href="https://pancakeswap.finance/" target="_blank" rel="noreferrer" className="block w-full text-center py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition">Trade on PancakeSwap</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
