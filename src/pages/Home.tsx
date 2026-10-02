import { useState } from 'react'
import { Coins, Gift, Play, Users, Wallet, Trophy, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { awardPoints } from '../services/earnService'
import { useUserStore } from '../store/userStore'

export default function Home() {
  const { t } = useTranslation()
  const user = useUserStore(s => s.user)
  const updatePoints = useUserStore(s => s.updatePoints)
  const [taps, setTaps] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const coins = Number(user?.points ?? 0)
  const tap = async () => {
    if (busy) return
    setBusy(true); setError('')
    try { const result = await awardPoints('tap'); updatePoints(result.points); setTaps(value => value + 1) }
    catch (e) { setError(e instanceof Error ? e.message : t('common.error')) }
    finally { setBusy(false) }
  }

  const actions = [
    { label: t('home.tap'), icon: Coins, path: '/' },
    { label: t('home.watch'), icon: Play, path: '/earn' },
    { label: t('home.daily'), icon: Gift, path: '/rewards' },
    { label: t('home.referrals'), icon: Users, path: '/referrals' },
    { label: t('home.top'), icon: Trophy, path: '/rewards' },
    { label: t('home.wallet'), icon: Wallet, path: '/wallet' },
  ]

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-5"><div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/25 via-slate-900 to-indigo-500/20 p-5 shadow-xl">
        <p className="text-sm text-slate-400">{t('home.balance')}</p>
        <h1 className="mt-1 text-4xl font-black">{coins.toLocaleString()} <span className="text-lg text-sky-400">DZE</span></h1>
        <p className="mt-1 text-xs text-slate-500">{t('home.sessionTaps',{count:taps})}</p>
      </div></section>
      <section className="px-4 pt-4"><button type="button" disabled={busy} onClick={tap} className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 p-6 text-left shadow-lg active:scale-[.98] disabled:opacity-60">
        <p className="text-sm font-semibold text-white/80">{busy ? t('home.tapSaving') : t('home.tapToEarn')}</p>
        <h2 className="mt-1 text-3xl font-black">{t('home.tapReward')}</h2>
        <p className="mt-1 text-sm text-white/70">{error || t('home.secureReward')}</p>
      </button></section>
      <section className="px-4 pt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{t('home.earnMore')}</h2><span className="text-xs text-slate-500">{t('home.ways')}</span></div>
        <div className="grid grid-cols-2 gap-3">{actions.map(({label,icon:Icon,path}) => <Link key={label} to={path} className="flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 text-left active:scale-[.98]"><div className="rounded-xl bg-sky-500/10 p-3 text-sky-400"><Icon className="h-5 w-5" /></div><div><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{t('home.open')} <ChevronRight className="inline h-3 w-3" /></p></div></Link>)}</div>
      </section><BottomNavigation /></main>
  )
}