import { useEffect, useState } from 'react'
import { Gift, Check, Trophy } from 'lucide-react'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { awardPoints } from '../services/earnService'
import { supabase } from '../lib/supabase'

type Leader = {
  user_id: string
  rank: number
  display_name: string
  points_balance: number
  level: number
}

export default function Rewards() {
  const [claimed, setClaimed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [leaders, setLeaders] = useState<Leader[]>([])

  const claim = async () => {
    if (claimed || busy) return
    setBusy(true)
    try {
      await awardPoints('daily_checkin')
      setClaimed(true)
    } catch {
      // Keep the button available if the server rejects the claim.
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    supabase
      .rpc('get_top_users', { p_limit: 100 })
      .then(({ data }) => setLeaders((data ?? []) as Leader[]))
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />

      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Rewards</p>
        <h1 className="mt-2 text-3xl font-black">Daily Reward</h1>
        <p className="mt-2 text-sm text-slate-400">Claim once per day.</p>

        <button
          onClick={claim}
          disabled={claimed || busy}
          className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-5 disabled:opacity-60"
        >
          <span className="flex items-center gap-3">
            <Gift className="text-sky-400" />
            <span>
              <b>Daily check-in</b>
              <small className="block text-slate-500 mt-1">+50 DZE</small>
            </span>
          </span>

          {claimed ? (
            <Check className="text-emerald-400" />
          ) : (
            <span className="font-bold text-sky-400">
              {busy ? 'Saving…' : 'Claim'}
            </span>
          )}
        </button>

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="text-amber-400" />
            <h2 className="text-xl font-bold">Top 100</h2>
          </div>

          <div className="space-y-2">
            {leaders.map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-3"
              >
                <span>
                  <b>
                    #{u.rank} {u.display_name}
                  </b>
                  <small className="ml-2 text-slate-500">Lv.{u.level}</small>
                </span>
                <strong className="text-sky-400">
                  {Number(u.points_balance).toLocaleString()} DZE
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
