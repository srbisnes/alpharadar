import { Asset, fmtP, fmtN, fmtG } from "@/lib/data";

export function agentReply(q: string, assets: Asset[]) {
  const lower = q.toLowerCase();
  const byGap = [...assets].sort((a,b)=>Math.abs(b.premiumGapPct)-Math.abs(a.premiumGapPct));
  const byScore = [...assets].sort((a,b)=>b.alphaScore-a.alphaScore);
  const byVol = [...assets].sort((a,b)=>b.volume24h-a.volume24h);
  if (/top|mejor|alpha|score/i.test(lower))
    return `Top Alpha:\n${byScore.slice(0,3).map((a,i)=>`${i+1}. ${a.symbol} Score ${a.alphaScore} | Gap ${fmtG(a.premiumGapPct)}\n   ${a.whyNow}`).join("\n")}`;
  if (/gap|premium|descuento/i.test(lower))
    return `Mayores gaps:\n${byGap.slice(0,4).map(a=>`• ${a.symbol}: ${fmtG(a.premiumGapPct)} (${fmtP(a.price)} vs ref ${fmtP(a.referencePrice)})`).join("\n")}`;
  if (/volumen|volume|liquidez/i.test(lower))
    return `Más volumen:\n${byVol.slice(0,3).map(a=>`• ${a.symbol}: $${fmtN(a.volume24h)} | Liq $${fmtN(a.liquidity)}`).join("\n")}`;
  if (/vwap/i.test(lower))
    return assets.slice(0,5).map(a=>`${a.symbol}: ${fmtP(a.price)} vs VWAP ${fmtP(a.vwap)} (${a.price>=a.vwap?"sobre":"bajo"})`).join("\n");
  if (/resumen|summary|radar/i.test(lower))
    return `Radar: ${assets.length} assets | ${assets.filter(a=>a.premiumGapPct>1).length} premiums | Mayor gap: ${byGap[0].symbol} ${fmtG(byGap[0].premiumGapPct)} | Mejor Alpha: ${byScore[0].symbol} (${byScore[0].alphaScore})`;
  const sym = assets.find(a=>lower.includes(a.symbol.toLowerCase())||lower.includes(a.underlying.toLowerCase()));
  if (sym) return `${sym.symbol}: ${fmtP(sym.price)} | Gap ${fmtG(sym.premiumGapPct)} | VWAP ${fmtP(sym.vwap)} | Alpha ${sym.alphaScore}\n${sym.whyNow}`;
  return `Preguntame: "top alpha", "mayores gaps", "volumen", "VWAP", "resumen" o un símbolo (NVDAB, TSLAB…)`;
}
