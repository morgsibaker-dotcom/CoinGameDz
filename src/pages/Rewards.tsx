import { useState } from 'react'
import { Gift, Check } from 'lucide-react'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { awardPoints } from '../services/earnService'

export default function Rewards(){const [claimed,setClaimed]=useState(false);const [busy,setBusy]=useState(false);const claim=async()=>{if(claimed||busy)return;setBusy(true);try{await awardPoints('daily_checkin');setClaimed(true)}catch{}finally{setBusy(false)}};return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header/><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Rewards</p><h1 className="mt-2 text-3xl font-black">Daily Reward</h1><p className="mt-2 text-sm text-slate-400">Claim once per day.</p><button onClick={claim} disabled={claimed||busy} className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-5 disabled:opacity-60"><span className="flex items-center gap-3"><Gift className="text-sky-400"/><span><b>Daily check-in</b><small className="block text-slate-500 mt-1">+50 DZE</small></span></span>{claimed?<Check className="text-emerald-400"/>:<span className="font-bold text-sky-400">{busy?'Saving…':'Claim'}</span>}</button></section><BottomNavigation/></main>}
