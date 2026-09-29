import { useUserStore } from '../../store/userStore'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'

export default function Header() {
  const { user } = useUserStore()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!user) return null

  return (
    <div className={`bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-12 h-12 rounded-full border-2 border-blue-500"
          />
          <div>
            <p className="text-white font-semibold text-sm">{user.username}</p>
            <p className="text-slate-400 text-xs">
              Level {user.level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 bg-slate-800 px-3 py-2 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-white font-bold text-sm">{user.points.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">${user.usdEquivalent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
