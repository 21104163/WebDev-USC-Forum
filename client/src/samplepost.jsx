import React, { useEffect } from 'react';

export default function PostCard({ postid}) {
    useEffect(() => {
        // Fetch post data based on postid
        // This is a placeholder for actual data fetching logic
    }, [postid]);

    // Placeholder data
    const title = 'Sample Post Title';
    const body = 'This is the body of the sample post.';
    const avatar = 'avatar';
    const authorName = 'Anonymous';
    const authorTag = 'CS Student';
    const likes = 10;
    const comments = 5;

  return (
    <article className="card post">
      <div className="post-header">
        <div><img src = {avatar} alt="Avatar" /></div>
        <div className="meta">
          <div className="author">
            {authorName} · {authorTag} <span className="tag">CS</span>
          </div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        <button>👍 {likes}</button> · <button>💬 {comments}</button> · <button>⚑ Report</button>
      </div>
    </article>
  )
}