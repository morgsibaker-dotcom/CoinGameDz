import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { Copy, Users, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function Referrals() {
  const { user } = useUserStore()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const referrals = user.referralCount
  const rewardsEarned = Math.floor(referrals / 10) * 100

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to copy referral code',
        error
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Referrals
            </h2>

            <p className="text-slate-400 text-sm">
              Invite friends and earn rewards
            </p>
          </div>
        </Card>

        <Card gradient>
          <div className="space-y-3">
            <h3 className="font-semibold text-white">
              Your Referral Code
            </h3>

            <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg">
              <code className="flex-1 text-blue-400 font-mono text-sm">
                {user.referralCode}
              </code>

              <Button
                size="sm"
                variant="secondary"
                onClick={copyToClipboard}
                icon={<Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />

              <p className="text-slate-400 text-xs mb-1">
                Total Referrals
              </p>

              <p className="text-2xl font-bold text-white">
                {referrals}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />

              <p className="text-slate-400 text-xs mb-1">
                Referral Rewards
              </p>

              <p className="text-2xl font-bold text-green-400">
                {rewardsEarned.toLocaleString()} pts
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold text-white">
              How it works
            </h3>

            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">1</span>
                <span>
                  Share your referral code with friends
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2</span>
                <span>
                  They register using your referral link
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">3</span>
                <span>
                  Every 10 successful referrals gives you 100 points
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}
