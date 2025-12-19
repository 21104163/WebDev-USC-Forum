import { useState } from 'react'
import './loginSignup.css'
import bg from '../assets/University-of-San-Carlos-background.jpg'
import ConfirmModal from '../components/ConfirmModal'

const raw = import.meta.env.VITE_API_URL || '/api'
const API_BASE = raw.endsWith('/api') ? raw.replace(/\/$/,'') : raw.replace(/\/$/,'') + '/api'

export default function SignupFlow({ onSignupSuccess, onCancel }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  async function sendCode() {
    setMessage('')
    // basic empty check and USC domain validation
    if (!email) {
      setEmailError('Email is required')
      return
    }
    const uscRe = /^[^\s@]+@usc\.edu(\.ph)?$/i
    if (!uscRe.test(email)) {
      setEmailError('Please use a valid USC email (user@usc.edu or user@usc.edu.ph)')
      return
    }
    setEmailError('')
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) throw new Error((data && data.message) || text || 'Failed')
      setStep(2)
      setMessage('Code sent')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function verifyCode() {
    setMessage('')
    if (!code) {
      setMessage('Code is required')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) throw new Error((data && data.message) || text || 'Invalid code')
      setStep(3)
      setMessage('Code verified — set password')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function doCompleteSignup() {
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code })
      })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) throw new Error((data && data.message) || text || 'Signup failed')
      localStorage.setItem('token', data.token)
      onSignupSuccess(data.user)
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function completeSignup(e) {
    e.preventDefault()
    setMessage('')
    if (password !== confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    // check password complexity client-side
    const lower = /[a-z]/.test(password)
    const upper = /[A-Z]/.test(password)
    const digit = /[0-9]/.test(password)
    if (!(lower && upper && digit)) {
      setPasswordError('Password must contain lowercase, uppercase and a number')
      return
    }
    setPasswordError('')
    // show confirmation modal instead of native confirm
    setShowConfirm(true)
  }

  return (
    <>
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
          <h1>Create your account</h1>

          {step === 1 && (
            <div className="modal-form">
              <input type="email" placeholder="USC Email" value={email} onChange={e => setEmail(e.target.value)} required />
              {emailError && <div className="field-error">{emailError}</div>}
              <button className="modal-submit" onClick={sendCode}>Send verification code</button>
            </div>
          )}

          {step === 2 && (
            <div className="modal-form">
              <input placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} required />
              <button className="modal-submit" onClick={verifyCode}>Verify code</button>
            </div>
          )}

          {step === 3 && (
            <form className="modal-form" onSubmit={completeSignup}>
              <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <input placeholder="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />

              {passwordError && <div className="field-error">{passwordError}</div>}

              <div className="pw-requirements">
                <div className={/[a-z]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one lowercase</div>
                <div className={/[A-Z]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one uppercase</div>
                <div className={/[0-9]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one number</div>
              </div>

              <button type="submit" className="modal-submit">Create account</button>
            </form>
          )}

          {message && <div className="step-info">{message}</div>}

          <div style={{marginTop:12}}>
            <button className="back-btn" onClick={onCancel}>Back</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        visible={showConfirm}
        title="Create account"
        message="Create account now with this password?"
        confirmText="Create"
        cancelText="Cancel"
        onConfirm={() => { setShowConfirm(false); doCompleteSignup() }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
