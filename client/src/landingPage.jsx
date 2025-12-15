import './landingPage.css'
import { useState } from "react";
import LogIn from './landingPage_components/logIn.jsx'
import SignUp from './landingPage_components/signUp.jsx'
import uscLogo from './assets/USC_university_seal.svg.png';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>🏠 <span>Home</span></li>
          <li>📢 <span>Announcements</span></li>
        </ul>
      </nav>
    </aside>
  )
}

function Topbar({onLoginClick, onSignUpClick}) {
    
  return (
    <header className="topbar fullwidth">
      <div className="left">
        <img src={uscLogo} alt="uscLogo" ></img>
        <ul className="brand">
          <li>University of San Carlos</li>
          <li class="bigFont">Forum</li>
        </ul>
        <div className="search">
          🔍 <input placeholder="Search..." />
        </div>
      </div>

      <div className="auth-buttons">
        <button className="login-btn" onClick={onLoginClick}>Login</button>
        <button className="signup-btn" onClick={onSignUpClick}>Sign Up</button>
      </div>
    </header>
  );
}

function PostCard({ title = 'Sample Post', body = 'This is a sample post.' }) {
  return (
    <article className="card post">
      <div className="post-header">
        <div className="avatar">◯</div>
        <div className="meta">
          <div className="author">
            Anonymous · CS Student <span className="tag">CS</span>
          </div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        👍 Like · 💬 Comment · ⚑ Report
      </div>
    </article>
  )
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

export default function LandingPage() {

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setSignUpOpen] = useState(false);

  return (
    <div className="app-root">
      <Sidebar />

      <div className="main">
        <Topbar 
          onLoginClick={() => setIsLoginOpen(true)}
          onSignUpClick={() => setSignUpOpen(true)} 
        />
        <div className="container">
          <div className="content">
            <div className="feed">
              <PostCard />
              <PostCard title="Welcome to USC Forum!" body="Your gateway to campus discussions." />
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>
        <LogIn isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <SignUp isOpen={isSignUpOpen} onClose={() => setSignUpOpen(false)} />
    </div>
  )
}