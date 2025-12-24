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
      <button className="create-btn" onClick={() => setShowModal(true)}>Create Post</button>

      {showModal && (
        <div className="create-modal-backdrop">
          <div className="create-modal">
            <div className="create-modal-header">
              <h2>Create Post</h2>
              <button className="create-modal-close" onClick={() => { setShowModal(false); setShowConfirm(false); }}>✕</button>
            </div>

            <div className="create-modal-body">
              {!showConfirm ? (
                <>
                  <label>Title:</label>
                  <input className="create-modal-input" type="text" placeholder="Post Title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
                  <label>Content:</label>
                  <textarea className="create-modal-textarea" placeholder="What's on your mind?" rows={6} maxLength={256} value={content} onChange={(e) => setContent(e.target.value)} />
                  <div className="create-modal-actions">
                    <button className="btn btn-secondary" onClick={() => { setShowModal(false); setShowConfirm(false); }}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => setShowConfirm(true)} disabled={!title.trim() || !content.trim()}>Post</button>
                  </div>
                </>
              ) : (
                <>
                  <p>You're about to publish this post. Continue?</p>
                  <div className="create-modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Back</button>
                    <button className="btn btn-primary" onClick={submitPost} disabled={submitting}>{submitting ? 'Posting...' : 'Continue'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
