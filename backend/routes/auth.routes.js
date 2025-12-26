const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("username, role, password")
    .eq("username", username)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: "user not found" });
  }

  if (data.password !== password) {
    return res.status(401).json({ error: "wrong password" });
  }

  res.json({
    token: "test-token",
    user: {
      username: data.username,
      role: data.role,
    },
  });
});

module.exports = router;
