const express = require('express');
const router = express.Router();
const pool = require('../db.js');

const { authMiddleware, permit } = require('../middlewares/auth');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun } = require('docx');

/* =====================================================
   ATTENDANCE (ของเดิม)
===================================================== */

// POST /api/teacher/attendance
router.post(
  '/attendance',
  authMiddleware,
  permit('teacher'),
  async (req, res) => {
    const records = req.body.records || [];
    try {
      const promises = records.map(r =>
        pool.query(
          `
          INSERT INTO attendance
          (child_id, att_date, status, recorded_by, created_at)
          VALUES (?, ?, ?, ?, NOW())
          `,
          [r.child_id, r.date, r.status, req.user.id]
        )
      );

      await Promise.all(promises);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'save attendance failed' });
    }
  }
);

// GET /api/teacher/attendance/export?date=YYYY-MM-DD
router.get(
  '/attendance/export',
  authMiddleware,
  permit('teacher'),
  async (req, res) => {
    const date = req.query.date;
    try {
      const [rows] = await pool.query(
        `
        SELECT a.*, c.first_name AS child_name
        FROM attendance a
        JOIN children c ON a.child_id = c.child_id
        WHERE a.att_date = ? AND a.recorded_by = ?
        `,
        [date, req.user.id]
      );

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Attendance');

      ws.addRow(['Child', 'Date', 'Status', 'RecordedBy']);
      rows.forEach(r => {
        ws.addRow([
          r.child_name,
          r.att_date,
          r.status,
          req.user.username || req.user.id
        ]);
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance-${date}.xlsx`
      );

      await wb.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'export failed' });
    }
  }
);

// GET /api/teacher/attendance/export-word
router.get(
  '/attendance/export-word',
  authMiddleware,
  permit('teacher'),
  async (req, res) => {
    const date = req.query.date;
    try {
      const [rows] = await pool.query(
        `
        SELECT a.*, c.first_name AS child_name
        FROM attendance a
        JOIN children c ON a.child_id = c.child_id
        WHERE a.att_date = ? AND a.recorded_by = ?
        `,
        [date, req.user.id]
      );

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Attendance report ${date}`,
                    bold: true
                  })
                ]
              }),
              ...rows.map(r =>
                new Paragraph(`${r.child_name} — ${r.status}`)
              )
            ]
          }
        ]
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance-${date}.docx`
      );
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'export word failed' });
    }
  }
);

/* =====================================================
   EVALUATION (เพิ่มใหม่)
===================================================== */

// POST /api/teacher/evaluations
router.post(
  '/evaluations',
  authMiddleware,
  permit('teacher'),
  async (req, res) => {
    const { classroom_id, term, year, scores } = req.body;
    const teacher_id = req.user.id;

    if (!scores || scores.length === 0) {
      return res.status(400).json({ error: 'no scores provided' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // สร้างเอกสารประเมิน 1 ชุด
      const [result] = await conn.query(
        `
        INSERT INTO evaluation_sessions
        (teacher_id, classroom_id, term, year, created_at)
        VALUES (?, ?, ?, ?, NOW())
        `,
        [teacher_id, classroom_id, term, year]
      );

      const session_id = result.insertId;

      // บันทึกคะแนนรายเด็ก
      const promises = scores.map(s =>
        conn.query(
          `
          INSERT INTO evaluation_scores
          (session_id, child_id, indicator_key, score)
          VALUES (?, ?, ?, ?)
          `,
          [session_id, s.child_id, s.indicator_key, s.score]
        )
      );

      await Promise.all(promises);
      await conn.commit();

      res.json({ ok: true, session_id });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: 'save evaluation failed' });
    } finally {
      conn.release();
    }
  }
);

module.exports = router;
