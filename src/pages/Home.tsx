import Header from '../components/common/Header'
import BalanceCard from '../components/home/BalanceCard'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center">
          🎮 CoinGameDz
        </h1>

        <BalanceCard />

        <button className="w-full rounded-2xl bg-green-500 px-8 py-4 text-lg font-bold">
          🎮 العب واربح
        </button>
      </div>
    </div>
  )
}
