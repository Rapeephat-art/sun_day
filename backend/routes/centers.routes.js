const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT center_id, name FROM centers"
    );
    res.json(rows);
  } catch (err) {
    console.error("CENTERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
