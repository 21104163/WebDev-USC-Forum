const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ID counter for efficient ID generation
let nextPostId = 3;

// Sample data
let posts = [
  { id: 1, title: 'Welcome to USC Forum', content: 'This is the first post on our forum!', author: 'Admin', createdAt: new Date().toISOString() },
  { id: 2, title: 'Getting Started', content: 'Learn how to use this forum effectively.', author: 'Moderator', createdAt: new Date().toISOString() }
];

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to USC Forum API' });
});

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// Get a single post
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Title, content, and author are required' });
  }
  const newPost = {
    id: nextPostId++,
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Update a post
app.put('/api/posts/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const { title, content, author } = req.body;
  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content,
    author: author || posts[postIndex].author
  };
  res.json(posts[postIndex]);
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const deletedPost = posts.splice(postIndex, 1);
  res.json(deletedPost[0]);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
