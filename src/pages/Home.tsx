import { useState } from 'react'
import { Coins, Gift, Play, Users, Wallet, Trophy, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

export default function Home() {
  const [coins, setCoins] = useState(0)
  const [taps, setTaps] = useState(0)
  const tap = () => { setCoins(v => v + 1); setTaps(v => v + 1) }
  const actions = [
    { label: 'Tap & Earn', icon: Coins, path: '/' }, { label: 'Watch & Earn', icon: Play, path: '/earn' },
    { label: 'Daily Bonus', icon: Gift, path: '/rewards' }, { label: 'Referrals', icon: Users, path: '/referrals' },
    { label: 'Top 100', icon: Trophy, path: '/rewards' }, { label: 'Wallet', icon: Wallet, path: '/wallet' },
  ]
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-5"><div className="rounded-3xl bg-gradient-to-br from-sky-500/25 via-slate-900 to-indigo-500/20 border border-white/10 p-5 shadow-xl"><p className="text-sm text-slate-400">Your balance</p><h1 className="mt-1 text-4xl font-black">{coins} <span className="text-lg text-sky-400">DZE</span></h1><p className="mt-1 text-xs text-slate-500">{taps} taps this session</p></div></section><section className="px-4 pt-4"><button onClick={tap} className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 p-6 text-left shadow-lg active:scale-[.98]"><p className="text-sm font-semibold text-white/80">Tap to earn</p><h2 className="mt-1 text-3xl font-black">+1 DZE</h2><p className="mt-1 text-sm text-white/70">Tap here to collect coins.</p></button></section><section className="px-4 pt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Earn more</h2><span className="text-xs text-slate-500">6 ways</span></div><div className="grid grid-cols-2 gap-3">{actions.map(({label,icon:Icon,path})=><Link key={label} to={path} className="flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 text-left active:scale-[.98]"><div className="rounded-xl bg-sky-500/10 p-3 text-sky-400"><Icon className="h-5 w-5"/></div><div><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">Open <ChevronRight className="inline h-3 w-3"/></p></div></Link>)}</div></section><BottomNavigation /></main>
}