import { useState } from 'react'
import { Check, Play, Gift, ListChecks } from 'lucide-react'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

const actions = [
  { id: 'daily', label: 'Daily check-in', reward: 50, icon: Gift },
  { id: 'ad', label: 'Watch a rewarded ad', reward: 100, icon: Play },
  { id: 'task', label: 'Complete a task', reward: 250, icon: ListChecks },
]

export default function Earn() {
  const [claimed, setClaimed] = useState<string[]>([])
  const claim = (id: string) => setClaimed(v => v.includes(id) ? v : [...v, id])
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Earn</p><h1 className="mt-2 text-3xl font-black">Earn DZE</h1><p className="mt-2 text-sm text-slate-400">Complete activities and collect virtual coins.</p><div className="mt-6 space-y-3">{actions.map(({id,label,reward,icon:Icon}) => { const done=claimed.includes(id); return <button key={id} disabled={done} onClick={()=>claim(id)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left disabled:opacity-60"><span className="flex items-center gap-3"><Icon className="h-5 w-5 text-sky-400"/><span className="font-semibold">{label}</span></span>{done ? <Check className="h-5 w-5 text-emerald-400"/> : <span className="font-bold text-sky-400">+{reward} DZE</span>}</button>})}</div><p className="mt-4 text-xs text-slate-500">Rewards are currently local until the secure backend is connected.</p></section><BottomNavigation /></main>
}