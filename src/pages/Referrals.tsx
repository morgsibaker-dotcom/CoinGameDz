import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { Copy, Users, TrendingUp, Share2 } from 'lucide-react'
import { useState } from 'react'

const BOT_USERNAME = 'CoinGameDz_Bot'

export default function Referrals() {
  const { user } = useUserStore()
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  if (!user) return null

  const referrals = user.referralCount
  const rewardsEarned =
    Math.floor(referrals / 10) * 100

  const referralCode = user.referralCode

  const referralLink = referralCode
    ? `https://t.me/${BOT_USERNAME}?startapp=ref_${encodeURIComponent(
        referralCode
      )}`
    : ''

  const copyToClipboard = async () => {
    if (!referralLink) return

    try {
      await navigator.clipboard.writeText(
        referralLink
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to copy referral link',
        error
      )
    }
  }

  const shareReferral = () => {
    if (!referralLink) return

    const text =
      'Join CoinGameDz and earn points with me! 🎮💰'

    const shareUrl =
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodeURIComponent(text)}`

    window.open(shareUrl, '_blank')

    setShared(true)

    setTimeout(() => {
      setShared(false)
    }, 2000)
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
              <code className="flex-1 text-blue-400 font-mono text-sm break-all">
                {referralCode || 'Generating...'}
              </code>

              <Button
                size="sm"
                variant="secondary"
                onClick={copyToClipboard}
                icon={<Copy className="w-4 h-4" />}
                disabled={!referralCode}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <Button
              className="w-full"
              onClick={shareReferral}
              icon={<Share2 className="w-4 h-4" />}
              disabled={!referralCode}
            >
              {shared ? 'Shared ✓' : 'Share Referral Link'}
            </Button>
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
                  Share your referral link with friends
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2</span>
                <span>
                  Your friend opens CoinGameDz using your link
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
