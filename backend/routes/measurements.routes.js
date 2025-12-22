// backend/routes/measurements.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // mysql2 pool ของโปรเจค

/**
 * GET /api/measurements/today?teacher_id=#
 * - หา classroom ของ teacher -> ดึง children ของห้องเดียวกัน
 * - ดึง measurement ล่าสุดสำหรับเดือน/ปีปัจจุบัน (ถ้ามี) เพื่อแสดงค่าเดิม
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
       FROM children WHERE classroom_id = ?`,
      [classroom_id]
    );

    // เรียก measurement ล่าสุดของแต่ละ child สำหรับเดือน/ปีปัจจุบัน
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // ดึง measurements สำหรับเดือนนี้
    const childIds = children.map(c => c.child_id);
    let measurements = [];
    if (childIds.length > 0) {
      const placeholders = childIds.map(_ => '?').join(',');
      const [rows] = await pool.query(
        `SELECT m.*, DATE_FORMAT(m.measurement_date, '%Y-%m-%d') as measurement_date_str
         FROM monthly_measurements m
         WHERE m.child_id IN (${placeholders})
           AND YEAR(m.measurement_date) = ?
           AND MONTH(m.measurement_date) = ?`,
        [...childIds, year, month]
      );
      measurements = rows;
    }

    // map by child_id
    const measureMap = {};
    for (const m of measurements) {
      measureMap[m.child_id] = {
        measurement_id: m.measurement_id,
        measurement_date: m.measurement_date_str,
        weight: m.weight,
        height: m.height,
        note: m.note
      };
    }

    const rowsOut = children.map(c => ({
      child_id: c.child_id,
      name: `${c.prefix ? c.prefix + ' ' : ''}${c.first_name} ${c.last_name}`,
      nickname: c.nickname,
      measurement: measureMap[c.child_id] || null
    }));

    res.json({ classroom_id, year, month, rows: rowsOut });
  } catch (err) {
    console.error('GET /api/measurements/today err', err);
    res.status(500).json({ error: 'failed to fetch measurements' });
  }
});

/**
 * POST /api/measurements
 * - บันทึก batch measurements (items array)
 * payload: { items: [{ child_id, measurement_date (YYYY-MM-DD), weight, height, note, created_by }] }
 *
 * Behavior:
 * - Insert new record for each item. (ให้เก็บหลาย record เป็น history)
 * - ถ้าต้องการ update แทน insert ต้องเปลี่ยน logic — ปัจจุบันเก็บเป็นประวัติใหม่
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
      const measurement_date = it.measurement_date || new Date().toISOString().slice(0,10);
      const weight = it.weight || null;
      const height = it.height || null;
      const note = it.note || null;
      const created_by = it.created_by || null;

      // หากไม่มี weight && height ให้ข้าม
      if ((weight === null || weight === '') && (height === null || height === '')) continue;

      await conn.query(
        `INSERT INTO monthly_measurements (measurement_date, weight, height, note, created_by, child_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [measurement_date, weight, height, note, created_by, child_id]
      );
      saved++;
    }

    await conn.commit();
    res.json({ ok: true, saved });
  } catch (err) {
    await conn.rollback();
    console.error('POST /api/measurements err', err);
    res.status(500).json({ error: 'failed to save measurements' });
  } finally {
    conn.release();
  }
});

module.exports = router;
