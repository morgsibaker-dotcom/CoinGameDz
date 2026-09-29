import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { useTelegramStore } from '../store/telegramStore'
import { Calendar, Award, Users, LogOut, Copy } from 'lucide-react'
import { useState } from 'react'

export default function Profile() {
  const { user } = useUserStore()
  const { telegramUser } = useTelegramStore()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  // Use Telegram user ID if available
  const displayUserId = telegramUser?.id || user.id
  const displayName = telegramUser?.username || telegramUser?.first_name || user.username
  const displayAvatar = telegramUser?.photo_url || user.avatar

  const joinDate = user.joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const copyUserId = () => {
    navigator.clipboard.writeText(displayUserId.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile Info */}
        <Card gradient>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-400 text-sm">ID: {displayUserId}</p>
                  <button
                    onClick={copyUserId}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Copy ID"
                  >
                    {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Details */}
        <div className="space-y-3">
          <Card>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-slate-400 text-xs">Join Date</p>
                <p className="text-white font-semibold">{joinDate}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-slate-400 text-xs">Current Level</p>
                <p className="text-white font-semibold">Level {user.level}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-slate-400 text-xs">Referrals</p>
                <p className="text-white font-semibold">{user.referralCount} friends</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <h3 className="font-semibold text-white mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-slate-900 rounded">
              <p className="text-slate-400 text-xs mb-1">Total Points</p>
              <p className="text-lg font-bold text-blue-400">
                {user.points.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-2 bg-slate-900 rounded">
              <p className="text-slate-400 text-xs mb-1">Referral Earnings</p>
              <p className="text-lg font-bold text-green-400">
                {user.referralEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card>
          <h3 className="font-semibold text-white mb-3">Account</h3>
          <div className="space-y-2">
            <Button fullWidth variant="secondary">
              Change Password
            </Button>
            <Button fullWidth variant="secondary">
              Privacy Settings
            </Button>
            <Button fullWidth variant="danger" icon={<LogOut className="w-4 h-4" />}>
              Logout
            </Button>
          </div>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  )
}
