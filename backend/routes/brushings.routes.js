// backend/routes/brushings.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js');

/**
 * GET /api/brushings/today?teacher_id=#
 * - หา classroom ของ teacher -> ดึง children ห้องนั้น
 * - ดึง daily_activity_logs สำหรับ activity_type = 'tooth_brushing' ในวันปัจจุบัน
 */
router.get('/today', async (req, res) => {
  const teacher_id = parseInt(req.query.teacher_id, 10);
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });

  try {
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

    if (!children || children.length === 0) {
      return res.json({ classroom_id, rows: [] });
    }

    const childIds = children.map(c => c.child_id);
    const placeholders = childIds.map(_ => '?').join(',');

    // ดึง activity สำหรับวันนี้ (activity_type = 'tooth_brushing')
    const [logs] = await pool.query(
      `SELECT daily_log_id, child_id, activity_type, activity_date, stutus, note, created_by, created_at
       FROM daily_activity_logs
       WHERE activity_type = 'tooth_brushing'
         AND child_id IN (${placeholders})
         AND DATE(created_at) = CURDATE()`,
      childIds
    );

    const logMap = {};
    for (const l of logs) {
      logMap[l.child_id] = l;
    }

    const rows = children.map(c => ({
      child_id: c.child_id,
      name: `${c.prefix ? c.prefix + ' ' : ''}${c.first_name} ${c.last_name}`,
      nickname: c.nickname,
      brushed: !!logMap[c.child_id],
      log: logMap[c.child_id] || null
    }));

    res.json({ classroom_id, date: (new Date()).toISOString().slice(0,10), rows });
  } catch (err) {
    console.error('GET /api/brushings/today err', err);
    res.status(500).json({ error: 'failed to fetch brushings' });
  }
});

/**
 * POST /api/brushings
 * payload: { items: [{ child_id, status?, note?, created_by? }] }
 * - status / note จะเก็บลงคอลัมน์ `stutus` และ `note`
 * - ถ้ามีบันทึกในวันนี้สำหรับ child_id อยู่แล้ว จะไม่ insert ซ้ำ (หรือจะ update ก็ได้) — ตอนนี้จะ INSERT ใหม่ถ้าไม่มี, ถ้ามีแล้วจะ UPDATE created_at/สเตตัส
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
      const status = it.status || 'done';
      const note = it.note || null;
      const created_by = it.created_by || null;

      // ตรวจมี record วันนี้หรือไม่
      const [exist] = await conn.query(
        `SELECT daily_log_id FROM daily_activity_logs WHERE child_id = ? AND activity_type = 'tooth_brushing' AND DATE(created_at) = CURDATE() LIMIT 1`,
        [child_id]
      );

      if (exist.length > 0) {
        // update (ถ้าต้องการบันทึกเวลา/หมายเหตุใหม่)
        await conn.query(
          `UPDATE daily_activity_logs SET stutus = ?, note = ?, created_by = ?, created_at = CURRENT_TIMESTAMP WHERE daily_log_id = ?`,
          [status, note, created_by, exist[0].daily_log_id]
        );
        saved++;
      } else {
        // insert ใหม่
        await conn.query(
          `INSERT INTO daily_activity_logs (child_id, activity_type, activity_date, stutus, note, created_by, created_at)
           VALUES (?, 'tooth_brushing', CURDATE(), ?, ?, ?, CURRENT_TIMESTAMP)`,
          [child_id, status, note, created_by]
        );
        saved++;
      }
    }
    await conn.commit();
    res.json({ ok: true, saved });
  } catch (err) {
    await conn.rollback();
    console.error('POST /api/brushings err', err);
    res.status(500).json({ error: 'failed to save brushings' });
  } finally {
    conn.release();
  }
});

module.exports = router;
