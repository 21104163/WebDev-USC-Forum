import React, { useEffect, useState } from 'react';
import './landingPage.css';

function PostCard({ title, body, avatar, authorName, authorTag, likes, comments }) {
  return (
    <article className="card post">
      <div className="post-header">
        <div className="avatar"><img src={avatar} alt="Avatar" /></div>
        <div className="meta">
          <div className="author">{authorName} · {authorTag}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        <button>👍 {likes}</button>
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
  const API_BASE = import.meta.env.VITE_API_URL || '/api'
  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_BASE}/posts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        // Expecting data to be an array of post objects with fields:
        // id, title, body, avatar, authorName, authorTag, likes, comments (array)
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPosts();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="posts-loading">Loading posts...</div>;
  if (error) return <div className="posts-error">Error loading posts: {error}</div>;

  return (
    <div className="posts-grid">
      {posts.map(post => (
        <PostCard
          key={post.id}
          title={post.title}
          body={post.body}
          avatar={post.avatar || '/default-avatar.png'}
          authorName={post.authorName || post.author || 'Unknown'}
          authorTag={post.authorTag || post.authorTag || ''}
          likes={typeof post.likes === 'number' ? post.likes : 0}
          comments={Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0)}
        />
      ))}
    </div>
  );
}