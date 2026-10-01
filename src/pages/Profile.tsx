import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import { useUserStore } from '../store/userStore'
import { useTelegramStore } from '../store/telegramStore'
import {
  Calendar,
  Award,
  Users,
  Copy,
  CheckCircle,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

export default function Profile() {
  const { user } = useUserStore()
  const { telegramUser } = useTelegramStore()

  const [copied, setCopied] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    )
  }

  const displayUserId = telegramUser?.id || user.id

  const displayName =
    telegramUser?.username
      ? `@${telegramUser.username}`
      : telegramUser?.first_name ||
        user.username ||
        'Player'

  const displayAvatar =
    telegramUser?.photo_url ||
    user.avatar ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=coingamedz'

  const joinDate = user.joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(displayUserId.toString())
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to copy Telegram ID',
        error,
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* Profile Header */}
        <Card gradient>
          <div className="flex items-center gap-4">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
            />

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">
                {displayName}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <p className="text-slate-400 text-sm">
                  Telegram ID: {displayUserId}
                </p>

                <button
                  onClick={copyUserId}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Copy Telegram ID"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {telegramUser?.is_premium && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Telegram Premium
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Details */}
        <div className="space-y-3">

          <Card>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />

              <div>
                <p className="text-slate-400 text-xs">
                  Join Date
                </p>

                <p className="text-white font-semibold">
                  {joinDate}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-400" />

              <div>
                <p className="text-slate-400 text-xs">
                  Current Level
                </p>

                <p className="text-white font-semibold">
                  Level {user.level}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />

              <div>
                <p className="text-slate-400 text-xs">
                  Successful Referrals
                </p>

                <p className="text-white font-semibold">
                  {user.referralCount} friends
                </p>
              </div>
            </div>
          </Card>

        </div>

        {/* Balance */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-blue-400" />

            <h3 className="font-semibold text-white">
              Balance
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">
                Points
              </p>

              <p className="text-xl font-bold text-blue-400">
                {user.points.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">
                USD Value
              </p>

              <p className="text-xl font-bold text-green-400">
                ${user.usdEquivalent.toFixed(2)}
              </p>
            </div>

          </div>
        </Card>

        {/* Statistics */}
        <Card>
          <h3 className="font-semibold text-white mb-3">
            Statistics
          </h3>

          <div className="grid grid-cols-2 gap-3">

            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">
                Total Points
              </p>

              <p className="text-lg font-bold text-blue-400">
                {user.points.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">
                Referral Earnings
              </p>

              <p className="text-lg font-bold text-green-400">
                {user.referralEarnings.toLocaleString()}
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Points earned from referrals
              </p>
            </div>

          </div>
        </Card>

        {/* Referral Progress */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">
              Referral Progress
            </h3>

            <span className="text-sm text-blue-400">
              {user.referralCount % 10}/10
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{
                width: `${(user.referralCount % 10) * 10}%`,
              }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Every 10 successful referrals = 100 points
          </p>
        </Card>

      </div>

      <BottomNavigation />
    </div>
  )
}
