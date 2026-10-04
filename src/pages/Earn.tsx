import { useEffect, useState } from 'react'
import { Check, Play, Gift, ListChecks, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { awardPoints } from '../services/earnService'
import { completeTask, getActiveTasks, Task } from '../services/taskService'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import { getTelegramWebApp } from '../services/telegramService'

declare global {
  interface Window {
    Adsgram?: {
      init: (options: { blockId: string }) => {
        show: () => Promise<{ done?: boolean }>
      }
    }
  }
}

export default function Earn() {
  const { t } = useTranslation()
  const updatePoints = useUserStore(s => s.updatePoints)
  const [claimed, setClaimed] = useState<string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [blockId, setBlockId] = useState('')
  const [adReward, setAdReward] = useState(100)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState('')
  const [adReady, setAdReady] = useState(false)

  const loadTasks = async () => {
    try {
      setTasks(await getActiveTasks())
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  useEffect(() => {
    void loadTasks()
    let timer: number | undefined
    const checkAdsgram = () => {
      if (window.Adsgram) {
        setAdReady(true)
        if (timer) window.clearInterval(timer)
      }
    }
    checkAdsgram()
    timer = window.setInterval(checkAdsgram, 500)
    supabase.rpc('get_public_ad_config').then(({ data }) => {
      if (!data) return
      setBlockId(String(data.placement ?? ''))
      const reward = Number(data.reward_points)
      if (Number.isFinite(reward) && reward > 0) setAdReward(reward)
    })
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [])

  const claimDaily = async () => {
    if (busy) return
    setBusy('daily')
    setError('')
    try {
      const { data, error } = await supabase.rpc('claim_daily_login')
      if (error) throw new Error(error.message)
      if (!data?.success) throw new Error(data?.error ?? 'Daily bonus failed')
      updatePoints(Number(data.points_balance ?? 0))
      setClaimed(v => [...v, 'daily'])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  const watchAd = async () => {
    if (busy || !blockId || !adReady || !window.Adsgram) return
    setBusy('ad')
    setError('')
    try {
      const result = await window.Adsgram.init({ blockId }).show()
      if (result?.done === false) throw new Error(t('earn.adNotCompleted'))
      const reward = await awardPoints('ad', {
        provider_event_id: crypto.randomUUID(),
        provider: 'AdsGram',
      })
      updatePoints(reward.points)
      setClaimed(v => [...v, 'ad-' + reward.points])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('earn.adUnavailable'))
    } finally {
      setBusy(null)
    }
  }

  const claimTask = async (task: Task) => {
    if (busy || task.completed || claimed.includes(task.id)) return
    setBusy(task.id)
    setError('')
    try {
      const result = await completeTask(task.id)
      updatePoints(result.pointsBalance)
      setTasks(items => items.map(item =>
        item.id === task.id
          ? {
              ...item,
              completion_count: item.completion_count + 1,
              completed:
                item.max_completions_per_user !== null &&
                item.completion_count + 1 >= item.max_completions_per_user,
            }
          : item,
      ))
      setClaimed(v => [...v, task.id])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('earn.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('earn.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('earn.subtitle')}</p>

        <div className="mt-6 space-y-3">
          <button type="button" disabled={busy !== null || claimed.includes('daily')} onClick={claimDaily}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left disabled:opacity-60">
            <span className="flex items-center gap-3"><Gift className="h-5 w-5 text-sky-400" /><span><b>{t('earn.daily')}</b><small className="mt-1 block text-slate-500">{t('earn.dailyReward')}</small></span></span>
            {claimed.includes('daily') ? <Check className="h-5 w-5 text-emerald-400" /> : <span className="font-bold text-sky-400">{busy === 'daily' ? '…' : '+50 DZD'}</span>}
          </button>

          <button type="button" disabled={busy !== null || !blockId || !adReady} onClick={watchAd}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left disabled:opacity-60">
            <span className="flex items-center gap-3"><Play className="h-5 w-5 text-sky-400" /><span><b>{t('earn.ad')}</b><small className="mt-1 block text-slate-500">{!blockId ? t('earn.notConfigured') : !adReady ? t('earn.adUnavailable') : t('earn.rewardedAd')}</small></span></span>
            <span className="font-bold text-sky-400">{busy === 'ad' ? '…' : '+' + adReward + ' DZD'}</span>
          </button>

          <div className="pt-3">
            <div className="mb-3 flex items-center gap-2"><ListChecks className="h-5 w-5 text-sky-400" /><h2 className="text-xl font-bold">{t('earn.tasks')}</h2></div>
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-sm text-slate-500">{t('earn.noTasks')}</div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-3"><div><b>{task.title}</b><p className="mt-1 text-sm text-slate-400">{task.description}</p></div><span className="whitespace-nowrap font-bold text-sky-400">+{task.reward_points} DZD</span></div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500"><span>{task.max_completions_per_user === null ? 'Unlimited completions' : `${task.completion_count}/${task.max_completions_per_user}`}</span></div>
                    <button type="button" disabled={task.completed || busy !== null} onClick={() => claimTask(task)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 p-3 font-bold text-slate-950 disabled:opacity-50">
                      {task.completed ? <><Check className="h-4 w-4" />{t('earn.completed')}</> : <>{t('earn.complete')}<ExternalLink className="h-4 w-4" /></>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      </section>
      <BottomNavigation />
    </main>
  )
}
