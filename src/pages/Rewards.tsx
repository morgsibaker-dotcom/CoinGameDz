import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import RewardCard from '../components/rewards/RewardCard'
import Card from '../components/common/Card'
import { Reward } from '../types'
import {
  getActiveRewards,
  getClaimedRewardIds,
  claimReward,
} from '../services/rewardService'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useUserStore } from '../store/userStore'

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { user, updatePoints } = useUserStore()

  useEffect(() => {
    let mounted = true

    const loadRewards = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setMessage(null)

      try {
        const [rewardData, claimedIds] = await Promise.all([
          getActiveRewards(),
          getClaimedRewardIds(user.id),
        ])

        if (!mounted) return

        const claimedSet = new Set(claimedIds)

        const mappedRewards: Reward[] = rewardData.map(
          (reward) => ({
            id: reward.id,
            title: reward.title,
            description: reward.description,
            icon:
              reward.reward_type === 'welcome'
                ? '🎁'
                : reward.reward_type === 'daily'
                  ? '📅'
                  : reward.reward_type === 'streak'
                    ? '🔥'
                    : reward.reward_type === 'gift'
                      ? '🎉'
                      : '⭐',
            claimed: claimedSet.has(reward.id),
            type: reward.reward_type as Reward['type'],
          })
        )

        setRewards(mappedRewards)
      } catch (error) {
        console.error(
          '[CoinGameDz] Failed to load rewards',
          error
        )

        if (mounted) {
          setMessage('Unable to load rewards.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadRewards()

    return () => {
      mounted = false
    }
  }, [user])

  const handleClaimReward = async (reward: Reward) => {
    if (!user || reward.claimed || claiming) {
      return
    }

    setClaiming(reward.id)
    setMessage(null)

    try {
      const newBalance = await claimReward(
        user.id,
        reward.id
      )

      updatePoints(Number(newBalance))

      setRewards((currentRewards) =>
        currentRewards.map((item) =>
          item.id === reward.id
            ? {
                ...item,
                claimed: true,
                claimDate: new Date(),
              }
            : item
        )
      )

      setMessage('Reward claimed successfully 🎉')
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to claim reward',
        error
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to claim this reward.'
      )
    } finally {
      setClaiming(null)
    }
  }

  const handleSpinWheel = async () => {
    if (!user || spinning) {
      return
    }

    setSpinning(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.rpc(
        'spin_wheel',
        {
          p_user_id: user.id,
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      const result = data as {
        success: boolean
        prize_points: number
        prize_label: string
        new_balance: number
      }

      if (!result?.success) {
        throw new Error('Wheel spin failed.')
      }

      updatePoints(Number(result.new_balance))

      setMessage(
        result.prize_points > 0
          ? `🎉 ${result.prize_label} — +${result.prize_points} points`
          : '😄 Try again tomorrow!'
      )
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to spin wheel',
        error
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'You can spin again after 24 hours.'
      )
    } finally {
      setSpinning(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        <Card>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Rewards
            </h2>

            <p className="text-slate-400 text-sm">
              Collect rewards and achievements
            </p>
          </div>
        </Card>

        {message && (
          <Card>
            <p className="text-sm text-slate-300">
              {message}
            </p>
          </Card>
        )}

        <Card gradient>
          <div className="text-center space-y-4">
            <div className="text-6xl">🎡</div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Wheel of Luck
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Spin once every 24 hours and win points
              </p>
            </div>

            <button
              type="button"
              onClick={handleSpinWheel}
              disabled={spinning || !user}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {spinning ? 'Spinning...' : '🎡 Spin Now'}
            </button>
          </div>
        </Card>

        {loading ? (
          <Card>
            <p className="text-slate-400 text-sm">
              Loading rewards...
            </p>
          </Card>
        ) : rewards.length === 0 ? (
          <Card>
            <p className="text-slate-400 text-sm">
              No rewards available.
            </p>
          </Card>
        ) : (
          rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onClaim={() =>
                handleClaimReward(reward)
              }
            />
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
