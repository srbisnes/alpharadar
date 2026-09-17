"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Asset, SECTORS, RAW, enrich, fmtP, fmtN, fmtG, short, Tab } from "@/lib/data";
import { PriceChart, Footprint } from "@/components/Charts";
import { agentReply } from "@/lib/agent";

export default function Home() {
  const [assets,setAssets]=useState<Asset[]>(()=>RAW.map(enrich));
  const [tab,setTab]=useState<Tab>("feed");
  const [sector,setSector]=useState("All");
  const [sortBy,setSortBy]=useState<"alphaScore"|"premiumGapPct"|"volume24h">("alphaScore");
  const [gapsOnly,setGapsOnly]=useState(false);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState<Asset|null>(null);
  const [chartAsset,setChartAsset]=useState<Asset|null>(null);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [live,setLive]=useState(true);
  const [address,setAddress]=useState<string|null>(null);
  const [chainId,setChainId]=useState<string|null>(null);
  const [walletError,setWalletError]=useState("");
  const [profile,setProfile]=useState<{nickname:string;email?:string}|null>(null);
  const [showRegister,setShowRegister]=useState(false);
  const [regNick,setRegNick]=useState("");
  const [regEmail,setRegEmail]=useState("");
  const [msgs,setMsgs]=useState<{role:"user"|"assistant";text:string}[]>([{role:"assistant",text:"Alpha Agent listo. Preguntame por gaps, top alpha, volumen, VWAP o cualquier símbolo del radar."}]);
  const [input,setInput]=useState("");
  const chatEnd=useRef<HTMLDivElement>(null);

  useEffect(()=>{try{const f=localStorage.getItem("ar_fav");if(f)setFavorites(JSON.parse(f));const p=localStorage.getItem("ar_prof");if(p)setProfile(JSON.parse(p));}catch{}},[]);
  useEffect(()=>{if(!live)return;const id=setInterval(()=>{setAssets(prev=>prev.map(a=>{const d=(Math.random()-0.5)*0.004;const price=+(a.price*(1+d)).toFixed(2);const premiumGapPct=+(((price-a.referencePrice)/a.referencePrice)*100).toFixed(2);const history=[...a.history.slice(1),price];const vwap=+(history.reduce((s,p)=>s+p,0)/history.length).toFixed(2);return{...a,price,premiumGapPct,hasMeaningfulGap:Math.abs(premiumGapPct)>=1,history,vwap,change24h:+(a.change24h+d*100).toFixed(2)};}));},4000);return()=>clearInterval(id);},[live]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const connectWallet=useCallback(async()=>{setWalletError("");const eth=(window as any).ethereum;if(!eth){setWalletError("Instalá MetaMask o Binance Wallet");return;}try{const accs=await eth.request({method:"eth_requestAccounts"});setAddress(accs[0]);setChainId(await eth.request({method:"eth_chainId"}));eth.on?.("accountsChanged",(a:string[])=>setAddress(a[0]||null));eth.on?.("chainChanged",(c:string)=>setChainId(c));}catch(e:any){setWalletError(e?.message||"Rechazado");}},[]);
  const switchBsc=useCallback(async()=>{const eth=(window as any).ethereum;if(!eth)return;try{await eth.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x38"}]});}catch(e:any){if(e.code===4902)await eth.request({method:"wallet_addEthereumChain",params:[{chainId:"0x38",chainName:"BNB Smart Chain",nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18},rpcUrls:["https://bsc-dataseed.binance.org"],blockExplorerUrls:["https://bscscan.com"]}]});}},[]);
  const register=()=>{if(!regNick.trim())return;const p={nickname:regNick.trim(),email:regEmail.trim()||undefined};localStorage.setItem("ar_prof",JSON.stringify(p));setProfile(p);setShowRegister(false);};
  const toggleFav=(id:string)=>{setFavorites(prev=>{const n=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];localStorage.setItem("ar_fav",JSON.stringify(n));return n;});};
  const sendAgent=()=>{if(!input.trim())return;const q=input.trim();setMsgs(m=>[...m,{role:"user",text:q}]);setInput("");setTimeout(()=>setMsgs(m=>[...m,{role:"assistant",text:agentReply(q,assets)}]),400);};

  const filtered=useMemo(()=>{let list=[...assets];if(sector!=="All")list=list.filter(a=>a.sector===sector);if(gapsOnly)list=list.filter(a=>a.hasMeaningfulGap);if(search.trim()){const q=search.toLowerCase();list=list.filter(a=>a.symbol.toLowerCase().includes(q)||a.name.toLowerCase().includes(q));}list.sort((a,b)=>sortBy==="premiumGapPct"?Math.abs(b.premiumGapPct)-Math.abs(a.premiumGapPct):(b[sortBy] as number)-(a[sortBy] as number));return list;},[assets,sector,sortBy,gapsOnly,search]);
  const gapCount=assets.filter(a=>a.hasMeaningfulGap).length;
  const isBsc=chainId==="0x38"||chainId==="0x61";
  const activeChart=chartAsset||filtered[0]||assets[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-xs">AR</div>
            <div><h1 className="font-bold text-white text-base leading-none">AlphaRadar</h1><p className="text-[10px] text-zinc-500">Tokenized Stocks · BNB</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setLive(v=>!v)} className={`px-2 py-1 rounded-full text-[11px] border ${live?"bg-emerald-500/15 text-emerald-400 border-emerald-500/40":"bg-zinc-800 text-zinc-400 border-zinc-700"}`}>{live?"● LIVE":"○ PAUSED"}</button>
            {profile?<span className="hidden sm:inline text-xs text-zinc-400">hi, {profile.nickname}</span>:<button onClick={()=>setShowRegister(true)} className="text-xs text-zinc-400 hover:text-amber-400 px-2">Register</button>}
            {address?(
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isBsc?"bg-emerald-500/15 text-emerald-400":"bg-amber-500/15 text-amber-400"}`}>{chainId==="0x38"?"BSC":chainId==="0x61"?"tBSC":"Wrong net"}</span>
                <button onClick={switchBsc} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-lg">{short(address)}</button>
              </div>
            ):<button onClick={connectWallet} className="text-xs font-medium bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg">Connect Wallet</button>}
          </div>
        </div>
        {walletError&&<div className="text-center text-xs text-red-400 py-1 bg-red-500/10">{walletError}</div>}
      </header>

      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {([["feed","Radar"],["charts","Charts · VWAP · Footprint"],["heatmap","Heatmap"],["agent","Alpha Agent"]] as const).map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${tab===id?"border-amber-500 text-amber-400":"border-transparent text-zinc-500 hover:text-zinc-300"}`}>{label}</button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab==="feed"&&(<>
          <section className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium mb-3">BNB Hack · Tokenized Stocks</div>
            <h2 className="text-2xl sm:text-3xl font-bold">Discovery for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">tokenized stocks</span></h2>
            <p className="mt-2 text-zinc-400 text-sm max-w-2xl">Premium gap, Alpha Score, VWAP, footprint y agente en vivo.</p>
          </section>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="search" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"/>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white">
              <option value="alphaScore">Alpha Score</option><option value="premiumGapPct">Premium Gap</option><option value="volume24h">Volume</option>
            </select>
            <button onClick={()=>setGapsOnly(v=>!v)} className={`px-4 py-2 rounded-xl text-sm font-medium border ${gapsOnly?"bg-amber-500 text-black border-amber-500":"bg-zinc-900 text-zinc-400 border-zinc-800"}`}>Gaps ({gapCount})</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={()=>setSector("All")} className={`px-3 py-1 rounded-lg text-xs font-medium ${sector==="All"?"bg-amber-500 text-black":"bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>All</button>
            {SECTORS.map(s=><button key={s} onClick={()=>setSector(s)} className={`px-3 py-1 rounded-lg text-xs font-medium ${sector===s?"bg-amber-500 text-black":"bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>{s}</button>)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(asset=>(
              <div key={asset.id} onClick={()=>{setSelected(asset);setChartAsset(asset);}} className={`relative bg-zinc-900/80 border rounded-xl p-4 cursor-pointer hover:shadow-lg transition ${asset.hasMeaningfulGap?"border-amber-500/50":"border-zinc-800"}`}>
                {asset.hasMeaningfulGap&&<div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold">GAP</div>}
                <div className="flex justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">{asset.symbol.slice(0,3)}</div>
                    <div><div className="font-semibold flex gap-2 items-center">{asset.symbol}<span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{asset.issuer}</span></div><div className="text-xs text-zinc-500">{asset.underlying}</div></div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();toggleFav(asset.id);}} className={favorites.includes(asset.id)?"text-amber-400":"text-zinc-600"}>{favorites.includes(asset.id)?"★":"☆"}</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><div className="text-[10px] text-zinc-500">On-chain</div><div className="font-medium">{fmtP(asset.price)}</div></div>
                  <div><div className="text-[10px] text-zinc-500">vs Ref</div><div className={`font-semibold ${asset.premiumGapPct>=0?"text-emerald-400":"text-red-400"}`}>{fmtG(asset.premiumGapPct)}</div></div>
                  <div><div className="text-[10px] text-zinc-500">VWAP</div><div className="text-zinc-300">{fmtP(asset.vwap)}</div></div>
                  <div><div className="text-[10px] text-zinc-500">Alpha</div><div className="font-bold text-amber-400">{asset.alphaScore}</div></div>
                </div>
                <div className="mt-2 text-xs text-zinc-500 line-clamp-2">{asset.whyNow}</div>
              </div>
            ))}
          </div>
        </>)}

        {tab==="charts"&&(
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-xl font-bold">Charts · VWAP · Footprint</h2>
              <select value={activeChart?.id||""} onChange={e=>setChartAsset(assets.find(a=>a.id===e.target.value)||null)} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white">
                {assets.map(a=><option key={a.id} value={a.id}>{a.symbol} — {fmtG(a.premiumGapPct)}</option>)}
              </select>
            </div>
            {activeChart&&(
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <div><div className="text-lg font-bold">{activeChart.symbol}</div><div className="text-2xl font-semibold tabular-nums">{fmtP(activeChart.price)}</div>
                      <div className={`text-sm ${activeChart.change24h>=0?"text-emerald-400":"text-red-400"}`}>{activeChart.change24h>=0?"+":""}{activeChart.change24h.toFixed(2)}% · Gap {fmtG(activeChart.premiumGapPct)}</div></div>
                    <div className="text-right text-xs text-zinc-500"><div>VWAP <span className="text-amber-400 font-medium">{fmtP(activeChart.vwap)}</span></div><div>Ref <span className="text-zinc-300">{fmtP(activeChart.referencePrice)}</span></div></div>
                  </div>
                  <PriceChart asset={activeChart}/>
                  <p className="text-[10px] text-zinc-600 mt-2">Ámbar = VWAP · Gris = referencia · Tick en vivo cada 4s</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Footprint / Volume Profile</h3>
                  <Footprint asset={activeChart}/>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="heatmap"&&(
          <div className="space-y-4">
            <div><h2 className="text-xl font-bold">Premium Gap Heatmap</h2><p className="text-sm text-zinc-500">Color por intensidad del gap. Click para chart.</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[...assets].sort((a,b)=>Math.abs(b.premiumGapPct)-Math.abs(a.premiumGapPct)).map(a=>{
                const intensity=Math.min(Math.abs(a.premiumGapPct)/6,1);
                const pos=a.premiumGapPct>=0;
                const bg=pos?`rgba(16,185,129,${0.15+intensity*0.55})`:`rgba(239,68,68,${0.15+intensity*0.55})`;
                return (
                  <button key={a.id} onClick={()=>{setSelected(a);setChartAsset(a);setTab("charts");}} className={`rounded-xl border p-3 text-left transition hover:scale-[1.02] ${pos?"border-emerald-500/40":"border-red-500/40"}`} style={{background:bg}}>
                    <div className="font-bold text-sm">{a.symbol}</div>
                    <div className={`text-lg font-semibold tabular-nums ${pos?"text-emerald-300":"text-red-300"}`}>{fmtG(a.premiumGapPct)}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Alpha {a.alphaScore} · ${fmtN(a.volume24h)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab==="agent"&&(
          <div className="max-w-2xl mx-auto">
            <div className="mb-4"><h2 className="text-xl font-bold">Alpha Agent</h2><p className="text-sm text-zinc-500">Responde con el estado actual del radar (live demo).</p></div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col h-[480px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs.map((m,i)=>(
                  <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role==="user"?"bg-amber-500 text-black":"bg-zinc-800 text-zinc-200"}`}>{m.text}</div>
                  </div>
                ))}
                <div ref={chatEnd}/>
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAgent()} placeholder='Ej: "mayores gaps", "NVDAB"...' className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"/>
                <button onClick={sendAgent} className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400">Send</button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["resumen","mayores gaps","top alpha","volumen","VWAP"].map(q=>(
                <button key={q} onClick={()=>{setInput(q);setTimeout(sendAgent,50);}} className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-700">{q}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      {selected&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={()=>setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <div><h2 className="text-xl font-bold">{selected.symbol}</h2><p className="text-sm text-zinc-400">{selected.name}</p></div>
              <button onClick={()=>setSelected(null)} className="text-zinc-400">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-3xl font-bold">{fmtP(selected.price)}</div>
              <div className={`rounded-xl p-3 border ${selected.hasMeaningfulGap?"bg-amber-500/10 border-amber-500/40":"border-zinc-800"}`}>
                <div className="flex justify-between"><span className="text-sm text-zinc-400">Premium vs Ref</span><span className={`font-bold ${selected.premiumGapPct>=0?"text-emerald-400":"text-red-400"}`}>{fmtG(selected.premiumGapPct)}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-zinc-950 rounded-lg p-2"><div className="text-xs text-zinc-500">VWAP</div>{fmtP(selected.vwap)}</div>
                <div className="bg-zinc-950 rounded-lg p-2"><div className="text-xs text-zinc-500">Alpha</div><span className="text-amber-400 font-bold">{selected.alphaScore}</span></div>
                <div className="bg-zinc-950 rounded-lg p-2"><div className="text-xs text-zinc-500">Volume</div>${fmtN(selected.volume24h)}</div>
                <div className="bg-zinc-950 rounded-lg p-2"><div className="text-xs text-zinc-500">Liquidity</div>${fmtN(selected.liquidity)}</div>
              </div>
              <div><h3 className="text-sm font-semibold text-amber-400 mb-1">Why Now</h3><p className="text-sm text-zinc-300">{selected.whyNow}</p></div>
              <div className="flex gap-2">
                <button onClick={()=>{setChartAsset(selected);setTab("charts");setSelected(null);}} className="flex-1 py-2 rounded-lg bg-zinc-800 text-sm">Ver Chart</button>
                <a href="https://pancakeswap.finance/" target="_blank" rel="noreferrer" className="flex-1 text-center py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold">Trade</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegister&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={()=>setShowRegister(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Create profile</h2>
            <p className="text-xs text-zinc-500 mb-4">Local only. Non-custodial.</p>
            <input value={regNick} onChange={e=>setRegNick(e.target.value)} placeholder="Nickname" className="w-full mb-3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-500/50"/>
            <input value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Email (optional)" className="w-full mb-4 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-500/50"/>
            <div className="flex gap-2">
              <button onClick={register} className="flex-1 py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm">Save</button>
              <button onClick={()=>setShowRegister(false)} className="px-4 py-2 rounded-lg bg-zinc-800 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 py-6 border-t border-zinc-800 text-center text-[11px] text-zinc-600">
        AlphaRadar · Charts · VWAP · Footprint · Heatmap · Agent · Wallet · BNB Hack
      </footer>
    </div>
  );
}
