import { useEffect, useState } from 'react'

const standalonePath = './Lendora-standalone.html'

const cardStyle = {
  width: 'min(100%, 420px)',
  borderRadius: '32px',
  padding: '32px 28px',
  background: 'rgba(255, 255, 255, 0.96)',
  boxShadow: '0 25px 60px -20px rgba(15, 23, 42, 0.35)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  color: '#0f172a',
  textAlign: 'left',
}

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0 18px',
  borderRadius: '999px',
  border: 'none',
  background: '#1e3a8a',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.95rem',
  textDecoration: 'none',
}

export default function App() {
  const [status, setStatus] = useState('launching')

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    if (window.__LENDORA_FALLBACK_TIMEOUT__) {
      window.clearTimeout(window.__LENDORA_FALLBACK_TIMEOUT__)
    }

    // Browsers commonly block fetch-based checks for sibling files on file:// URLs.
    // A direct redirect works both for local opens and when the app is served.
    const redirectTimer = window.setTimeout(() => {
      try {
        window.location.replace(standalonePath)
      } catch (error) {
        setStatus('error')
      }
    }, 40)

    return () => {
      window.clearTimeout(redirectTimer)
    }
  }, [])

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <section style={cardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#1d4ed8',
          }}
        >
          Lendora
        </p>
        <h1 style={{ margin: '12px 0 10px', fontSize: '2rem', lineHeight: 1.1 }}>
          {status === 'error' ? 'The launcher could not open the app.' : 'Launching the app...'}
        </h1>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#475569' }}>
          {status === 'error'
            ? 'The standalone experience was not reachable from this page. You can still open it directly from the link below.'
            : 'The React entry is handing off to the full standalone Lendora experience.'}
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href={standalonePath} style={buttonStyle}>
            Open Lendora
          </a>
        </div>
      </section>
    </main>
  )
}
