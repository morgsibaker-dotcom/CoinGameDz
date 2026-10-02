import { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'

export default function Wallet() {
  const user = useUserStore(s => s.user)
  const [method, setMethod] = useState('BaridiMob')
  const [address, setAddress] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [minimum, setMinimum] = useState(10000)

  const balance = Number(user?.points_balance ?? 0)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'withdrawal_min_points')
      .maybeSingle()
      .then(({ data }) => {
        const value = Number((data?.value as { value?: number } | null)?.value)
        if (Number.isFinite(value) && value > 0) setMinimum(value)
      })
  }, [])

  const request = async () => {
    if (!address.trim() || balance < minimum || busy) return

    setBusy(true)
    setError('')

    try {
      const { data: result, error: invokeError } =
        await supabase.functions.invoke('create-withdrawal', {
          body: { method, destination: address.trim() },
        })

      if (invokeError) throw new Error(invokeError.message)
      if (!result?.success) throw new Error(result?.error || 'Request failed')

      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />

      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Wallet</p>
        <h1 className="mt-2 text-3xl font-black">Your wallet</h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Available balance</p>
          <p className="mt-1 text-4xl font-black">
            {balance.toLocaleString()} <span className="text-lg text-sky-400">DZE</span>
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Minimum withdrawal: {minimum.toLocaleString()} DZE.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {['BaridiMob', 'USDT TON'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setMethod(option)}
                className={`rounded-xl p-3 text-sm font-bold ${
                  method === option
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={
              method === 'BaridiMob'
                ? 'BaridiMob account / phone'
                : 'TON wallet address'
            }
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 p-3 outline-none"
          />

          <button
            type="button"
            onClick={request}
            disabled={sent || busy || balance < minimum}
            className="mt-3 w-full rounded-2xl bg-sky-500 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            {sent ? 'Request submitted' : busy ? 'Submitting...' : 'Request withdrawal'}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            {error || (sent ? 'Pending admin approval.' : 'Withdrawals require admin approval.')}
          </p>
        </div>
      </section>

      <BottomNavigation />
    </main>
  )
}
