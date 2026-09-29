import { Coins } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Coins className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">CoinGameDz</h1>
        <p className="text-xl text-primary-100 mb-8">
          Professional Telegram Mini App Rewards Platform
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-gray-700 mb-4">
            Welcome to CoinGameDz! Your rewards platform is ready.
          </p>
          <p className="text-sm text-gray-500">
            Foundation v0.1.0
          </p>
        </div>
      </div>
    </div>
  )
}