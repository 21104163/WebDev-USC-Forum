
import './App.css'
import './auth/loginSignup.css'
import { useState, useEffect } from 'react'
const API_BASE = import.meta.env.VITE_API_URL || '/api'
import LandingPage from './landingPage.jsx'
import Login from './auth/Login'
import SignupFlow from './auth/SignupFlow'
import ForgotPassword from './auth/ForgotPassword'

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login') // 'login' | 'signup' | 'forgot' | 'landing'
  const [checkingAuth, setCheckingAuth] = useState(true)

  // On mount, verify stored token by calling server `/api/auth/me`.
  // If token is valid, set the returned user; otherwise clear storage and remain on login.
  useEffect(() => {
    async function restore() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 401 || res.status === 403) {
          // token invalid/expired — clear and stay on login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setView('login')
          setCheckingAuth(false)
          return
        }

        // for other non-OK responses (5xx/network), keep optimistic state
        if (!res.ok) {
          console.warn('Non-auth OK response from /auth/me; keeping stored user for now', res.status)
          const stored = localStorage.getItem('user')
          if (stored) {
            setUser(JSON.parse(stored))
            setView('landing')
          }
          return
        }

        const data = await res.json()
        // server returns id/email/email_verified; merge with any stored profile
        let stored = null
        try { stored = JSON.parse(localStorage.getItem('user')) } catch(e) { stored = null }
        const merged = { ...(stored || {}), id: data.id, email: data.email, email_verified: data.email_verified }
        localStorage.setItem('user', JSON.stringify(merged))
        setUser(merged)
        setView('landing')
        setCheckingAuth(false)
      } catch (e) {
        // network error — keep optimistic state (don't clear token immediately)
        console.warn('Network error while verifying token on startup; will keep stored user for now', e)
        const stored = localStorage.getItem('user')
        if (stored) {
          setUser(JSON.parse(stored))
          setView('landing')
        }
        setCheckingAuth(false)
      }
    }
    restore()
  }, [])

  function handleLogin(u) {
    setUser(u)
    setView('landing')
  }

  function handleSignupSuccess(u) {
    setUser(u)
    setView('landing')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setView('login')
  }

  if (checkingAuth) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div className="auth-spinner" aria-label="Loading">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  if (view === 'login') {
    return <Login onLogin={handleLogin} onShowSignup={() => setView('signup')} onShowForgot={() => setView('forgot')} />
  }

  if (view === 'signup') {
    return <SignupFlow onSignupSuccess={handleSignupSuccess} onCancel={() => setView('login')} />
  }

  if (view === 'forgot') {
    return <ForgotPassword onDone={() => setView('login')} onCancel={() => setView('login')} />
  }

  return <LandingPage user={user} onLogout={handleLogout} />
}

export default App;
