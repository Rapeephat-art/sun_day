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
    .select("username, password, role")
    .eq("username", username)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  if (String(data.password) !== String(password)) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  res.json({
    token: "test-token",
    user: {
      username: data.username,
      role: data.role
    }
  });
});

module.exports = router;
