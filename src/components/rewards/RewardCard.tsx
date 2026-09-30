import Card from '../common/Card'
import { CheckCircle } from 'lucide-react'
import { Reward } from '../../types'

interface RewardCardProps {
  reward: Reward
  onClaim?: () => void
}

export default function RewardCard({
  reward,
  onClaim,
}: RewardCardProps) {
  const isClaimed = reward.claimed

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
          {reward.icon}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white">
            {reward.title}
          </h3>

          <p className="text-slate-400 text-sm">
            {reward.description}
          </p>
        </div>

        {isClaimed ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <button
            type="button"
            onClick={onClaim}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-3 py-2 rounded-lg"
          >
            Claim
          </button>
        )}
      </div>
    </Card>
  )
}
