import { Link, useLocation } from 'react-router-dom'
import { Home, Zap, Gift, Users, Wallet, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSafeAreaInsets } from '../../services/telegramService'
import { useMemo } from 'react'

const navItems = [
  { path: '/', icon: Home, label: 'home' },
  { path: '/earn', icon: Zap, label: 'earn' },
  { path: '/rewards', icon: Gift, label: 'rewards' },
  { path: '/referrals', icon: Users, label: 'referrals' },
  { path: '/wallet', icon: Wallet, label: 'wallet' },
  { path: '/profile', icon: User, label: 'profile' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Get safe area insets for mobile
  const safeArea = useMemo(() => getSafeAreaInsets(), [])
  const paddingBottom = safeArea.bottom > 0 ? safeArea.bottom + 16 : 16

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-2 py-2 ${
        isRTL ? 'rtl' : 'ltr'
      }`}
      style={{
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-400 bg-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t(`nav.${item.label}`)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 hidden sm:block">
                {t(`nav.${item.label}`)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
