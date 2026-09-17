"use client";
import { Asset, fmtP, fmtN } from "@/lib/data";

export function PriceChart({asset}:{asset:Asset}) {
  const d=asset.history, w=600, h=220, pad=24;
  const min=Math.min(...d,asset.vwap,asset.referencePrice)*0.998;
  const max=Math.max(...d,asset.vwap,asset.referencePrice)*1.002;
  const x=(i:number)=>pad+(i/(d.length-1))*(w-pad*2);
  const y=(v:number)=>h-pad-((v-min)/(max-min))*(h-pad*2);
  const path=d.map((v,i)=>`${i===0?"M":"L"} ${x(i)} ${y(v)}`).join(" ");
  const area=`${path} L ${x(d.length-1)} ${h-pad} L ${pad} ${h-pad} Z`;
  const up=d[d.length-1]>=d[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs><linearGradient id={`g-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={up?"#34d399":"#f87171"} stopOpacity="0.25"/>
        <stop offset="100%" stopColor={up?"#34d399":"#f87171"} stopOpacity="0"/>
      </linearGradient></defs>
      {[0.25,0.5,0.75].map(t=><line key={t} x1={pad} x2={w-pad} y1={pad+t*(h-pad*2)} y2={pad+t*(h-pad*2)} stroke="#27272a" strokeWidth="1"/>)}
      <line x1={pad} x2={w-pad} y1={y(asset.vwap)} y2={y(asset.vwap)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4"/>
      <text x={w-pad-4} y={y(asset.vwap)-6} fill="#f59e0b" fontSize="10" textAnchor="end">VWAP {fmtP(asset.vwap)}</text>
      <line x1={pad} x2={w-pad} y1={y(asset.referencePrice)} y2={y(asset.referencePrice)} stroke="#71717a" strokeWidth="1" strokeDasharray="3 3"/>
      <path d={area} fill={`url(#g-${asset.id})`}/><path d={path} fill="none" stroke={up?"#34d399":"#f87171"} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={x(d.length-1)} cy={y(d[d.length-1])} r="4" fill={up?"#34d399":"#f87171"}/>
    </svg>
  );
}

export function Footprint({asset}:{asset:Asset}) {
  const levels=8, min=Math.min(...asset.history), max=Math.max(...asset.history), step=(max-min)/levels||1;
  const buckets=Array.from({length:levels},(_,i)=>{
    const lo=min+i*step, hi=lo+step;
    const intensity=asset.history.filter(p=>p>=lo&&p<hi+(i===levels-1?1:0)).length/asset.history.length;
    const buyShare=0.35+Math.random()*0.3+(i>levels/2?0.1:-0.05);
    return {hi, intensity, buy:intensity*buyShare, sell:intensity*(1-buyShare)};
  });
  const maxInt=Math.max(...buckets.map(b=>b.intensity),0.01);
  return (
    <div className="space-y-1">
      {[...buckets].reverse().map((b,i)=>(
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-20 text-zinc-400 text-right tabular-nums">{fmtP(b.hi)}</span>
          <div className="flex-1 flex h-4 rounded overflow-hidden bg-zinc-800">
            <div className="bg-emerald-500/80 h-full" style={{width:`${(b.buy/maxInt)*50}%`}}/>
            <div className="bg-red-500/80 h-full" style={{width:`${(b.sell/maxInt)*50}%`}}/>
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-[10px] text-zinc-500 mt-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500"/> Buy {fmtN(asset.buyVolume)}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500"/> Sell {fmtN(asset.sellVolume)}</span>
      </div>
    </div>
  );
}
