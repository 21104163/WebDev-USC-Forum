import React, { useState } from 'react';
import "./loginSignup.css";

export default function SignUp({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchError, setMatchError] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMatchError('');

    // Password Match Validation Logic
    if (password !== confirmPassword) {
      setMatchError("Passwords do not match. Please check and try again.");
      return;
    }

    // --- Success Logic ---
        console.log("Passwords match. Proceeding with sign-up."); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h1>Create your account</h1>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input placeholder="Enter Username..." required/>
          <input placeholder="Enter your email..." type="email" required/>
          
          {/* Password Input */}
          <input placeholder="Enter your password..." type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>

          {/* Confirm Password Input */}
          <input placeholder="Re-Enter your password..." type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>

          {/* Error Message Display */}
          {matchError && <p className="error-message">{matchError}</p>}

          <button className="modal-submit" type="submit">
            Sign Up
          </button>
        </form>
          
      </div>
    </div>
  );
}