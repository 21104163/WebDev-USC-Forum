import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function PostCreate() {
  const token = localStorage.getItem('token');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitPost() {
    if (!token) return alert('Please log in first');
    const cleanTitle = (title || '').trim();
    const cleanContent = (content || '').trim();
    if (!cleanTitle || !cleanContent) return alert('Title and content are required');

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: cleanTitle, content: cleanContent }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Let other components know a new post exists
      window.dispatchEvent(new CustomEvent('postCreated', { detail: data }));
      // reset and close
      setTitle('');
      setContent('');
      setShowConfirm(false);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="card post">
        <h2>Please log in to create a post.</h2>
      </div>
    );
  }

  return (
    <div>
      <button className="btn" onClick={() => setShowModal(true)}>Create Post</button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 700 }}>
            <h2>Create Post</h2>
            {!showConfirm ? (
              <>
                <label>Title:</label>
                <input type="text" placeholder="Post Title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                <label>Content:</label>
                <textarea placeholder="What's on your mind?" rows={6} maxLength={256} value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                  <button onClick={() => setShowConfirm(true)} disabled={!title.trim() || !content.trim()}>Post</button>
                </div>
              </>
            ) : (
              <>
                <p>You're about to publish this post. Continue?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowConfirm(false)}>Back</button>
                  <button onClick={submitPost} disabled={submitting}>{submitting ? 'Posting...' : 'Continue'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
