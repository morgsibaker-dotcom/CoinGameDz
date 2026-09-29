import Card from '../common/Card'
import { CheckCircle, Lock } from 'lucide-react'
import { Reward } from '../../types'

interface RewardCardProps {
  reward: Reward
  onClaim?: () => void
}

export default function RewardCard({ reward, onClaim }: RewardCardProps) {
  const isClaimed = reward.claimed

  return (
    <Card
      onClick={!isClaimed ? onClaim : undefined}
      className={!isClaimed ? 'hover:bg-slate-700' : ''}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
          {reward.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{reward.title}</h3>
          <p className="text-slate-400 text-sm">{reward.description}</p>
        </div>
        {isClaimed ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <Lock className="w-6 h-6 text-slate-500" />
        )}
      </div>
    </Card>
  )
}
