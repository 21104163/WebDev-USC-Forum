import './landingPage.css'
import { useState } from "react";
import uscLogo from './assets/USC_university_seal.svg.png';
import { Header } from './header.jsx';
import Post from './samplepost.jsx';
import { PostCreate } from './createpost.jsx';

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

function Topbar({ user, onLogout }) {
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
            <button className="logout-btn" onClick={onLogout}>Logout</button>
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
              <Post postid={1} />
              <Post postid={2} />
              <Post postid={3} />
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}