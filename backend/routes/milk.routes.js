// backend/routes/milk.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // ปรับ path ตามโปรเจคของคุณ

// helper : parse note (JSON) saved previously
function parseNoteJSON(note) {
  if (!note) return null;
  try {
    return JSON.parse(note);
  } catch (e) {
    // หากเป็นสตริงแบบเก่า ให้คืนเป็น raw
    return { raw: note };
  }
}

// GET /api/milk/today?teacher_id=#
router.get('/today', async (req, res) => {
  const teacher_id = parseInt(req.query.teacher_id, 10);
  const date = req.query.date || new Date().toISOString().slice(0,10);
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });

  try {
    // หา classroom ของครู
    const [trows] = await pool.query('SELECT classroom_id FROM teachers WHERE teacher_id = ?', [teacher_id]);
    if (!trows || trows.length === 0) return res.status(404).json({ error: 'teacher not found' });
    const classroom_id = trows[0].classroom_id;

    // ดึงเด็กในห้อง
    const [children] = await pool.query(
      `SELECT child_id, prefix, first_name, last_name, nickname
       FROM children WHERE classroom_id = ? ORDER BY first_name, last_name`,
      [classroom_id]
    );
    if (!children || children.length === 0) return res.json({ date, classroom_id, rows: [] });

    const childIds = children.map(c => c.child_id);
    const placeholders = childIds.map(_ => '?').join(',');

    // ดึง logs สำหรับ activity_type = 'milk_drinking' ในวันนั้น
    const [logs] = await pool.query(
      `SELECT daily_log_id, child_id, stutus, note, created_by, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
       FROM daily_activity_logs
       WHERE activity_type = 'milk_drinking'
         AND DATE(created_at) = ?
         AND child_id IN (${placeholders})`,
      [date, ...childIds]
    );

    const logMap = {};
    for (const l of logs) {
      logMap[l.child_id] = l;
    }

    const rows = children.map(c => {
      const lg = logMap[c.child_id];
      const parsed = lg ? parseNoteJSON(lg.note) : null;
      return {
        child_id: c.child_id,
        name: `${c.prefix ? c.prefix + ' ' : ''}${c.first_name} ${c.last_name}`,
        nickname: c.nickname,
        status: lg ? lg.stutus : 'not',
        note: lg ? lg.note : '',
        log_id: lg ? lg.daily_log_id : null,
        milk: parsed ? parsed : { amount_ml: '', milk_type: '', time: '' } // amount_ml, milk_type, time
      };
    });

    res.json({ date, classroom_id, rows });
  } catch (err) {
    console.error('/api/milk/today err', err);
    res.status(500).json({ error: 'failed to fetch milk drinking data' });
  }
});

// POST /api/milk/save
// payload: { teacher_id, date (opt), items: [{ child_id, status, milk: { amount_ml, milk_type, time }, log_id? }] }
router.post('/save', async (req, res) => {
  const { teacher_id, date, items } = req.body;
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const theDate = date || new Date().toISOString().slice(0,10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let saved = 0;

    for (const it of items) {
      const child_id = it.child_id;
      const status = it.status || 'not';
      const milk = it.milk || {};
      // store milk info in note as JSON string
      const noteObj = {
        amount_ml: milk.amount_ml || null,
        milk_type: milk.milk_type || null,
        time: milk.time || null
      };
      const noteStr = JSON.stringify(noteObj);
      const log_id = it.log_id || null;

      if (log_id) {
        // update existing log
        await conn.query(
          `UPDATE daily_activity_logs
           SET stutus = ?, note = ?, created_by = ?, created_at = CURRENT_TIMESTAMP
           WHERE daily_log_id = ?`,
          [status, noteStr, teacher_id, log_id]
        );
        saved++;
      } else {
        // check existing log for that child & date
        const [exist] = await conn.query(
          `SELECT daily_log_id FROM daily_activity_logs
           WHERE child_id = ? AND activity_type = 'milk_drinking' AND DATE(created_at) = ? LIMIT 1`,
          [child_id, theDate]
        );

        if (exist.length > 0) {
          await conn.query(
            `UPDATE daily_activity_logs
             SET stutus = ?, note = ?, created_by = ?, created_at = CURRENT_TIMESTAMP
             WHERE daily_log_id = ?`,
            [status, noteStr, teacher_id, exist[0].daily_log_id]
          );
          saved++;
        } else {
          // insert new
          await conn.query(
            `INSERT INTO daily_activity_logs (child_id, activity_type, activity_date, stutus, note, created_by, created_at)
             VALUES (?, 'milk_drinking', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [child_id, theDate, status, noteStr, teacher_id]
          );
          saved++;
        }
      }
    }

    await conn.commit();
    res.json({ ok: true, saved });
  } catch (err) {
    await conn.rollback();
    console.error('/api/milk/save err', err);
    res.status(500).json({ error: 'failed to save milk drinking data' });
  } finally {
    conn.release();
  }
});

module.exports = router;
