// backend/routes/children.class.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // ปรับ path ถ้าจำเป็น

// GET /api/children/myclass
// ถ้ามีระบบ auth - ควรเติม req.user.teacher_id ใน middleware
router.get('/myclass', async (req, res) => {
  try {
    // 1) หา teacher_id: จาก req.user (auth) หรือ fallback เป็น query param
    let teacher_id = null;
    if (req.user && req.user.teacher_id) {
      teacher_id = req.user.teacher_id;
    } else if (req.query && req.query.teacher_id) {
      teacher_id = parseInt(req.query.teacher_id, 10);
    }

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id required (authenticate or provide ?teacher_id=)' });
    }

    // 2) หา classroom_id ของครู
    const [trows] = await pool.query('SELECT classroom_id FROM teachers WHERE teacher_id = ?', [teacher_id]);
    if (!trows || trows.length === 0) {
      return res.status(404).json({ error: 'teacher not found or has no classroom' });
    }
    const classroom_id = trows[0].classroom_id;
    if (!classroom_id) {
      return res.status(400).json({ error: 'teacher has no classroom assigned' });
    }

    // 3) ดึงข้อมูลเด็กในห้องนั้น
    // Join กับ parents ถ้าต้องการข้อมูลผู้ปกครอง (ตาราง parents มี parent_id ตาม schema)
    const sql = `
      SELECT 
        c.child_id,
        c.child_code,
        c.prefix,
        c.first_name,
        c.last_name,
        c.nickname,
        DATE_FORMAT(c.birthday, '%Y-%m-%d') AS birthday,
        c.gender,
        c.ethnicity,
        c.nationality,
        c.religion,
        c.note,
        c.classroom_id,
        p.parent_id AS parent_id,
        CONCAT(p.prefix, ' ', p.first_name, ' ', p.last_name) AS parent_name,
        p.phone AS parent_phone,
        p.email AS parent_email
      FROM children c
      LEFT JOIN parents p ON c.parent_id = p.parent_id
      WHERE c.classroom_id = ?
      ORDER BY c.first_name, c.last_name
    `;
    const [rows] = await pool.query(sql, [classroom_id]);

    return res.json({ ok: true, classroom_id, rows });
  } catch (err) {
    console.error('/api/children/myclass error', err);
    return res.status(500).json({ error: 'failed to fetch children', detail: err.message });
  }
});

module.exports = router;
