import Card from '../common/Card'
import Button from '../common/Button'
import { CheckCircle, Play } from 'lucide-react'
import { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onComplete?: () => void
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">{task.title}</h3>
            {task.completed && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <p className="text-slate-400 text-sm mb-3">{task.description}</p>
          <div className="flex items-center justify-between">
            <span className="inline-block bg-slate-700 text-blue-300 text-xs px-2 py-1 rounded">
              +{task.reward} pts
            </span>
            <Button
              size="sm"
              variant={task.completed ? 'secondary' : 'success'}
              disabled={task.completed}
              onClick={onComplete}
              icon={!task.completed ? <Play className="w-4 h-4" /> : undefined}
            >
              {task.completed ? 'Completed' : 'Start'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
