import { useUserStore } from '../../store/userStore'

export default function Header() {
  const { user } = useUserStore()

  const name = user?.username || 'Player'
  const points = user?.points ?? 0
  const level = user?.level ?? 1

  return (
    <div
      style={{
        background: '#1e293b',
        color: 'white',
        padding: '20px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <h2>🎮 CoinGameDz</h2>

        <p style={{ marginTop: '10px' }}>
          {name}
        </p>

        <p style={{ marginTop: '5px' }}>
          ⭐ {points.toLocaleString()} Points
        </p>

        <p style={{ marginTop: '5px' }}>
          Level {level}
        </p>
      </div>
    </div>
  )
}
