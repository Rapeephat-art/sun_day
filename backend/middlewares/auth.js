// backend/middlewares/auth.js
const jwt = require("jsonwebtoken");
const pool = require("../db");
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      `
      SELECT
        user_id,
        username,
        role,
        teacher_id,
        parent_id,
        center_id
      FROM users
      WHERE user_id = ?
      `,
      [payload.user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "unauthorized" });

    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authMiddleware };
