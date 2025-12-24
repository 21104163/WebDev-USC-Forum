import React, { useEffect, useState } from 'react';
import './landingPage.css';

function PostCard({ id, title, body, avatar, authorName, likes, comments, onLike }) {
  return (
    <article className="card post">
      <div className="post-header">
        <div className="avatar">
          <img src={avatar} alt="Avatar" />
        </div>
        <div className="meta">
          <div className="author">{authorName}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        <button onClick={() => onLike(id)}>👍 {likes}</button>
        <button>💬 {comments}</button>
        <button>⚑ Report</button>
      </div>
    </article>
  );
}

export default function GenPosts() {
  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [editingMap, setEditingMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});

  function toggleEdit(id) {
    setEditingMap(m => ({ ...m, [id]: !m[id] }));
  }

  async function refreshPosts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/select/posts?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items = Array.isArray(data.posts) ? data.posts : [];
      setTotal(data.total || 0);

      // try to read current user from localStorage so posts authored by the
      // logged-in user display their email/name instead of "User <id>"
      let storedUser = null;
      try {
        const u = localStorage.getItem('user');
        if (u) storedUser = JSON.parse(u);
      } catch (e) {
        storedUser = null;
      }

      setPosts(items.map(p => ({
        ...p,
        avatar: p.avatar || '/default-avatar.png',
        authorName: p.authorName || ((storedUser && Number(storedUser.id) === Number(p.user_id)) ? (storedUser.name || storedUser.email || `User ${p.user_id}`) : `User ${p.user_id}`),
        likes: p.numLikes || 0,
        commentsCount: p.numComments || 0
      })));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.ok) refreshPosts();
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('Delete this post?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshPosts();
  }

  useEffect(() => {
    refreshPosts();
  }, [offset]);

  // load current user from localStorage so we can mark owner's posts
  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {
      setCurrentUser(null);
    }
  }, []);

  // Listen for new posts created elsewhere and refresh
  useEffect(() => {
    function onCreated(e) {
      const d = e && e.detail ? e.detail : null;
      if (!d) return refreshPosts();
      const newId = d.post_id || d.id || null;
      const normalized = {
        ...d,
        post_id: d.post_id || d.id || null,
        body: d.body || d.content || '',
        avatar: d.avatar || '/default-avatar.png',
        authorName: d.authorName || `User ${d.user_id || ''}`,
        likes: d.numLikes || d.likes || 0,
        commentsCount: d.numComments || 0,
        __new: true,
      };

      setPosts(prev => {
        if (!newId) {
          // If server didn't return an id, just refresh to avoid duplicates
          refreshPosts();
          return prev;
        }
        const exists = prev.some(p => (p.post_id || p.id) === newId);
        if (exists) {
          // mark existing as newCreated briefly
          const updated = prev.map(p => ((p.post_id || p.id) === newId ? { ...p, __new: true } : p));
          setTimeout(() => {
            setPosts(cur => cur.map(p => ((p.post_id || p.id) === newId ? { ...p, __new: false } : p)));
          }, 8000);
          return updated;
        }
        const withNew = [normalized, ...prev];
        setTimeout(() => {
          setPosts(cur => cur.map(p => ((p.post_id || p.id) === newId ? { ...p, __new: false } : p)));
        }, 8000);
        return withNew;
      });
    }
    window.addEventListener('postCreated', onCreated);
    return () => window.removeEventListener('postCreated', onCreated);
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div>
      <div className="posts-grid">
        {posts.map(post => {
          const id = post.post_id || post.id;
          let wrapperClass = post.__new ? 'new-created' : '';
          if (currentUser && post.user_id && Number(post.user_id) === Number(currentUser.id)) {
            wrapperClass = (wrapperClass ? wrapperClass + ' ' : '') + 'my-post';
          }
          return (
            <div key={id} className={wrapperClass}>
              <PostCard
                id={id}
                title={post.title}
                body={post.body}
                avatar={post.avatar}
                authorName={post.authorName}
                likes={post.likes}
                comments={post.commentsCount}
                onLike={handleLike}
              />

              {currentUser?.id === post.user_id && (
                <>
                  <button onClick={() => toggleEdit(id)}>Edit</button>
                  <button onClick={() => handleDeletePost(id)}>Delete</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button disabled={!canPrev} onClick={() => setOffset(offset - limit)}>Prev</button>
        <span style={{ margin: '0 10px' }}>
          {offset + 1}–{Math.min(offset + limit, total)} of {total}
        </span>
        <button disabled={!canNext} onClick={() => setOffset(offset + limit)}>Next</button>
      </div>
    </div>
  );
}
