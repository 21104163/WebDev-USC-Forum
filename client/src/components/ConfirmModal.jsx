import React from 'react'
import '../auth/loginSignup.css'

export default function ConfirmModal({ visible, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!visible) return null
  return (
    <div className="modal-overlay confirm-modal" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop:0, textAlign: 'center'}}>{title}</h2>
        <div style={{marginTop: '0.5rem', marginBottom: '1rem', textAlign: 'center'}}>{message}</div>
        <div className="modal-actions">
          <button className="back-btn" onClick={onCancel}>{cancelText}</button>
          <button className="modal-submit" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
