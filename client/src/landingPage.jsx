import './landingPage.css'
import ConfirmModal from './components/ConfirmModal'
import { useState } from "react";
import uscLogo from './assets/USC_university_seal.svg.png';
import { Header } from './header.jsx';
import  GenPosts  from './samplepost.jsx';
import { PostCreate } from './createpost.jsx';

function Sidebar() {
  const [active, setActive] = useState('Home')

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === 'Home' ? 'active' : ''} onClick={() => setActive('Home')}>🏠 <span>Home</span></li>
          <li className={active === 'Announcements' ? 'active' : ''} onClick={() => setActive('Announcements')}>📢 <span>Announcements</span></li>
        </ul>
      </nav>
    </aside>
  )
}

function Topbar({ user, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  return (
    <header className="topbar fullwidth">
      <div className="left">
        <img src={uscLogo} alt="uscLogo" ></img>
        <ul className="brand">
          <li>University of San Carlos</li>
          <li className="bigFont">Forum</li>
        </ul>
        <Header />
      </div>

      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
            <ConfirmModal
              visible={showLogoutConfirm}
              title="Log out"
              message="Are you sure you want to log out?"
              confirmText="Log out"
              cancelText="Cancel"
              onConfirm={() => { setShowLogoutConfirm(false); onLogout() }}
              onCancel={() => setShowLogoutConfirm(false)}
            />
          </>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
}


function RightSidebar() {
  return (
    <aside className="rightbar">
      <div className="widget card users">
        <h4>Online Users</h4>
        <div className="user-list">◯ ◯ ◯</div>
      </div>
      <div className="widget card trending">
        <h4>Trending Topics</h4>
        <ul>
          <li>General</li>
          <li>CS</li>
          <li>Engineering</li>
        </ul>
      </div>
    </aside>
  )
}

export default function LandingPage({ user, onLogout }) {
  return (
    <div className="app-root">
      <Sidebar />

      <div className="main">
        <Topbar user={user} onLogout={onLogout} />
        <div className="container">
          <div className="content">
            <div className="feed">
              <PostCreate />
              <GenPosts />
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}