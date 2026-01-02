const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/auth/login
 * body: { username, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // debug เห็นค่าที่ส่งมาแน่ ๆ
    console.log("LOGIN BODY:", { username, password });

    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("username, role, password")
      .eq("username", username)
      .single();

    if (error || !data) {
      console.log("LOGIN FAIL: user not found");
      return res.status(401).json({ error: "user not found" });
    }

    // เทียบ plain text ตรง ๆ (ตามระบบปัจจุบัน)
    if (data.password !== password) {
      console.log("LOGIN FAIL: wrong password");
      return res.status(401).json({ error: "wrong password" });
    }

    // ผ่าน
    console.log("LOGIN OK:", data.username);

    return res.json({
      token: "test-token",
      user: {
        username: data.username,
        role: data.role,
      },
    });
  } catch (err) {
    console.error("LOGIN SERVER ERROR:", err);
    return res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
