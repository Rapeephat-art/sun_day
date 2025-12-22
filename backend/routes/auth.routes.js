// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // ป้องกัน body ว่าง
  if (!username || !password) {
    return res.status(400).json({
      error: "username and password required"
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        user_id,
        username,
        password,
        role,
        teacher_id,
        parent_id,
        center_id
      FROM users
      WHERE username = ?
      `,
      [username.trim()]
    );

    // ไม่พบ user
    if (rows.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const user = rows[0];

    // เทียบ password (รองรับ string / number / ช่องว่าง)
    if (
      String(user.password).trim() !==
      String(password).trim()
    ) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // สร้าง JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ไม่ส่ง password กลับ
    delete user.password;

    res.json({
      message: "login success",
      token,
      user
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "login failed" });
  }
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const {
    center_id,
    prefix,
    first_name,
    last_name,
    phone,
    email,
    username,
    password
  } = req.body;

  if (!center_id || !username || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ตรวจ username ซ้ำ
    const [dup] = await conn.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );
    if (dup.length > 0) {
      throw new Error("username นี้ถูกใช้งานแล้ว");
    }

    // insert parents
    const [p] = await conn.query(
      `
      INSERT INTO parents
      (prefix, first_name, last_name, phone, email)
      VALUES (?, ?, ?, ?, ?)
      `,
      [prefix, first_name, last_name, phone, email]
    );

    // insert users (ต้องมี center_id)
    await conn.query(
      `
      INSERT INTO users
      (username, password, role, parent_id, center_id)
      VALUES (?, ?, 'parent', ?, ?)
      `,
      [username, password, p.insertId, center_id]
    );

    await conn.commit();
    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });

  } catch (err) {
    await conn.rollback();
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});



module.exports = router;
