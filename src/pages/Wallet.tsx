import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'

type WithdrawalConfig = { minimum_points: number; points_per_usd: number; usd_to_dzd: number }

export default function Wallet() {
  const { t } = useTranslation()
  const user = useUserStore(s => s.user)
  const [method, setMethod] = useState('BaridiMob')
  const [address, setAddress] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [config, setConfig] = useState<WithdrawalConfig>({ minimum_points: 10000, points_per_usd: 1000, usd_to_dzd: 130 })
  const balance = Number(user?.points_balance ?? user?.points ?? 0)
  const minimum = config.minimum_points
  const usd = balance / config.points_per_usd
  const dzd = usd * config.usd_to_dzd
  const usdt = usd

  useEffect(() => {
    supabase.rpc('get_public_withdrawal_config').then(({ data }) => {
      const value = data as Partial<WithdrawalConfig> | null
      if (!value) return
      setConfig(current => ({
        minimum_points: Number(value.minimum_points) > 0 ? Number(value.minimum_points) : current.minimum_points,
        points_per_usd: Number(value.points_per_usd) > 0 ? Number(value.points_per_usd) : current.points_per_usd,
        usd_to_dzd: Number(value.usd_to_dzd) > 0 ? Number(value.usd_to_dzd) : current.usd_to_dzd,
      }))
    })
  }, [])

  const request = async () => {
    if (!address.trim() || balance < minimum || busy) return
    setBusy(true); setError('')
    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke('create-withdrawal', { body: { method, destination: address.trim() } })
      if (invokeError) throw new Error(invokeError.message)
      if (!result?.success) throw new Error(result?.error || 'Request failed')
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally { setBusy(false) }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('wallet.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('wallet.title')}</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">{t('wallet.balance')}</p>
          <p className="mt-1 text-4xl font-black">{balance.toLocaleString()} <span className="text-lg text-sky-400">DZE</span></p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">USD</p><p className="font-bold">{usd.toFixed(2)} USD</p></div>
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">DZD</p><p className="font-bold">{dzd.toFixed(2)} DZD</p></div>
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">USDT TON</p><p className="font-bold">{usdt.toFixed(6)}</p></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{t('wallet.minimum', { amount: config.minimum_points.toLocaleString() })}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {['BaridiMob', 'USDT TON'].map(option => (
              <button key={option} type="button" onClick={() => setMethod(option)} className={method === option ? 'rounded-xl p-3 text-sm font-bold bg-sky-500 text-slate-950' : 'rounded-xl p-3 text-sm font-bold bg-slate-950 text-slate-300'}>{option}</button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">{method === 'BaridiMob' ? 'Payout: ' + dzd.toFixed(2) + ' DZD' : 'Payout: ' + usdt.toFixed(6) + ' USDT'}</p>
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder={method === 'BaridiMob' ? t('wallet.baridi') : t('wallet.ton')} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 p-3 outline-none" />
          <button type="button" onClick={request} disabled={sent || busy || balance < minimum} className="mt-3 w-full rounded-2xl bg-sky-500 py-3 font-bold text-slate-950 disabled:opacity-50">{sent ? t('wallet.submitted') : busy ? t('wallet.submitting') : t('wallet.request')}</button>
          <p className="mt-3 text-center text-xs text-slate-500">{error || (sent ? t('wallet.pending') : t('wallet.withdrawalsNote'))}</p>
        </div>
      </section>
      <BottomNavigation />
    </main>
  )
}
