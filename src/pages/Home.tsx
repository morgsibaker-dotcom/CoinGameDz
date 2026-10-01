import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useEffect, useState } from 'react'
import { useTelegramStore } from '../store/telegramStore'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import BalanceCard from '../components/home/BalanceCard'
import StatsCard from '../components/home/StatsCard'
import QuickActionButtons from '../components/home/QuickActionButtons'

export default function Home() {
  const { initializeTelegram } = useTelegramStore()
  const { user, loadUser } = useUserStore()

  const [dailyMessage, setDailyMessage] = useState('')
  const [dailyLoading, setDailyLoading] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      await initializeTelegram()
    }

    initialize()
  }, [initializeTelegram])

  useEffect(() => {
    const claimDailyLogin = async () => {
      if (!user?.id || dailyLoading) return

      setDailyLoading(true)

      try {
        const { data, error } = await supabase.rpc(
          'claim_daily_login',
          {
            p_user_id: user.id,
          },
        )

        if (error) {
          console.error(
            '[CoinGameDz] Daily login error:',
            error,
          )
          return
        }

        if (data?.success) {
          setDailyMessage(
            `+${data.points_awarded} points • Streak: ${data.streak_days} day${data.streak_days === 1 ? '' : 's'}`,
          )

          await loadUser()
        } else if (data?.already_claimed) {
          setDailyMessage('')
        }
      } catch (error) {
        console.error(
          '[CoinGameDz] Daily login failed:',
          error,
        )
      } finally {
        setDailyLoading(false)
      }
    }

    claimDailyLogin()
  }, [user?.id, loadUser, dailyLoading])

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {dailyMessage && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-emerald-400">
              Daily Login
            </p>

            <p className="mt-1 text-xs text-emerald-300">
              {dailyMessage}
            </p>
          </div>
        )}

        <BalanceCard />

        <StatsCard />

        <QuickActionButtons />
      </div>

      <BottomNavigation />
    </div>
  )
}
