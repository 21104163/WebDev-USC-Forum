import { useState } from 'react';

const API_BASE2 = 'https://webdev-usc-forum-1.onrender.com' || import.meta.env.VITE_REND_URL;

export function PostCreate() {
    console.log(import.meta.env.VITE_REND_URL);
  const token = localStorage.getItem('token');
  if(!token) { 
    return <div className="card post"><h2>Please log in to create a post.</h2></div>;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function submitPost(event) {
    event.preventDefault();
    console.log('Post submitted:', { userId, title, content });
    
    // Example: send to server
    try {
      const res = await fetch(`${API_BASE2}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, title, content }),
      });

      if (!res.ok) throw new Error('Failed to create post');
      const data = await res.json();
      console.log('Post saved:', data);

      // Reset form
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="card post">
      <h2>Create Post</h2>
      <form className="post-form" onSubmit={submitPost}>
        <label htmlFor="title">Title:</label>
        <input type="text" placeholder="Post Title" id="title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="content">Content:</label>
        <textarea
          placeholder="What's on your mind?" id="content" rows={4} maxLength={256} value={content} onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
