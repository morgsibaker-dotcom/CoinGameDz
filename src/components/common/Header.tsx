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

      <p style={{ marginTop: '10px' }}>
        {user ? `Player: ${user.username}` : 'Player'}
      </p>

      <p style={{ marginTop: '5px' }}>
        Points: {user?.points ?? 0}
      </p>

      <p style={{ marginTop: '5px' }}>
        Level: {user?.level ?? 1}
      </p>
    </div>
  )
}
