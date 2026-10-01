import Header from '../components/common/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">
          🎮 CoinGameDz
        </h1>

        <p className="mt-4 text-green-400">
          الواجهة تعمل بنجاح ✅
        </p>

        <button className="mt-8 rounded-2xl bg-green-500 px-8 py-4 text-lg font-bold">
          🎮 العب واربح
        </button>
      </div>
    </div>
  )
}
