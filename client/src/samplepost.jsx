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

      setPosts(items.map(p => ({
        ...p,
        avatar: p.avatar || '/default-avatar.png',
        authorName: p.authorName || `User ${p.user_id}`,
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

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div>
      <div className="posts-grid">
        {posts.map(post => {
          const id = post.post_id || post.id;
          return (
            <div key={id}>
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
