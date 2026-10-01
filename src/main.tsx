import React from 'react'
import ReactDOM from 'react-dom/client'

function TestApp() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <h1>🎮 CoinGameDz</h1>
      <p>اللعبة تعمل بنجاح ✅</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
)
