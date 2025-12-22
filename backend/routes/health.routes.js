// backend/routes/health.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js');

/**
 * GET /api/health/today?teacher_id=#
 * - หา children ใน classroom ของ teacher
 * - ดึง health_evaluations ล่าสุด (หรือของวันที่กำหนด) สำหรับแต่ละ child (เอา record ล่าสุด)
 */
router.get('/today', async (req, res) => {
  const teacher_id = parseInt(req.query.teacher_id, 10);
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });

  try {
    // หา classroom ของครู
    const [trows] = await pool.query('SELECT classroom_id FROM teachers WHERE teacher_id = ?', [teacher_id]);
    if (!trows || trows.length === 0) return res.status(404).json({ error: 'teacher not found' });
    const classroom_id = trows[0].classroom_id;
    if (!classroom_id) return res.status(400).json({ error: 'teacher has no classroom assigned' });

    // ดึงเด็กในห้อง
    const [children] = await pool.query(
      `SELECT child_id, prefix, first_name, last_name, nickname
       FROM children
       WHERE classroom_id = ?`,
      [classroom_id]
    );

    // ถ้าไม่มี children ให้คืนค่าเปล่า
    if (!children || children.length === 0) {
      return res.json({ classroom_id, rows: [] });
    }

    const childIds = children.map(c => c.child_id);
    const placeholders = childIds.map(_ => '?').join(',');

    // ดึง latest health_evaluations ต่อ child (ใช้ subquery ตาม created_at)
    const [evals] = await pool.query(
      `SELECT h.* FROM health_evaluations h
       JOIN (
         SELECT child_id, MAX(created_at) AS max_created
         FROM health_evaluations
         WHERE child_id IN (${placeholders})
         GROUP BY child_id
       ) mx ON h.child_id = mx.child_id AND h.created_at = mx.max_created`,
      childIds
    );

    // map by child_id
    const evalMap = {};
    for (const e of evals) {
      evalMap[e.child_id] = e;
    }

    const rows = children.map(c => ({
      child_id: c.child_id,
      name: `${c.prefix ? c.prefix + ' ' : ''}${c.first_name} ${c.last_name}`,
      nickname: c.nickname,
      evaluation: evalMap[c.child_id] || null
    }));

    res.json({ classroom_id, rows });
  } catch (err) {
    console.error('GET /api/health/today err', err);
    res.status(500).json({ error: 'failed to fetch health evaluations' });
  }
});

/**
 * POST /api/health
 * รับ payload: { items: [{ child_id, hair, eye, mouth, tooth, ear, nose, skin, nail, note?, created_by? , evaluation_date? }]}
 * - บันทึกเป็น record ใหม่สำหรับแต่ละ item (เก็บเป็นประวัติ)
 */
router.post('/', async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let saved = 0;
    for (const it of items) {
      const child_id = it.child_id;
      if (!child_id) continue;
      const hair = it.hair || null;
      const eye = it.eye || null;
      const mouth = it.mouth || null;
      const tooth = it.tooth || null;
      const ear = it.ear || null;
      const nose = it.nose || null;
      const skin = it.skin || null;
      const nail = it.nail || null;
      const note = it.note || null;
      const created_by = it.created_by || null;
      // measurement date (optional) -> use current date/time if not provided
      // table has created_at default CURRENT_TIMESTAMP so we can ignore evaluation_date param

      await conn.query(
        `INSERT INTO health_evaluations
         (child_id, hair, eye, mouth, tooth, ear, nose, skin, nail, note, evaluated_by, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [child_id, hair, eye, mouth, tooth, ear, nose, skin, nail, note, created_by, created_by]
      );
      saved++;
    }
    await conn.commit();
    res.json({ ok: true, saved });
  } catch (err) {
    await conn.rollback();
    console.error('POST /api/health err', err);
    res.status(500).json({ error: 'failed to save health evaluations' });
  } finally {
    conn.release();
  }
});

module.exports = router;
