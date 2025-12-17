function PostCard({ title = 'Sample Post', body = 'This is a sample post.', avatar }) {
  return (
    <article className="card post">
      <div className="post-header">
        <div className={avatar}>◯</div>
        <div className="meta">
          <div className="author">
            Anonymous · CS Student <span className="tag">CS</span>
          </div>
          <h4>{title}</h4>
        </div>
      </div>

      <p className="post-body">{body}</p>

      <div className="post-actions">
        <button>👍 Like</button> · <button>💬 Comment</button> · <button>⚑ Report</button>
      </div>
    </article>
  )
}