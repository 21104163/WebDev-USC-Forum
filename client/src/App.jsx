
import './App.css'
import './auth/loginSignup.css'
import { useState, useEffect } from 'react'
import LandingPage from './landingPage.jsx'
import Login from './auth/Login'
import SignupFlow from './auth/SignupFlow'
import ForgotPassword from './auth/ForgotPassword'

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login') // 'login' | 'signup' | 'forgot' | 'landing'

  // On mount, verify stored token by calling server `/api/auth/me`.
  // If token is valid, set the returned user; otherwise clear storage and remain on login.
  useEffect(() => {
    async function restore() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          // token invalid/expired — clear and stay on login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setView('login')
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
      } catch (e) {
        console.warn('Failed to verify token on startup', e)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setView('login')
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
