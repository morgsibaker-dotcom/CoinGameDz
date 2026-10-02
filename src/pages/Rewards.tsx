import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

export default function Rewards() {
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Rewards</p><h1 className="mt-2 text-3xl font-black">Rewards</h1><p className="mt-2 text-sm text-slate-400">Weekly, milestone and leaderboard rewards.</p><div className="mt-6 grid gap-3">{['Weekly reward','Top 100 reward','Milestone reward'].map(x=><div key={x} className="rounded-2xl border border-white/10 bg-slate-900 p-5"><p className="font-bold">{x}</p><p className="mt-2 text-xs text-slate-500">Coming soon — configurable by admin.</p></div>)}</div></section><BottomNavigation /></main>
}