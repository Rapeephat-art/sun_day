require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* ===== CORS (สำคัญมาก) ===== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sun-day-seven.vercel.app" // 👈 frontend จริง
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== routes ===== */
app.use("/api/auth", require("./routes/auth.routes"));

/* ===== health check ===== */
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

/* ===== start ===== */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
