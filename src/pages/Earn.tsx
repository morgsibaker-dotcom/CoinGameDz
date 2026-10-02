import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

export default function Earn() {
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Earn</p><h1 className="mt-2 text-3xl font-black">Earn DZE</h1><p className="mt-2 text-sm text-slate-400">Complete activities and collect virtual coins.</p><div className="mt-6 space-y-3">{['Daily check-in','Watch a rewarded ad','Complete a task','Keep your streak'].map((x,i)=><button key={x} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left"><span className="font-semibold">{x}</span><span className="font-bold text-sky-400">+{[50,100,250,75][i]} DZE</span></button>)}</div></section><BottomNavigation /></main>
}