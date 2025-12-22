// backend/routes/announcements.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // ต้องชี้ไปไฟล์ db ของคุณ
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- SAFE GET list ---
router.get('/', async (req, res) => {
  try {
    // Query แบบระมัดระวัง: เลือกคอลัมน์ที่มีจริงตาม schema ของคุณ
    const [rows] = await pool.query(
      `SELECT announcement_id, title, content, created_by, image_url,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
       FROM announcements
       ORDER BY created_at DESC`
    );
    return res.json({ ok: true, rows });
  } catch (err) {
    console.error('GET /api/announcements error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'internal server error' });
  }
});

// --- GET single ---
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT announcement_id, title, content, created_by, image_url, created_at FROM announcements WHERE announcement_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ ok: true, row: rows[0] });
  } catch (err) {
    console.error('GET /api/announcements/:id error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'internal server error' });
  }
});

// --- CREATE (with optional image) ---
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'content required' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const created_by = req.body.created_by || null;

    const [result] = await pool.query(
      'INSERT INTO announcements (title, content, image_url, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title || null, content, imageUrl, created_by]
    );

    return res.json({ ok: true, announcement_id: result.insertId, image_url: imageUrl });
  } catch (err) {
    console.error('POST /api/announcements error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'internal server error' });
  }
});

// --- UPDATE (with optional image) ---
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'content required' });

    // get existing
    const [existing] = await pool.query('SELECT image_url FROM announcements WHERE announcement_id = ?', [id]);
    if (!existing || existing.length === 0) return res.status(404).json({ error: 'not found' });

    let imageUrl = existing[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      // remove previous file if exists
      try {
        if (existing[0].image_url) {
          const prev = path.join(UPLOAD_DIR, path.basename(existing[0].image_url));
          if (fs.existsSync(prev)) fs.unlinkSync(prev);
        }
      } catch (e) { console.warn('remove old image failed', e); }
    }

    await pool.query('UPDATE announcements SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE announcement_id = ?', [title || null, content, imageUrl, id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/announcements/:id error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'internal server error' });
  }
});

// --- DELETE ---
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT image_url FROM announcements WHERE announcement_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not found' });

    await pool.query('DELETE FROM announcements WHERE announcement_id = ?', [id]);

    try {
      if (rows[0].image_url) {
        const p = path.join(UPLOAD_DIR, path.basename(rows[0].image_url));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    } catch (e) { console.warn('failed delete file', e); }

    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/announcements/:id error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'internal server error' });
  }
});

module.exports = router;
