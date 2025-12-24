require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

/* ===== CORS ===== */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sun-day-seven.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

/* ===== upload dir ===== */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ===== routes ===== */
app.use('/api/auth', require('./routes/auth.routes'));

/* ===== health check ===== */
app.get('/ping', (req, res) => {
  res.json({ ok: true });
});

/* ===== start server ===== */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});
