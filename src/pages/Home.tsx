import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import BalanceCard from '../components/home/BalanceCard'
import StatsCard from '../components/home/StatsCard'
import QuickActionButtons from '../components/home/QuickActionButtons'
import { useEffect } from 'react'
import { useTelegramStore } from '../store/telegramStore'
import { useUserStore } from '../store/userStore'

export default function Home() {
  const { initializeTelegram } = useTelegramStore()
  const { loadUser } = useUserStore()

  useEffect(() => {
    const initialize = async () => {
      await initializeTelegram()
      await loadUser()
    }

    initialize()
  }, [initializeTelegram, loadUser])

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <BalanceCard />
        <StatsCard />
        <QuickActionButtons />
      </div>

      <BottomNavigation />
    </div>
  )
}
