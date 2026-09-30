import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import RewardCard from '../components/rewards/RewardCard'
import Card from '../components/common/Card'
import { Reward } from '../types'
import {
  getActiveRewards,
  claimReward,
} from '../services/rewardService'
import { useEffect, useState } from 'react'
import { useUserStore } from '../store/userStore'

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  const { user, updatePoints } = useUserStore()

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await getActiveRewards()

        const mappedRewards: Reward[] = data.map((reward) => ({
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
          claimed: false,
          type: reward.reward_type as Reward['type'],
        }))

        setRewards(mappedRewards)
      } catch (error) {
        console.error(
          '[CoinGameDz] Failed to load rewards',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadRewards()
  }, [])

  const handleClaimReward = async (reward: Reward) => {
    if (!user || claiming) {
      return
    }

    try {
      setClaiming(reward.id)

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
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to claim reward',
        error
      )
    } finally {
      setClaiming(null)
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
              onClaim={() => handleClaimReward(reward)}
            />
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
