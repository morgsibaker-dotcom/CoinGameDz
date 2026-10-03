import { useEffect, useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { supabase, supabaseKey } from '../lib/supabase'
import { useUserStore } from '../store/userStore'

type Leader = { user_id: string; rank: number; display_name: string; points_balance: number; level: number }
type WheelPrize = { id: string; label: string; points: number; probability: number; is_active: boolean }
type SpinResult = { success: boolean; prize_id: string; prize_points: number; prize_label: string; new_balance: number }

const wheelColors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e']

export default function Rewards() {
  const { t } = useTranslation()
  const user = useUserStore((s) => s.user)
  const updatePoints = useUserStore((s) => s.updatePoints)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [wheelPrizes, setWheelPrizes] = useState<WheelPrize[]>([])
  const [error, setError] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [spinMessage, setSpinMessage] = useState('')
  const [wheelRotation, setWheelRotation] = useState(0)

  useEffect(() => {
    let mounted = true

    if (!supabaseKey) {
      setError('Supabase browser key is missing from the production build.')
      return () => { mounted = false }
    }

    supabase.rpc('get_top_users', { p_limit: 100 }).then(({ data, error }) => {
      if (!mounted) return
      if (!error) setLeaders((data ?? []) as Leader[])
    })

    supabase
      .from('wheel_prizes')
      .select('id,label,points,probability,is_active')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) {
          console.error('[CoinGameDz] Wheel prizes unavailable:', error.message)
          setError(error.message)
          return
        }
        setWheelPrizes(((data ?? []) as WheelPrize[]).map((item) => ({
          ...item,
          points: Number(item.points),
          probability: Number(item.probability),
        })))
      })

    return () => { mounted = false }
  }, [])

  const wheelTotal = useMemo(
    () => wheelPrizes.reduce((sum, prize) => sum + prize.probability, 0),
    [wheelPrizes]
  )

  const wheelStyle = useMemo(() => {
    if (wheelPrizes.length === 0 || wheelTotal <= 0) {
      return { background: 'conic-gradient(#334155 0deg 360deg)' }
    }
    let start = 0
    const stops: string[] = []
    wheelPrizes.forEach((prize, index) => {
      const end = start + (prize.probability / wheelTotal) * 360
      stops.push(wheelColors[index % wheelColors.length] + ' ' + start + 'deg ' + end + 'deg')
      start = end
    })
    return { background: 'conic-gradient(' + stops.join(', ') + ')' }
  }, [wheelPrizes, wheelTotal])

  const spinWheel = async () => {
    if (!user || spinning) return
    setSpinning(true)
    setError('')
    setSpinMessage('')

    try {
      const { data, error: rpcError } = await supabase.rpc('spin_wheel', { p_user_id: user.id })
      if (rpcError) throw new Error(rpcError.message)

      const result = data as SpinResult
      const prizeIndex = wheelPrizes.findIndex((prize) => prize.id === result.prize_id)

      if (prizeIndex >= 0 && wheelTotal > 0) {
        const before = wheelPrizes.slice(0, prizeIndex).reduce((sum, item) => sum + item.probability, 0)
        const prize = wheelPrizes[prizeIndex]
        const centerAngle = ((before + prize.probability / 2) / wheelTotal) * 360
        setWheelRotation((current) => current + 2160 + (360 - centerAngle))
      }

      updatePoints(Number(result.new_balance))
      setSpinMessage(
        Number(result.prize_points) > 0
          ? t('rewards.wheelWon', {
              label: result.prize_label,
              points: Number(result.prize_points).toLocaleString(),
            })
          : '📦'
      )

      await new Promise((resolve) => window.setTimeout(resolve, 1200))
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
            <div className="mb-5 flex justify-center">
              <div className="relative h-72 w-72 max-w-full">
                <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 text-2xl">▼</div>
                <div
                  className="relative h-full w-full rounded-full border-8 border-slate-800 shadow-2xl transition-transform duration-[1200ms] ease-out"
                  style={{ ...wheelStyle, transform: 'rotate(' + wheelRotation + 'deg)' }}
                >
                  {wheelPrizes.map((prize, index) => {
                    const before = wheelPrizes.slice(0, index).reduce((sum, item) => sum + item.probability, 0)
                    const centerAngle = ((before + prize.probability / 2) / wheelTotal) * 360
                    const radians = (centerAngle - 90) * Math.PI / 180
                    const left = 50 + Math.cos(radians) * 31
                    const top = 50 + Math.sin(radians) * 31

                    return (
                      <span
                        key={prize.id}
                        className="absolute z-10 flex h-9 min-w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 border-white/70 bg-slate-900/90 px-1 text-[10px] font-black text-white shadow-lg"
                        style={{ left: left + '%', top: top + '%' }}
                      >
                        {prize.points > 0 ? prize.points.toLocaleString() : ''}
                      </span>
                    )
                  })}
                  <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-900 bg-white shadow-lg" />
                </div>
              </div>
            </div>

            <h2 className="mt-3 text-xl font-black">{t('rewards.wheelTitle')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('rewards.wheelSubtitle')}</p>

            <button
              type="button"
              onClick={() => void spinWheel()}
              disabled={spinning || !user || wheelPrizes.length === 0}
              className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 font-bold text-white transition active:scale-[.98] disabled:opacity-50"
            >
              {spinning ? t('rewards.wheelSpinning') : t('rewards.wheelSpin')}
            </button>

            {spinMessage && (
              <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-2xl font-semibold text-emerald-300">
                {spinMessage}
              </p>
            )}
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
              <div
                key={leader.user_id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-3"
              >
                <span>
                  <b>#{leader.rank} {leader.display_name}</b>
                  <small className="ml-2 text-slate-500">
                    {t('rewards.level')}{leader.level}
                  </small>
                </span>
                <strong className="text-sky-400">
                  {Number(leader.points_balance).toLocaleString()} DZE
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomNavigation />
    </main>
  )
}
