export type Sector = "Technology"|"Consumer"|"Finance"|"Energy"|"Healthcare"|"ETF"|"Pre-IPO";
export type Issuer = "bStocks"|"xStocks"|"Ondo";
export type Tab = "feed"|"charts"|"heatmap"|"agent";

export interface Asset {
  id: string; symbol: string; name: string; underlying: string; issuer: Issuer; sector: Sector;
  price: number; referencePrice: number; premiumGapPct: number; change24h: number;
  volume24h: number; liquidity: number; marketCap: number; alphaScore: number;
  whyNow: string; momentum: "Strong"|"Moderate"|"Weak"; risk: "Low"|"Medium"|"High";
  hasMeaningfulGap: boolean; history: number[]; vwap: number; buyVolume: number; sellVolume: number;
}

export const SECTORS: Sector[] = ["Technology","Consumer","Finance","Energy","Healthcare","ETF","Pre-IPO"];

export function genHistory(base: number, vol=0.02) {
  const pts: number[] = []; let p = base*(1-vol*2);
  for (let i=0;i<24;i++) { p = p*(1+(Math.random()-0.48)*vol); pts.push(+p.toFixed(2)); }
  pts[pts.length-1]=base; return pts;
}

export const RAW = [
  {id:"nvdab",symbol:"NVDAB",name:"NVIDIA bStock",underlying:"NVIDIA",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:128.45,referencePrice:126.10,premiumGapPct:1.86,change24h:4.82,volume24h:24500000,liquidity:8900000,marketCap:3.12e9,alphaScore:94,whyNow:"Premium +1.86% after AI earnings. Volume +180% vs 7d.",momentum:"Strong" as const,risk:"Medium" as const,hasMeaningfulGap:true},
  {id:"tslab",symbol:"TSLAB",name:"Tesla bStock",underlying:"Tesla",issuer:"bStocks" as Issuer,sector:"Consumer" as Sector,price:248.12,referencePrice:251.40,premiumGapPct:-1.30,change24h:-1.35,volume24h:18700000,liquidity:7200000,marketCap:1.89e9,alphaScore:81,whyNow:"Discount -1.3%. Weekend gap setup.",momentum:"Moderate" as const,risk:"High" as const,hasMeaningfulGap:true},
  {id:"pltrb",symbol:"PLTRB",name:"Palantir bStock",underlying:"Palantir",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:68.9,referencePrice:65.20,premiumGapPct:5.67,change24h:6.75,volume24h:15600000,liquidity:4800000,marketCap:8.9e8,alphaScore:97,whyNow:"Largest premium +5.67%. Contract wins.",momentum:"Strong" as const,risk:"High" as const,hasMeaningfulGap:true},
  {id:"crclb",symbol:"CRCLB",name:"Circle bStock",underlying:"Circle",issuer:"bStocks" as Issuer,sector:"Finance" as Sector,price:38.4,referencePrice:36.90,premiumGapPct:4.07,change24h:5.1,volume24h:5600000,liquidity:2100000,marketCap:4.1e8,alphaScore:90,whyNow:"USDC growth + IPO narrative.",momentum:"Strong" as const,risk:"Medium" as const,hasMeaningfulGap:true},
  {id:"msftb",symbol:"MSFTB",name:"Microsoft bStock",underlying:"Microsoft",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:421.8,referencePrice:420.55,premiumGapPct:0.30,change24h:1.12,volume24h:9800000,liquidity:5400000,marketCap:1.56e9,alphaScore:85,whyNow:"Tight premium. Cloud intact.",momentum:"Strong" as const,risk:"Low" as const,hasMeaningfulGap:false},
  {id:"spcxb",symbol:"SPCXB",name:"SpaceX bStock",underlying:"SpaceX",issuer:"bStocks" as Issuer,sector:"Pre-IPO" as Sector,price:112.5,referencePrice:109.80,premiumGapPct:2.46,change24h:3.2,volume24h:8200000,liquidity:3100000,marketCap:6.7e8,alphaScore:84,whyNow:"Pre-IPO demand. Starlink.",momentum:"Moderate" as const,risk:"High" as const,hasMeaningfulGap:true},
  {id:"qqqb",symbol:"QQQB",name:"QQQ Trust",underlying:"QQQ",issuer:"bStocks" as Issuer,sector:"ETF" as Sector,price:478.2,referencePrice:477.10,premiumGapPct:0.23,change24h:0.95,volume24h:14500000,liquidity:9200000,marketCap:2.1e9,alphaScore:76,whyNow:"Broad tech, deep liquidity.",momentum:"Moderate" as const,risk:"Low" as const,hasMeaningfulGap:false},
  {id:"amdb",symbol:"AMDB",name:"AMD bStock",underlying:"AMD",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:142.6,referencePrice:143.85,premiumGapPct:-0.87,change24h:-0.8,volume24h:7800000,liquidity:3900000,marketCap:7.2e8,alphaScore:74,whyNow:"Slight discount. Consolidation.",momentum:"Weak" as const,risk:"Medium" as const,hasMeaningfulGap:false},
  {id:"metab",symbol:"METAB",name:"Meta bStock",underlying:"Meta",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:512.3,referencePrice:508.90,premiumGapPct:0.67,change24h:2.45,volume24h:11200000,liquidity:6100000,marketCap:1.34e9,alphaScore:88,whyNow:"Ads + AI. Moderate premium.",momentum:"Strong" as const,risk:"Medium" as const,hasMeaningfulGap:false},
  {id:"mub",symbol:"MUB",name:"Micron bStock",underlying:"Micron",issuer:"bStocks" as Issuer,sector:"Technology" as Sector,price:98.75,referencePrice:97.40,premiumGapPct:1.39,change24h:2.15,volume24h:4300000,liquidity:1800000,marketCap:3.5e8,alphaScore:80,whyNow:"Memory cycle recovery.",momentum:"Moderate" as const,risk:"Medium" as const,hasMeaningfulGap:true},
];

export function enrich(a: typeof RAW[0]): Asset {
  const history = genHistory(a.price);
  const vwap = +(history.reduce((s,p)=>s+p,0)/history.length).toFixed(2);
  const buyVolume = a.volume24h*(0.45+Math.random()*0.2);
  return {...a, history, vwap, buyVolume, sellVolume: a.volume24h-buyVolume};
}

export const fmtP = (n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2});
export const fmtN = (n:number)=>n>=1e9?(n/1e9).toFixed(2)+"B":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":n.toFixed(0);
export const fmtG = (p:number)=>(p>=0?"+":"")+p.toFixed(2)+"%";
export const short = (a:string)=>a?`${a.slice(0,6)}...${a.slice(-4)}`:"";
