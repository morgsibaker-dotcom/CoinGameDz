import Card from '../common/Card'
import { useUserStore } from '../../store/userStore'

export default function StatsCard() {
  const { user } = useUserStore()

  if (!user) return null

  const stats = [
    { label: "Today's Earnings", value: '245', unit: 'pts' },
    { label: 'Level', value: user.level.toString(), unit: '' },
    { label: 'Daily Progress', value: '65%', unit: '' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-2">{stat.label}</p>
            <p className="text-xl font-bold text-white">
              {stat.value}
              <span className="text-xs text-slate-400 ms-1">{stat.unit}</span>
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
