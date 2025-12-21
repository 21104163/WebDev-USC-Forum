import { useState } from 'react';

const API_BASE = 'https://webdev-usc-forum-dntk.onrender.com' || '/api'

export function PostCreate() {
  const token = localStorage.getItem('token');
  if (!token) return null; // Don't render form if not logged in

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitPost(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Post submitted:', { userId, title, content });

    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to create post');
      
      console.log('Post saved:', data);

      // Reset form
      setTitle('');
      setContent('');
      alert('Post created successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card post">
      <h2>Create Post</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form className="post-form" onSubmit={submitPost}>
        <label htmlFor="title">Title:</label>
        <input 
          type="text" 
          placeholder="Post Title" 
          id="title" 
          maxLength={100} 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="content">Content:</label>
        <textarea
          placeholder="What's on your mind?" 
          id="content" 
          rows={4} 
          maxLength={256} 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
      </form>
    </div>
  );
}
