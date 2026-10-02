import { useUserStore } from '../../store/userStore'

export default function Header() {
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3 flex-1">

          <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-slate-700" />

          <div>
            <p className="text-white font-semibold text-sm">
              {user.username || 'Player'}
            </p>

            <p className="text-slate-400 text-xs">
              Level {user.level}
            </p>
          </div>

        </div>

        <div className="text-right">
          <div className="bg-slate-800 px-3 py-2 rounded-lg">

            <div className="flex items-center justify-end gap-1">
              <span className="text-yellow-400">⚡</span>

              <p className="text-white font-bold text-sm">
                {Number(user.points ?? 0).toLocaleString()}
              </p>
            </div>

            <p className="text-slate-400 text-xs">
              ${Number(user.usdEquivalent ?? 0).toFixed(2)}
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}
