const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { teacher_id, classroom_id, term, year, scores } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // สร้างเอกสารประเมิน 1 ชุด
    const [result] = await conn.query(
      `
      INSERT INTO evaluation_sessions
      (teacher_id, classroom_id, term, year)
      VALUES (?, ?, ?, ?)
      `,
      [teacher_id, classroom_id, term, year]
    );

    const sessionId = result.insertId;

    // บันทึกคะแนน
    for (const s of scores) {
      await conn.query(
        `
        INSERT INTO evaluation_scores
        (session_id, child_id, indicator_key, score)
        VALUES (?, ?, ?, ?)
        `,
        [sessionId, s.child_id, s.indicator_key, s.score]
      );
    }

    await conn.commit();
    res.json({ message: "บันทึกผลการประเมินเรียบร้อย" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
