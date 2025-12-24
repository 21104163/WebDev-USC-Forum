import React, { useEffect, useState } from 'react';
import './landingPage.css';

function PostCard({ id, title, body, avatar, authorName, likes, comments, onLike }) {
  console.log(import.meta.env.VITE_REND_URL)
  return (
    <article className="card post">
      <div className="post-header">
        <div className="avatar"><img src={avatar} alt="Avatar" /></div>
        <div className="meta">
          <div className="author">{authorName}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        <button onClick={() => onLike && onLike(id)} aria-label="like">👍 {likes}</button>
        <button>💬 {comments}</button>
        <button>⚑ Report</button>
      </div>
    </article>
  );
}

export default function GenPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  const [editingMap, setEditingMap] = useState({});

  function isEditing(id) { return !!editingMap[id]; }
  function toggleEdit(id) { setEditingMap(m => ({ ...m, [id]: !m[id] })); }

  async function refreshPosts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/select/posts?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data.posts) ? data.posts : [];
      setTotal(data.total || 0);
      const formattedPosts = items.map(post => ({
        ...post,
        avatar: post.avatar || '/default-avatar.png',
        authorName: post.authorName || `User ${post.user_id || 'Unknown'}`,
        likes: typeof post.numLikes === 'number' ? post.numLikes : 0,
        commentsCount: Array.isArray(post.comments) ? post.comments.length : post.numComments || 0,
      }));
      setPosts(formattedPosts);
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Update local posts state with new likes count
      setPosts((prev) => prev.map(p => p.post_id === Number(postId) || p.id === Number(postId) ? ({ ...p, likes: data.likes }) : p));
    } catch (e) {
      alert('Like failed: ' + (e.message || e));
    }
  }

  const [commentsMap, setCommentsMap] = useState({});

  async function fetchComments(postId) {
    setCommentsMap((m) => ({ ...m, [postId]: { ...(m[postId] || {}), loading: true } }));
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCommentsMap((m) => ({ ...m, [postId]: { comments: data.comments || [], loading: false, open: true } }));
    } catch (e) {
      setCommentsMap((m) => ({ ...m, [postId]: { comments: [], loading: false, open: true, error: e.message } }));
    }
  }

  async function handleAddComment(postId, text, clearCallback) {
    const token = localStorage.getItem('token');
    if (!token) return alert('Log in to comment');
    if (!text || !text.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text.trim() })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const newComment = await res.json();
      setCommentsMap((m) => {
        const cur = m[postId] || { comments: [] };
        return { ...m, [postId]: { ...cur, comments: [ ...(cur.comments || []), newComment ], open: true } };
      });
      if (typeof clearCallback === 'function') clearCallback();
    } catch (e) {
      alert('Failed to post comment: ' + (e.message || e));
    }
  }

  useEffect(() => {
    let mounted = true;

    // fetch current user if token exists
    (async function fetchCurrentUser(){
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setCurrentUser(data);
      } catch (e) {
        // ignore
      }
    })();

    (async ()=>{ await refreshPosts(); })();
    return () => { mounted = false; };
  }, [limit, offset, API_BASE]);

  // Handlers that need component scope (can access refreshPosts/currentUser)
  async function handleDeletePost(postId) {
    if (!window.confirm('Delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refreshPosts();
    } catch (e) {
      alert('Delete failed: ' + (e.message || e));
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // reload comments/posts
      await refreshPosts();
    } catch (e) {
      alert('Delete failed: ' + (e.message || e));
    }
  }

  function EditPostForm({ post, onSaved, onCancel }) {
    const [title, setTitle] = useState(post.title || '');
    const [content, setContent] = useState(post.content || post.body || '');
    const [saving, setSaving] = useState(false);

    async function submit(e) {
      e.preventDefault();
      setSaving(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/posts/${post.post_id || post.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ title, content })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await onSaved();
      } catch (e) {
        alert('Save failed: ' + (e.message || e));
      } finally {
        setSaving(false);
        onCancel();
      }
    }

    return (
      <form onSubmit={submit} style={{ maxWidth: 700, margin: '8px auto', padding: 8, border: '1px solid #ddd' }}>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', marginBottom: 8 }} />
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={4} style={{ width: '100%' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    );
  }

  if (loading) return <div className="posts-loading">Loading posts...</div>;
  if (error) return <div className="posts-error">Error loading posts: {error}</div>;

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div>
      <div className="posts-grid">
        {posts.map(post => {
          const pid = post.post_id || post.id;
          const cm = commentsMap[pid] || { open: false, loading: false, comments: [] };
          return (
            <div key={pid} style={{ marginBottom: 12 }}>
              <PostCard
                id={pid}
                title={post.title}
                body={post.body || post.content}
                avatar={post.avatar}
                authorName={post.authorName}
                likes={post.likes}
                comments={post.commentsCount}
                onLike={handleLike}
              />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
                <button onClick={() => cm.open ? setCommentsMap((m)=>({ ...m, [pid]: { ...cm, open: false } })) : fetchComments(pid)}>
                  {cm.open ? 'Hide Comments' : `Show Comments (${post.commentsCount || (cm.comments || []).length})`}
                </button>

                {/* Owner controls: edit/delete */}
                {currentUser && Number(currentUser.id) === Number(post.user_id) && (
                  <>
                    <button onClick={() => toggleEdit(pid)}>Edit</button>
                    <button onClick={() => handleDeletePost(pid)} style={{ color: 'red' }}>Delete</button>
                  </>
                )}
              </div>

              {isEditing(pid) && (
                <EditPostForm post={post} onSaved={refreshPosts} onCancel={() => toggleEdit(pid)} />
              )}

              {cm.open && (
                <div className="comments" style={{ maxWidth: 700, margin: '8px auto', padding: 8 }}>
                  {cm.loading && <div>Loading comments...</div>}
                  {cm.error && <div className="error">Error: {cm.error}</div>}
                  {Array.isArray(cm.comments) && cm.comments.length === 0 && !cm.loading && <div>No comments yet.</div>}
                  {Array.isArray(cm.comments) && cm.comments.map(c => (
                    <div key={c.comment_id || c.id} style={{ borderTop: '1px solid #eee', padding: '8px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 12, color: '#444' }}><strong>{c.AUTHOR_NAME || c.authorName || `User ${c.user_id || '??'}`}</strong> · <span style={{ fontSize: 11, color: '#666' }}>{new Date(c.created_at || c.createdAt || Date.now()).toLocaleString()}</span></div>
                        {currentUser && Number(currentUser.id) === Number(c.user_id) && (
                          <button onClick={() => handleDeleteComment(c.comment_id || c.id)} style={{ color: 'red' }}>Delete</button>
                        )}
                      </div>
                      <div style={{ marginTop: 4 }}>{c.content}</div>
                    </div>
                  ))}

                  <AddCommentForm postId={pid} onAdd={handleAddComment} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>Prev</button>
        <div style={{ alignSelf: 'center' }}>{Math.min(offset + 1, total)} - {Math.min(offset + limit, total)} of {total}</div>
        <button disabled={!canNext} onClick={() => setOffset(offset + limit)}>Next</button>
      </div>

    </div>
  );
}

function AddCommentForm({ postId, onAdd }) {
  const [text, setText] = useState('');
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onAdd(postId, text, ()=>setText('')); }} style={{ marginTop: 8 }}>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a comment..." rows={3} style={{ width: '100%' }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
        <button type="submit">Comment</button>
      </div>
    </form>
  );
}

async function handleDeletePost(postId) {
  if (!confirm || !confirm('Delete this post?')) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/posts/${postId}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await refreshPosts();
  } catch (e) {
    alert('Delete failed: ' + (e.message || e));
  }
}

async function handleDeleteComment(commentId) {
  if (!confirm || !confirm('Delete this comment?')) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // refresh comments by reloading posts (simpler)
    await refreshPosts();
  } catch (e) {
    alert('Delete failed: ' + (e.message || e));
  }
}

function EditPostForm({ post, onSaved, onCancel }) {
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || post.body || '');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/posts/${post.post_id || post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await onSaved();
    } catch (e) {
      alert('Save failed: ' + (e.message || e));
    } finally {
      setSaving(false);
      onCancel();
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 700, margin: '8px auto', padding: 8, border: '1px solid #ddd' }}>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', marginBottom: 8 }} />
      <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={4} style={{ width: '100%' }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
