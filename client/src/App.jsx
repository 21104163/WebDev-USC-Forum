import './App.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">USC Forum</div>
      <nav>
        <ul>
          <li className="active">🏠 <span>Home</span></li>
          {/* Departments removed as requested */}
          <li>📢 <span>Announcements</span></li>
          <li>📝 <span>My Posts</span></li>
          <li>🔖 <span>Saved</span></li>
        </ul>
      </nav>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="search">🔍 <input placeholder="Search..." /></div>
      <div className="profile">◯</div>
    </header>
  )
}

function CreatePostCard() {
  return (
    <section className="card create-post">
      <h3>Create Post</h3>
      <input className="title" placeholder="Title" />
      <textarea className="body" placeholder="Describe your post..."></textarea>
      <div className="controls">
        <div className="left">
          <label className="upload">📎 Upload image</label>
          <select><option>Department</option></select>
          <select><option>Post Privacy</option></select>
        </div>
        <button className="post-btn">Post</button>
      </div>
    </section>
  )
}

function PostCard({ title = 'Sample Post', body = 'This is a sample post.' }) {
  return (
    <article className="card post">
      <div className="post-header">
        <div className="avatar">◯</div>
        <div className="meta">
          <div className="author">Anonymous · CS Student <span className="tag">CS</span></div>
          <h4>{title}</h4>
        </div>
      </div>
      <p className="post-body">{body}</p>
      <div className="post-actions">👍 Like · 💬 Comment · ⚑ Report</div>
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

export default function App() {
  return (
    <div className="app-root">
      <Sidebar />
      <div className="main">
        <div className="container">
          <Topbar />
          <div className="content">
            <div className="feed">
              <CreatePostCard />
              <PostCard />
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
