import Card from '../common/Card'
import { useUserStore } from '../../store/userStore'
import { TrendingUp } from 'lucide-react'

export default function BalanceCard() {
  const { user } = useUserStore()

  if (!user) return null

  return (
    <Card gradient>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Balance</p>
            <h2 className="text-3xl font-bold text-white mt-1">
              {user.points.toLocaleString()}
            </h2>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400" />
        </div>
        <div className="pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs">USD Value</p>
          <p className="text-lg font-semibold text-green-400 mt-1">
            ${user.usdEquivalent.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  )
}
