import './loginSignup.css'
import SignupFlow from './SignupFlow'

export default function SignupWrapper({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <>
      <SignupFlow
        onSignupSuccess={() => {
          if (onClose) onClose()
          window.location.href = '/dashboard'
        }}
        onCancel={() => {
          if (onClose) onClose()
        }}
      />
    </>
  )
}
