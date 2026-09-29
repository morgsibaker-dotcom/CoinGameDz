import Card from '../common/Card'
import Button from '../common/Button'
import { Play } from 'lucide-react'

interface AdCardProps {
  title: string
  description: string
  reward: number
  onWatch?: () => void
  watched?: boolean
}

export default function AdCard({
  title,
  description,
  reward,
  onWatch,
  watched = false,
}: AdCardProps) {
  return (
    <Card gradient>
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-slate-400 text-sm mt-1">{description}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <span className="text-lg font-bold text-yellow-400">+{reward} pts</span>
          <Button
            size="sm"
            variant={watched ? 'secondary' : 'primary'}
            disabled={watched}
            onClick={onWatch}
            icon={!watched ? <Play className="w-4 h-4" /> : undefined}
          >
            {watched ? 'Watched' : 'Watch'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
