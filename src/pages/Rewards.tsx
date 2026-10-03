import { useEffect, useMemo, useState } from 'react'
import { Package, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { supabase, supabaseKey } from '../lib/supabase'
import { useUserStore } from '../store/userStore'

type Leader = { user_id: string; rank: number; display_name: string; points_balance: number; level: number }
type WheelPrize = { id: string; label: string; points: number; probability: number; is_active: boolean }
type SpinResult = { success: boolean; prize_id: string; prize_points: number; prize_label: string; new_balance: number }

const wheelColors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#14b8a6', '#ec4899']

type VisualPrize = WheelPrize & { displayLabel: string }

const shufflePrizes = (items: WheelPrize[]) => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

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
        const loadedPrizes = ((data ?? []) as WheelPrize[]).map((item) => ({
          ...item,
          points: Number(item.points),
          probability: Number(item.probability),
        }))

        // Keep the wheel visible even if the database currently returns no prize rows.
        // The real spin is still handled by the Supabase spin_wheel RPC.
        if (loadedPrizes.length > 0) {
          setWheelPrizes(shufflePrizes(loadedPrizes))
        } else {
          const fallbackPrizes: WheelPrize[] = [
            ...Array.from({ length: 6 }, (_, index) => ({
              id: 'fallback-15-' + index,
              label: '15 points',
              points: 15,
              probability: 5,
              is_active: true,
            })),
            {
              id: 'fallback-100',
              label: '100 points',
              points: 100,
              probability: 10,
              is_active: true,
            },
            {
              id: 'fallback-500',
              label: '500 points',
              points: 500,
              probability: 3,
              is_active: true,
            },
            {
              id: 'fallback-1000',
              label: '1000 points',
              points: 1000,
              probability: 2,
              is_active: true,
            },
            ...Array.from({ length: 11 }, (_, index) => ({
              id: 'fallback-empty-' + index,
              label: 'Empty box',
              points: 0,
              probability: 5,
              is_active: true,
            })),
          ]
          setWheelPrizes(shufflePrizes(fallbackPrizes))
        }
      })

    return () => { mounted = false }
  }, [])

  const visualPrizes = useMemo<VisualPrize[]>(() => {
    const groups = [
      { points: 0, probability: 0, label: 'فارغ' },
      { points: 15, probability: 0, label: '15 نقطة' },
      { points: 100, probability: 0, label: '100 نقطة' },
      { points: 500, probability: 0, label: '500 نقطة' },
      { points: 1000, probability: 0, label: '1000 نقطة' },
    ]
    wheelPrizes.forEach((prize) => {
      const group = groups.find((item) => item.points === prize.points)
      if (group) group.probability += Number(prize.probability)
    })
    return shufflePrizes(groups.filter((item) => item.probability > 0).map((item, index) => ({
      id: 'visual-' + item.points + '-' + index,
      label: item.label,
      displayLabel: item.label,
      points: item.points,
      probability: item.probability,
      is_active: true,
    })))
  }, [wheelPrizes])

  const wheelTotal = useMemo(
    () => visualPrizes.reduce((sum, prize) => sum + prize.probability, 0),
    [visualPrizes]
  )

  const wheelStyle = useMemo(() => {
    if (visualPrizes.length === 0 || wheelTotal <= 0) {
      return { background: 'conic-gradient(#334155 0deg 360deg)' }
    }
    let start = 0
    const stops: string[] = []
    visualPrizes.forEach((prize, index) => {
      const end = start + (prize.probability / wheelTotal) * 360
      stops.push(wheelColors[index % wheelColors.length] + ' ' + start + 'deg ' + end + 'deg')
      start = end
    })
    return { background: 'conic-gradient(' + stops.join(', ') + ')' }
  }, [visualPrizes, wheelTotal])

  const spinWheel = async () => {
    if (!user || spinning) return
    setSpinning(true)
    setError('')
    setSpinMessage('')

    try {
      const { data, error: rpcError } = await supabase.rpc('spin_wheel', { p_user_id: user.id })
      if (rpcError) throw new Error(rpcError.message)

      const result = data as SpinResult
      const prizeIndex = visualPrizes.findIndex((prize) => prize.points === Number(result.prize_points))

      if (prizeIndex >= 0 && wheelTotal > 0) {
        const before = visualPrizes.slice(0, prizeIndex).reduce((sum, item) => sum + item.probability, 0)
        const prize = visualPrizes[prizeIndex]
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
          : '📦 صندوق فارغ'
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
              <div className="relative h-80 w-80 max-w-full sm:h-[22rem] sm:w-[22rem]">
                <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2">
                  <div className="h-0 w-0 border-l-[13px] border-r-[13px] border-t-[28px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_3px_4px_rgba(0,0,0,.6)]" />
                </div>

                <div
                  className="relative h-full w-full rounded-full border-[10px] border-slate-800 shadow-[0_18px_45px_rgba(0,0,0,.45)] transition-transform duration-[1800ms] ease-out"
                  style={{ ...wheelStyle, transform: 'rotate(' + wheelRotation + 'deg)' }}
                >
                  <div className="absolute inset-1 rounded-full border-2 border-white/25" />

                  {visualPrizes.map((prize, index) => {
                    const before = visualPrizes.slice(0, index).reduce((sum, item) => sum + item.probability, 0)
                    const centerAngle = ((before + prize.probability / 2) / wheelTotal) * 360
                    const radians = (centerAngle - 90) * Math.PI / 180
                    const left = 50 + Math.cos(radians) * 35
                    const top = 50 + Math.sin(radians) * 35

                    return (
                      <div
                        key={prize.id}
                        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
                        style={{ left: left + '%', top: top + '%' }}
                      >
                        <div
                          className={[
                            'flex h-10 w-10 items-center justify-center rounded-xl border-2 shadow-lg backdrop-blur-sm',
                            'h-12 w-12 sm:h-14 sm:w-14',
                            prize.points > 0
                              ? 'border-white/80 bg-slate-950/90 text-amber-300'
                              : 'border-white/50 bg-slate-900/75 text-white/80',
                          ].join(' ')}
                        >
                          <Package className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.2} />
                        </div>
                        <span className="mt-1 rounded-full bg-slate-950/90 px-2 py-1 text-[10px] font-black leading-none text-white shadow-md sm:text-[11px]">
                          {prize.displayLabel} · {prize.probability}%
                        </span>
                      </div>
                    )
                  })}

                  <div className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-slate-950 bg-gradient-to-br from-white to-slate-300 shadow-[0_4px_15px_rgba(0,0,0,.5)]">
                    <div className="h-5 w-5 rounded-full bg-slate-800 shadow-inner" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="mt-3 text-xl font-black">{t('rewards.wheelTitle')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('rewards.wheelSubtitle')}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {visualPrizes.map((prize) => (
                <div key={prize.id} className="rounded-xl border border-white/10 bg-slate-950/70 px-2 py-2 text-center">
                  <Package className="mx-auto h-5 w-5 text-amber-300" />
                  <p className="mt-1 text-[11px] font-bold text-white">{prize.displayLabel}</p>
                  <p className="text-[10px] font-black text-slate-400">{prize.probability}%</p>
                </div>
              ))}
            </div>

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
