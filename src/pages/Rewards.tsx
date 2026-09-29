import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import RewardCard from '../components/rewards/RewardCard'
import Card from '../components/common/Card'
import { Reward } from '../types'

const mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Daily Login',
    description: 'Login daily to earn bonus',
    icon: '📅',
    claimed: true,
    claimDate: new Date(),
    type: 'daily',
  },
  {
    id: '2',
    title: '7-Day Streak',
    description: 'Login 7 days in a row',
    icon: '🔥',
    claimed: false,
    type: 'streak',
  },
  {
    id: '3',
    title: 'Welcome Bonus',
    description: 'Get your welcome reward',
    icon: '🎁',
    claimed: true,
    claimDate: new Date('2024-01-15'),
    type: 'welcome',
  },
  {
    id: '4',
    title: 'Mystery Gift',
    description: 'Unlock a surprise reward',
    icon: '🎉',
    claimed: false,
    type: 'gift',
  },
  {
    id: '5',
    title: 'Power User',
    description: 'Earn 10,000 points achievement',
    icon: '⭐',
    claimed: true,
    claimDate: new Date('2024-02-20'),
    type: 'achievement',
  },
]

export default function Rewards() {
  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        <Card>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Rewards</h2>
            <p className="text-slate-400 text-sm">
              Collect rewards and achievements
            </p>
          </div>
        </Card>

        {mockRewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
      <BottomNavigation />
    </div>
  )
}
