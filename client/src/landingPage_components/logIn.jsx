import './logIn.css';

export default function LogIn({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Login</h2>

        <form className="modal-form">
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />

          <button type="submit" className="modal-submit">Login</button>
        </form>
      </div>
    </div>
  );
}
