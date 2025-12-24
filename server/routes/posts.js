const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Paginated posts listing
router.get('/select/posts', async (req, res) => {
  try {
    const limitRaw = parseInt(req.query.limit, 10);
    const offsetRaw = parseInt(req.query.offset, 10);
    const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
    const offset = Number.isInteger(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const [posts] = await db.query('SELECT * FROM POSTS ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM POSTS');
    res.json({ posts, total, limit, offset });
  } catch (err) {
    console.error('DB error (select/posts):', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error (GET /posts/:id):', err);
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { title, content } = req.body;
    const cleanTitle = (title || '').toString().trim();
    const cleanContent = (content || '').toString().trim();

    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    if (!cleanTitle || !cleanContent) return res.status(400).json({ error: 'Title and content are required' });
    if (cleanTitle.length > 100) return res.status(400).json({ error: 'Title too long (max 100 chars)' });
    if (cleanContent.length > 256) return res.status(400).json({ error: 'Content too long (max 256 chars)' });

    const [result] = await db.query(
      'INSERT INTO POSTS (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())',
      [userId, cleanTitle, cleanContent]
    );

    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update post (owner only)
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    if (post.user_id != req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await db.query('UPDATE POSTS SET title = ?, content = ?, updated_at = NOW() WHERE post_id = ?', [title || post.title, content || post.content, id]);
    res.json({ success: true, message: 'Post updated' });
  } catch (err) {
    console.error('PUT /posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete post (owner only)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    if (post.user_id != req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await db.query('DELETE FROM POSTS WHERE post_id = ?', [id]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Comments: list
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const [comments] = await db.query('SELECT * FROM COMMENTS WHERE post_id = ? ORDER BY created_at ASC', [postId]);
    res.json({ comments });
  } catch (err) {
    console.error('GET comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Comments: create
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user && req.user.id;
    const { content } = req.body;
    const cleanContent = (content || '').toString().trim();
    if (!cleanContent) return res.status(400).json({ error: 'Content required' });

    const [result] = await db.query('INSERT INTO COMMENTS (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())', [postId, userId, cleanContent]);
    const [rows] = await db.query('SELECT * FROM COMMENTS WHERE comment_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete comment (owner)
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const [rows] = await db.query('SELECT * FROM COMMENTS WHERE comment_id = ?', [commentId]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    const comment = rows[0];
    if (comment.user_id != req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await db.query('DELETE FROM COMMENTS WHERE comment_id = ?', [commentId]);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Likes: like a post
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const [ins] = await db.query('INSERT IGNORE INTO LIKES (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    if (ins.affectedRows > 0) {
      await db.query('UPDATE POSTS SET numLikes = IFNULL(numLikes,0) + 1 WHERE post_id = ?', [postId]);
      const [[{ count }]] = await db.query('SELECT numLikes as count FROM POSTS WHERE post_id = ?', [postId]);
      return res.json({ success: true, liked: true, likes: count });
    }
    return res.status(409).json({ error: 'Already liked' });
  } catch (err) {
    console.error('LIKE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Likes: unlike
router.post('/posts/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const [del] = await db.query('DELETE FROM LIKES WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (del.affectedRows > 0) {
      await db.query('UPDATE POSTS SET numLikes = GREATEST(IFNULL(numLikes,0) - 1, 0) WHERE post_id = ?', [postId]);
      const [[{ count }]] = await db.query('SELECT numLikes as count FROM POSTS WHERE post_id = ?', [postId]);
      return res.json({ success: true, liked: false, likes: count });
    }
    return res.status(409).json({ error: 'Not previously liked' });
  } catch (err) {
    console.error('UNLIKE error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
