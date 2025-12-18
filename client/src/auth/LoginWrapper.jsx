import './loginSignup.css'
import Login from './Login'

export default function LoginWrapper({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <>
      <Login
        onLogin={() => {
          if (onClose) onClose()
          window.location.href = '/dashboard'
        }}
        onShowSignup={() => { /* no-op: landing parent may open signup */ }}
        onShowForgot={() => { window.location.href = '/forgot-password' }}
      />
    </>
  )
}
