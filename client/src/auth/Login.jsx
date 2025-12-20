import { useState } from 'react'
import './loginSignup.css'
import bg from '../assets/University-of-San-Carlos-background.jpg'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function Login({ onLogin, onShowSignup, onShowForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')
    const uscRe = /^[^\s@]+@usc\.edu(\.ph)?$/i
    if (!email) return setEmailError('Email is required')
    if (!uscRe.test(email)) return setEmailError('Please enter a valid USC email (user@usc.edu or user@usc.edu.ph)')
    if (!password) return setPasswordError('Password is required')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) throw new Error((data && data.message) || text || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    }
  }

  function onEmailChange(value) {
    setEmail(value)
    const uscRe = /@usc\.edu(\.ph)?$/i
    if (/@gmail\.com$/i.test(value) && !uscRe.test(value)) {
      setInfo('Personal Gmail detected — consider using your USC email for signup.')
      setEmailError('Using a non-USC Gmail may prevent account-level features.')
    } else {
      setInfo('')
      setEmailError('')
    }
  }

  // on blur, check existence in DB
  async function handleEmailBlur() {
    const uscRe = /^[^\s@]+@usc\.edu(\.ph)?$/i
    if (!email || !uscRe.test(email)) return
    try {
      const res = await fetch(`${API_BASE}/auth/check-email?email=${encodeURIComponent(email)}`)
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) throw new Error((data && data.message) || text || 'Check failed')
      if (!data.exists) setEmailError('Email not found. Please sign up first.')
    } catch (err) {
      console.error('Email check error', err)
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h1>Login to your account</h1>

        <form onSubmit={handleSubmit} className="modal-form">
          <input type="email" placeholder="USC Email" value={email} onChange={e => onEmailChange(e.target.value)} onBlur={handleEmailBlur} required />
          {emailError && <div className="field-error">{emailError}</div>}
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {passwordError && <div className="field-error">{passwordError}</div>}
          {error && <div className="error-message">{error}</div>}
          {info && <div className={emailError ? 'field-error' : 'inline-note'}>{info}</div>}
          <button type="submit" className="modal-submit">Login</button>
        </form>

        <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
          <button className="back-btn" onClick={onShowSignup}>Create account</button>
          <button className="back-btn" onClick={onShowForgot}>Forgot password</button>
        </div>

        <div style={{marginTop:14, textAlign:'center'}}>
          <button
            type="button"
            className="modal-submit"
            onClick={() => onLogin({ email: 'guest@local' })}
            title="Continue as guest"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  )
}
