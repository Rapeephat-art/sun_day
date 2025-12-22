// backend/routes/students.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js');


/**
 * GET /api/student/:id
 * Returns aggregated student record
 */
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'invalid id' });

  try {
    // 1) child base
    const [childRows] = await pool.query('SELECT * FROM children WHERE child_id = ?', [id]);
    if (!childRows || childRows.length === 0) return res.status(404).json({ ok: false, error: 'not found' });
    const child = childRows[0];

    // 2) parents via relation
    const [parentRows] = await pool.query(`
      SELECT p.*, r.relation_type
      FROM parents p
      JOIN relation r ON r.parent_id = p.parent_id
      WHERE r.child_id = ?
    `, [id]);

    // 3) addresses (if exists)
    const [addrRows] = await pool.query('SELECT * FROM addresses WHERE child_id = ?', [id]);

    // 4) measurements / health / logs (optional tables)
    // adjust table names if different in your DB
    const [measureRows] = await pool.query('SELECT * FROM monthly_measurements WHERE child_id = ? ORDER BY measure_date DESC LIMIT 12', [id]).catch(()=>[]);
    const [healthRows] = await pool.query('SELECT * FROM health_evaluations WHERE child_id = ? ORDER BY evaluated_at DESC LIMIT 20', [id]).catch(()=>[]);
    const [logRows] = await pool.query('SELECT * FROM daily_activity_logs WHERE child_id = ? ORDER BY log_date DESC LIMIT 50', [id]).catch(()=>[]);

    res.json({
      ok: true,
      child,
      parents: parentRows,
      addresses: addrRows,
      measurements: measureRows || [],
      health: healthRows || [],
      logs: logRows || []
    });
  } catch (err) {
    console.error('student read err:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
