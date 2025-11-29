import "./signUp.css";

export default function SignUp({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>

      <h2>Create Account</h2>

      <form className="modal-form" >
      <input placeholder="Name" required/>
      <input placeholder="Email" type="email" required/>
      <input placeholder="Password" type="password" required/>
      <input placeholder="Confirm Password" type="password" required/>

      <button className="modal-submit">Sign Up</button>
      </form>
        
      </div>
    </div>
  );
}