import React from 'react'
import '../auth/loginSignup.css'

export default function ConfirmModal({ visible, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!visible) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{width: '420px'}}>
        <h2 style={{marginTop:0}}>{title}</h2>
        <div style={{marginTop: '0.5rem', marginBottom: '1rem'}}>{message}</div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem'}}>
          <button className="back-btn" onClick={onCancel}>{cancelText}</button>
          <button className="modal-submit" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
