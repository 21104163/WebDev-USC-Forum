import React, { useEffect, useState } from 'react';
import './landingPage.css';

function PostCard({ title, body, avatar, authorName, likes, comments }) {
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
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/select/posts?limit=${limit}&offset=${offset}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const items = Array.isArray(data.posts) ? data.posts : [];
        setTotal(data.total || 0);

        // Map posts to ensure author info is included
        const formattedPosts = items.map(post => ({
          ...post,
          avatar: post.avatar || '/default-avatar.png',
          authorName: post.authorName || `User ${post.user_id || 'Unknown'}`,
          likes: typeof post.numLikes === 'number' ? post.numLikes : 0,
          commentsCount: Array.isArray(post.comments) ? post.comments.length : post.numComments || 0,
        }));

        setPosts(formattedPosts);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => { mounted = false; };
  }, [limit, offset, API_BASE]);

  if (loading) return <div className="posts-loading">Loading posts...</div>;
  if (error) return <div className="posts-error">Error loading posts: {error}</div>;

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div>
      <div className="posts-grid">
        {posts.map(post => (
          <PostCard
            key={post.post_id || post.id}
            title={post.title}
            body={post.body || post.content}
            avatar={post.avatar}
            authorName={post.authorName}
            likes={post.likes}
            comments={post.commentsCount}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>Prev</button>
        <div style={{ alignSelf: 'center' }}>{Math.min(offset + 1, total)} - {Math.min(offset + limit, total)} of {total}</div>
        <button disabled={!canNext} onClick={() => setOffset(offset + limit)}>Next</button>
      </div>
    </div>
  );
}
