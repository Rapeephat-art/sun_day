// backend/routes/checkins.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // pool ของโปรเจค (mysql2)

// helper: แปลงสถานะจากไทย -> โค้ดที่เก็บใน DB
function statusToDb(statusThai) {
  if (!statusThai) return 'absent';
  const s = statusThai.toLowerCase();
  if (s === 'มา') return 'present';
  if (s === 'ลา') return 'excused';
  return 'absent';
}

// helper: แปลงสถานะจาก DB -> ไทย
function dbToStatusThai(dbStatus) {
  if (!dbStatus) return 'ขาด';
  if (dbStatus === 'present') return 'มา';
  if (dbStatus === 'excused') return 'ลา';
  return 'ขาด';
}

/**
 * GET /api/checkins/today?teacher_id=#
 * - หา classroom ของ teacher โดยใช้ teacher_id -> teachers.classroom_id
 * - ดึงเด็กในห้องนั้นจาก children
 * - ดึง checkin ของแต่ละเด็กสำหรับวันปัจจุบัน (ถ้ามี)
 */
router.get('/today', async (req, res) => {
  const teacher_id = parseInt(req.query.teacher_id, 10);
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });

  try {
    // หา classroom ของครู
    const [trows] = await pool.query('SELECT classroom_id FROM teachers WHERE teacher_id = ?', [teacher_id]);
    if (!trows || trows.length === 0) {
      return res.status(404).json({ error: 'teacher not found or no classroom assigned' });
    }
    const classroom_id = trows[0].classroom_id;
    if (!classroom_id) {
      return res.status(400).json({ error: 'teacher has no classroom assigned' });
    }

    // ดึงเด็กในห้อง
    const [children] = await pool.query(
      `SELECT child_id, prefix, first_name, last_name, nickname
       FROM children
       WHERE classroom_id = ?`,
      [classroom_id]
    );

    // ดึง checkins สำหรับวันนี้ (ใช้ DATE(created_at) = CURDATE())
    const [checks] = await pool.query(
      `SELECT checkin_id, child_id, status, node, created_by, created_at
       FROM checkins
       WHERE DATE(created_at) = CURDATE()
         AND child_id IN (${children.map(_ => '?').join(',')})`,
      children.map(c => c.child_id)
    );

    // map results
    const checkMap = {};
    for (const ch of checks) {
      checkMap[ch.child_id] = {
        checkin_id: ch.checkin_id,
        status: dbToStatusThai(ch.status),
        note: ch.node,
        created_by: ch.created_by,
        created_at: ch.created_at
      };
    }

    // สร้างรายการส่งกลับ (เด็ก + สถานะถ้ามี)
    const rows = children.map(c => ({
      child_id: c.child_id,
      name: `${c.prefix ? c.prefix + ' ' : ''}${c.first_name} ${c.last_name}`,
      nickname: c.nickname,
      status: (checkMap[c.child_id] && checkMap[c.child_id].status) || 'ขาด',
      note: checkMap[c.child_id] ? checkMap[c.child_id].note : null,
      checkin_id: checkMap[c.child_id] ? checkMap[c.child_id].checkin_id : null
    }));

    res.json({ date: (new Date()).toISOString().slice(0,10), classroom_id, rows });
  } catch (err) {
    console.error('GET /api/checkins/today err', err);
    res.status(500).json({ error: 'failed to fetch todays checkins' });
  }
});

/**
 * POST /api/checkins
 * บันทึกหรืออัปเดตเช็คชื่อของเด็กคนเดียว
 * body: { child_id, status: "มา"|"ขาด"|"ลา", note?, created_by? }
 *
 * Behavior:
 * - ถ้าในวันนี้มีบันทึกแล้วสำหรับ child_id -> UPDATE (status/node)
 * - มิฉะนั้น INSERT ใหม่
 */
router.post('/', async (req, res) => {
  const { child_id, status = 'ขาด', note = null, created_by = null } = req.body;
  if (!child_id) return res.status(400).json({ error: 'child_id required' });

  const dbStatus = statusToDb(status);

  try {
    // หา existing record for today
    const [existing] = await pool.query(
      `SELECT checkin_id FROM checkins WHERE child_id = ? AND DATE(created_at) = CURDATE() LIMIT 1`,
      [child_id]
    );

    if (existing.length > 0) {
      // update
      const checkin_id = existing[0].checkin_id;
      await pool.query(
        `UPDATE checkins SET status = ?, node = ?, created_by = ?, created_at = CURRENT_TIMESTAMP WHERE checkin_id = ?`,
        [dbStatus, note, created_by, checkin_id]
      );
      return res.json({ ok: true, action: 'updated', checkin_id });
    } else {
      // insert
      const [ins] = await pool.query(
        `INSERT INTO checkins (child_id, status, node, created_by, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [child_id, dbStatus, note, created_by]
      );
      return res.json({ ok: true, action: 'inserted', checkin_id: ins.insertId });
    }
  } catch (err) {
    console.error('POST /api/checkins err', err);
    res.status(500).json({ error: 'failed to save checkin' });
  }
});

module.exports = router;
