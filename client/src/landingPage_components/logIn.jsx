import './loginSignup.css';

export default function LogIn({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h1>Login to your account</h1>

        <form className="modal-form">
          <input type="text" placeholder="Enter your email..." required />
          <input type="password" placeholder="Enter your password..." required />

          <button type="submit" className="modal-submit">Login</button>
        </form>
      </div>
    </div>
  );
}
