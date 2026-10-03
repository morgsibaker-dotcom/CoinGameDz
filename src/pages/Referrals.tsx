import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { getReferralStats } from '../services/userService'
import { useUserStore } from '../store/userStore'

export default function Referrals() {
  const { t } = useTranslation()
  const user = useUserStore(s => s.user)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ referral_count: user?.referralCount ?? 0, referral_earnings: 0 })

  useEffect(() => {
    void getReferralStats()
      .then(setStats)
      .catch(error => console.error('[DzCoinEren] Referral stats failed:', error))
  }, [])

  const code = user?.referralCode || 'REF-XXXXXX'
  const botUsername = 'CoinGameDz_Bot'
  const invite = typeof window !== 'undefined'
    ? 'https://t.me/' + botUsername + '?startapp=ref_' + code
    : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invite)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('referrals.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('referrals.title')}</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">{t('referrals.code')}</p>
          <div className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 font-bold tracking-wider">{code}</div>
          <button type="button" onClick={copy} className="mt-3 w-full rounded-2xl bg-sky-500 px-4 py-3 font-bold text-slate-950">{copied ? t('referrals.copied') : t('referrals.copy')}</button>
          <div className="mt-4 break-all rounded-2xl bg-slate-950 p-3 text-xs text-slate-500">{invite}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-slate-950 p-3"><p className="text-xl font-black">{stats.referral_count.toLocaleString()}</p><p className="text-xs text-slate-500">{t('referrals.invited')}</p></div>
            <div className="rounded-2xl bg-slate-950 p-3"><p className="text-xl font-black">{stats.referral_earnings.toLocaleString()}</p><p className="text-xs text-slate-500">{t('referrals.earned')}</p></div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">{t('referrals.note')}</p>
        </div>
      </section>
      <BottomNavigation />
    </main>
  )
}
