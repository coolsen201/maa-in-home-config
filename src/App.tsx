import { useState } from 'react'
import { MergedDesign } from './components/mockups/maahome/MergedDesign'

function App() {
  const [isAuthed, setIsAuthed] = useState(() => {
    return sessionStorage.getItem('ccc_pin_authed') === '1'
  })
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleUnlock = () => {
    if (pin === 'maain2025') {
      sessionStorage.setItem('ccc_pin_authed', '1')
      setIsAuthed(true)
      setError(false)
    } else {
      setError(true)
      setPin('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  if (isAuthed) {
    return <MergedDesign />
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0d1e',
        backgroundImage: 'radial-gradient(circle at center, #1a1a3a 0%, #0d0d1e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '360px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #FFB800 0%, #D99100 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(217, 145, 0, 0.3)',
            }}
          >
            M
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
              MaainHome CCC
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#FFB800',
                fontWeight: 600,
              }}
            >
              Admin Access
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Enter Credentials PIN
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#FFFFFF',
              fontSize: '1rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              fontFamily: 'monospace',
              letterSpacing: '0.3em',
            }}
          />
          {error && (
            <p
              style={{
                margin: '4px 0 0 0',
                color: '#FF6B6B',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              Incorrect PIN. Please try again.
            </p>
          )}
        </div>

        <button
          onClick={handleUnlock}
          style={{
            background: 'linear-gradient(135deg, #FFB800 0%, #D99100 100%)',
            color: '#000000',
            fontWeight: 700,
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 145, 0, 0.2)',
            transition: 'transform 0.1s, opacity 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Unlock Dashboard
        </button>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.65rem',
            color: 'rgba(255, 255, 255, 0.25)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          MaainHome v2.2.0 (React CCC)
        </p>
      </div>
    </div>
  )
}

export default App
