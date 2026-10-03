import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'

type Leader = { user_id: string; rank: number; display_name: string; points_balance: number; level: number }
type SpinResult = { success: boolean; prize_points: number; prize_label: string; new_balance: number }

export default function Rewards() {
  const { t } = useTranslation()
  const user = useUserStore((s) => s.user)
  const updatePoints = useUserStore((s) => s.updatePoints)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [error, setError] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [spinMessage, setSpinMessage] = useState('')

  useEffect(() => {
    let mounted = true
    supabase.rpc('get_top_users', { p_limit: 100 }).then(({ data, error }) => {
      if (!mounted) return
      if (error) { setError(error.message); return }
      setLeaders((data ?? []) as Leader[])
    })
    return () => { mounted = false }
  }, [])

  const spinWheel = async () => {
    if (!user || spinning) return
    setSpinning(true); setError(''); setSpinMessage('')
    try {
      const { data, error: rpcError } = await supabase.rpc('spin_wheel', { p_user_id: user.id })
      if (rpcError) throw new Error(rpcError.message)
      const result = data as SpinResult
      updatePoints(Number(result.new_balance))
      setSpinMessage(t('rewards.wheelWon', {
        label: result.prize_label,
        points: Number(result.prize_points).toLocaleString(),
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setSpinning(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('rewards.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('rewards.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('rewards.subtitle')}</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="font-bold">{t('rewards.checkin')}</p>
          <p className="mt-1 text-sm text-slate-400">{t('rewards.dailyInEarn')}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-slate-900 to-indigo-500/10 p-5">
          <div className="text-center">
            <div className="text-5xl">🎡</div>
            <h2 className="mt-3 text-xl font-black">{t('rewards.wheelTitle')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('rewards.wheelSubtitle')}</p>
            <button type="button" onClick={() => void spinWheel()} disabled={spinning || !user}
              className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 font-bold text-white transition active:scale-[.98] disabled:opacity-50">
              {spinning ? t('rewards.wheelSpinning') : t('rewards.wheelSpin')}
            </button>
            {spinMessage && <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-300">{spinMessage}</p>}
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="text-amber-400" />
            <h2 className="text-xl font-bold">{t('rewards.top')}</h2>
          </div>
          <div className="space-y-2">
            {leaders.map((leader) => (
              <div key={leader.user_id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-3">
                <span><b>#{leader.rank} {leader.display_name}</b><small className="ml-2 text-slate-500">{t('rewards.level')}{leader.level}</small></span>
                <strong className="text-sky-400">{Number(leader.points_balance).toLocaleString()} DZE</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <BottomNavigation />
    </main>
  )
}
