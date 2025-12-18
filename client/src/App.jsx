
import './App.css'
import './auth/loginSignup.css'
import { useState } from 'react'
import LandingPage from './landingPage.jsx'
import Login from './auth/Login'
import SignupFlow from './auth/SignupFlow'
import ForgotPassword from './auth/ForgotPassword'

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login') // 'login' | 'signup' | 'forgot' | 'landing'

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
