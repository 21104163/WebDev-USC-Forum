import { useState } from 'react'
import './loginSignup.css'

export default function ForgotPassword({ onDone, onCancel }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function sendCode() {
    setMessage('')
    setEmailError('')
    if (!email) {
      setEmailError('Email is required')
      return
    }
    const uscRe = /^[^\s@]+@usc\.edu(\.ph)?$/i
    if (!uscRe.test(email)) {
      setEmailError('Please use a valid USC email (user@usc.edu or user@usc.edu.ph)')
      return
    }
    try {
      const res = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setStep(2)
      setMessage('Code sent')
    } catch (err) {
      setEmailError(err.message)
    }
  }

  async function resetPassword(e) {
    e.preventDefault()
    setMessage('')
    if (!code) {
      setPasswordError('Reset code is required')
      return
    }
    if (password !== confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    // password complexity
    const lower = /[a-z]/.test(password)
    const upper = /[A-Z]/.test(password)
    const digit = /[0-9]/.test(password)
    if (!(lower && upper && digit)) {
      setPasswordError('Password must contain lowercase, uppercase and a number')
      return
    }
    setPasswordError('')
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      setMessage('Password reset successful')
      onDone()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h1>Forgot Password</h1>

        {step === 1 && (
          <div className="modal-form">
            <input type="email" placeholder="USC Email" value={email} onChange={e => setEmail(e.target.value)} onBlur={async ()=>{
              const uscRe = /^[^\s@]+@usc\.edu(\.ph)?$/i
              if (!email || !uscRe.test(email)) return
              try {
                const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.message || 'Check failed')
                if (!data.exists) setEmailError('Email not found in our records')
              } catch (err) {
                console.error('Email check error', err)
              }
            }} required />
            {emailError && <div className="field-error">{emailError}</div>}
            <button className="modal-submit" onClick={sendCode}>Send reset code</button>
          </div>
        )}

        {step === 2 && (
          <form className="modal-form" onSubmit={resetPassword}>
            <input placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} required />
            <input placeholder="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <input placeholder="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />

            {passwordError && <div className="field-error">{passwordError}</div>}

            <div className="pw-requirements">
              <div className={/[a-z]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one lowercase</div>
              <div className={/[A-Z]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one uppercase</div>
              <div className={/[0-9]/.test(password) ? 'pw-requirement met' : 'pw-requirement'}>• one number</div>
            </div>

            <button type="submit" className="modal-submit">Reset password</button>
          </form>
        )}

        {message && <div className="step-info">{message}</div>}

        <div style={{marginTop:12}}>
          <button className="back-btn" onClick={onCancel}>Back</button>
        </div>
      </div>
    </div>
  )
}
