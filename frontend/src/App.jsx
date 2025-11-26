import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', content: '', author: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="app">
        <h1>USC Forum</h1>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 USC Forum</h1>
        <p className="subtitle">Connect, Share, and Discuss</p>
      </header>

      {error && <div className="error">Error: {error}</div>}

      <div className="actions">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Post'}
        </button>
        <button className="btn-secondary" onClick={fetchPosts}>
          Refresh
        </button>
      </div>

      {showForm && (
        <form className="post-form" onSubmit={handleSubmit}>
          <h3>Create New Post</h3>
          <input
            type="text"
            name="title"
            placeholder="Post Title"
            value={newPost.title}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Your Name"
            value={newPost.author}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="content"
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={handleInputChange}
            required
            rows="4"
          />
          <button type="submit" className="btn-primary">Post</button>
        </form>
      )}

      <div className="posts-container">
        <h2>Recent Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet. Be the first to post!</p>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(post.id)}
                    title="Delete post"
                  >
                    ×
                  </button>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="post-footer">
                  <span className="author">By: {post.author}</span>
                  <span className="date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
