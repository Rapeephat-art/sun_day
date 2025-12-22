// backend/routes/admin.users.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // ต้องเป็น ../db (จากโฟลเดอร์ routes ขึ้นไป)

// GET list users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, role, parent_id, created_at FROM users ORDER BY created_at DESC');
    res.json({ rows });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// POST create user (plaintext password)
router.post('/', async (req, res) => {
  try {
    const { username, password, role, parent_id } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'username, password, role required' });

    const [exists] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (exists.length > 0) return res.status(400).json({ error: 'username already exists' });

    const [result] = await pool.query(
      'INSERT INTO users (username, password, role, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, password, role, parent_id || null]
    );

    res.json({ ok: true, user_id: result.insertId });
  } catch (err) {
    console.error('POST /api/admin/users error:', err);
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, password, role, parent_id } = req.body;
    await pool.query('UPDATE users SET username = ?, password = ?, role = ?, parent_id = ? WHERE user_id = ?',
      [username, password, role, parent_id || null, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/users/:id error:', err);
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error:', err);
    res.status(500).json({ error: err.message || 'internal error' });
  }
});

module.exports = router;
