import {
  Play,
  CheckSquare,
  RotateCcw,
  Gift,
  Users,
  CreditCard,
} from 'lucide-react'

const actions = [
  { icon: Play, label: 'Watch & Earn', color: 'bg-blue-600 hover:bg-blue-700' },
  { icon: CheckSquare, label: 'Tasks', color: 'bg-purple-600 hover:bg-purple-700' },
  { icon: RotateCcw, label: 'Wheel', color: 'bg-orange-600 hover:bg-orange-700' },
  { icon: Gift, label: 'Daily Gift', color: 'bg-pink-600 hover:bg-pink-700' },
  { icon: Users, label: 'Referrals', color: 'bg-green-600 hover:bg-green-700' },
  { icon: CreditCard, label: 'Withdraw', color: 'bg-indigo-600 hover:bg-indigo-700' },
]

export default function QuickActionButtons() {

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, idx) => {
        const Icon = action.icon
        return (
          <button
            key={idx}
            className={`${action.color} text-white rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-colors`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold text-center">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
