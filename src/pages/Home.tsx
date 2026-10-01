import Header from '../components/common/Header'
import BalanceCard from '../components/home/BalanceCard'
import StatsCard from '../components/home/StatsCard'
import QuickActionButtons from '../components/home/QuickActionButtons'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center">
          🎮 CoinGameDz
        </h1>

        <BalanceCard />

        <StatsCard />

        <QuickActionButtons />
      </div>
    </div>
  )
}
