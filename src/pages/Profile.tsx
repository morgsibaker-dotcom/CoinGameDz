import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'

export default function Profile() {
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header /><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Profile</p><h1 className="mt-2 text-3xl font-black">Profile</h1><div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5"><p className="font-bold">Telegram user</p><p className="mt-1 text-xs text-slate-500">Account connection will be added securely.</p></div></section><BottomNavigation /></main>
}