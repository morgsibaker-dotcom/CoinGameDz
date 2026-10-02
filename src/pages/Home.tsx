import { Coins, Gift, Play, Users, Wallet, Trophy, ChevronRight } from 'lucide-react'
import Header from '../components/common/Header'

const actions = [
  { label: 'Tap & Earn', icon: Coins },
  { label: 'Watch & Earn', icon: Play },
  { label: 'Daily Bonus', icon: Gift },
  { label: 'Referrals', icon: Users },
  { label: 'Top 100', icon: Trophy },
  { label: 'Wallet', icon: Wallet },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />

      <section className="px-4 pt-5">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500/25 via-slate-900 to-indigo-500/20 border border-white/10 p-5 shadow-xl">
          <p className="text-sm text-slate-400">Your balance</p>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">0 <span className="text-lg text-sky-400">DZE</span></h1>
              <p className="mt-1 text-xs text-slate-500">DzCoinEren coins</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
              <p className="text-[11px] text-slate-400">Level</p>
              <p className="font-bold">1</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <button className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 p-5 text-left shadow-lg active:scale-[.99]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/80">Start earning</p>
              <h2 className="mt-1 text-2xl font-black">Tap & Earn</h2>
              <p className="mt-1 text-sm text-white/70">Collect DZE coins and unlock rewards.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4"><Coins className="h-8 w-8" /></div>
          </div>
        </button>
      </section>

      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Earn more</h2>
          <span className="text-xs text-slate-500">Coming next</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ label, icon: Icon }) => (
            <button key={label} className="flex min-h-28 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 text-left active:scale-[.98]">
              <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs text-slate-500">Open <ChevronRight className="inline h-3 w-3" /></p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {['Home', 'Earn', 'Rewards', 'Profile'].map((item, index) => (
            <button key={item} className={`rounded-xl py-2 text-xs ${index === 0 ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500'}`}>
              <span>{item}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  )
}