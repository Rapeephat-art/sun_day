const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../middlewares/auth");


/* ===== multer setup ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/enrollments");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================================================
   POST /api/enrollments
   สมัครเรียน (ข้อมูล + ไฟล์)
========================================================= */
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "child_birth_certificate" },
    { name: "child_house_reg" },
    { name: "father_idcard_file" },
    { name: "father_house_reg" },
    { name: "mother_idcard_file" },
    { name: "mother_house_reg" }
  ]),
  async (req, res) => {
    try {
      const payload = JSON.parse(req.body.payload);

      const files = {};
      if (req.files) {
        Object.keys(req.files).forEach(k => {
          files[k] = req.files[k][0].path;
        });
      }

      await pool.query(
        `
        INSERT INTO enrollments
          (status, extra_json, files_json, created_by, created_at)
        VALUES
          ('pending', ?, ?, ?, NOW())
        `,
        [
          JSON.stringify(payload),
          JSON.stringify(files),
          req.user.user_id   // ✅ ถูกต้อง
        ]
      );

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);
/* =========================================================
   GET /api/enrollments
   Admin ดูรายการสมัครทั้งหมด
========================================================= */
// ⭐ ต้องมาก่อน
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM enrollments
      WHERE created_by = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [req.user.user_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "load my enrollment failed" });
  }
});

/* =========================================================
   GET /api/enrollments
   Admin
========================================================= */
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM enrollments ORDER BY enrollment_id DESC"
  );
  res.json(rows);
});
/* =========================================================
   PUT /api/enrollments/:id/approve
   อนุมัติ + สร้าง child อัตโนมัติ
========================================================= */
router.put("/:id/approve", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) ดึง enrollment
    const [enRows] = await conn.query(
      "SELECT * FROM enrollments WHERE enrollment_id = ?",
      [req.params.id]
    );
    if (enRows.length === 0) throw new Error("Enrollment not found");

    const enrollment = enRows[0];
    const data =
      typeof enrollment.extra_json === "string"
        ? JSON.parse(enrollment.extra_json)
        : enrollment.extra_json;

    // 2) update status
    await conn.query(
      "UPDATE enrollments SET status = 'approved' WHERE enrollment_id = ?",
      [req.params.id]
    );

    // 3) create child
    const [result] = await conn.query(
      `
      INSERT INTO children
        (
          enrollment_id,
          prefix,
          first_name,
          last_name,
          nickname,
          birth_date,
          citizen_id,
          enter_study,
          note
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        enrollment.enrollment_id,
        data.student_prefix || null,
        data.student_firstname || null,
        data.student_lastname || null,
        data.student_nickname || null,
        data.birth_date || null,
        data.student_idcard || null,
        "สร้างจากการสมัครเรียน"
      ]
    );

    await conn.commit();

    res.json({
      ok: true,
      child_id: result.insertId
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* =========================================================
   PUT /api/enrollments/:id/reject
========================================================= */
router.put("/:id/reject", async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "reason required" });
    }

    await pool.query(
      `
      UPDATE enrollments
      SET status = 'rejected',
          note = ?
      WHERE enrollment_id = ?
      `,
      [note, req.params.id]
    );

    res.json({ message: "rejected with reason" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "reject failed" });
  }
});
// ดึงการสมัครของผู้ปกครอง (ของตัวเอง)



module.exports = router;
