import { useUserStore } from '../../store/userStore'

export default function Header() {
  const user = useUserStore((state) => state.user)

  return (
    <div
      style={{
        background: '#1e293b',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h2>🎮 CoinGameDz</h2>

      <p>
        {user?.username || 'Player'}
      </p>

      <p>
        Level {user?.level ?? 1}
      </p>

      <p>
        Points: {user?.points ?? 0}
      </p>
    </div>
  )
}
