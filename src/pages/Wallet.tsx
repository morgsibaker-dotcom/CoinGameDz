import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

export default function Wallet() {
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Wallet</p><h1 className="mt-2 text-3xl font-black">Your wallet</h1><div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5"><p className="text-sm text-slate-400">Available balance</p><p className="mt-1 text-4xl font-black">0 <span className="text-lg text-sky-400">DZE</span></p><button className="mt-5 w-full rounded-2xl bg-sky-500 py-3 font-bold text-slate-950">Request withdrawal</button><p className="mt-3 text-center text-xs text-slate-500">BaridiMob and USDT on TON will be connected after backend setup.</p></div></section><BottomNavigation /></main>
}