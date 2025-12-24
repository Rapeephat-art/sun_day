require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express(); 

// ================= CORS =================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sun-day-seven.vercel.app" // << ใส่โดเมนจริง
  ],
  credentials: true
}));



// ================= Middlewares =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ================= Upload dir =================
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ================= Helper =================
function safeRequireRoute(relPath) {
  try {
    return require(relPath);
  } catch (err) {
    console.error(`[routes] failed loading ${relPath}:`, err.message);
    return null;
  }
}

// ================= Routes =================
const authRoutes           = safeRequireRoute('./routes/auth.routes');
const childrenRoutes       = safeRequireRoute('./routes/children.routes');
const announcementsRoutes  = safeRequireRoute('./routes/announcements.routes');
const filesRoutes          = safeRequireRoute('./routes/files.routes');
const enrollmentsRoutes    = safeRequireRoute('./routes/enrollments.routes');
const teacherRoutes        = safeRequireRoute('./routes/teacher.routes');
const admissionRoutes      = safeRequireRoute('./routes/admissions.routes');
const studentsRoutes       = safeRequireRoute('./routes/students.routes');
const measurementsRoutes   = safeRequireRoute('./routes/measurements.routes');
const healthRoutes         = safeRequireRoute('./routes/health.routes');
const brushingsRoutes      = safeRequireRoute('./routes/brushings.routes');
const milkRoutes           = safeRequireRoute('./routes/milk.routes');
const lunchRoutes          = safeRequireRoute('./routes/lunch.routes');
const lunchEatingRoutes    = safeRequireRoute('./routes/lunchEating.routes');
const adminUsersRoutes     = safeRequireRoute('./routes/admin.users.routes');
const childrenClassRoutes  = safeRequireRoute('./routes/children.class.routes');
const menusRoutes          = safeRequireRoute('./routes/menus.routes');
const dailyMenuRoutes      = safeRequireRoute('./routes/daily.menu.routes');
const centersRoutes        = safeRequireRoute('./routes/centers.routes');

// ================= Register =================
if (authRoutes)           app.use('/api/auth', authRoutes);
if (centersRoutes)        app.use('/api/centers', centersRoutes);
if (childrenRoutes)       app.use('/api/children', childrenRoutes);
if (childrenClassRoutes)  app.use('/api/children/class', childrenClassRoutes);
if (announcementsRoutes)  app.use('/api/announcements', announcementsRoutes);
if (filesRoutes)          app.use('/api/files', filesRoutes);
if (enrollmentsRoutes)    app.use('/api/enrollments', enrollmentsRoutes);
if (teacherRoutes)        app.use('/api/teacher', teacherRoutes);
if (admissionRoutes)      app.use('/api/admission', admissionRoutes);
if (studentsRoutes)       app.use('/api/student', studentsRoutes);
if (measurementsRoutes)   app.use('/api/measurements', measurementsRoutes);
if (healthRoutes)         app.use('/api/health', healthRoutes);
if (brushingsRoutes)      app.use('/api/brushings', brushingsRoutes);
if (milkRoutes)           app.use('/api/milk', milkRoutes);
if (lunchRoutes)          app.use('/api/lunch', lunchRoutes);
if (lunchEatingRoutes)    app.use('/api/lunch-eating', lunchEatingRoutes);
if (adminUsersRoutes)     app.use('/api/admin/users', adminUsersRoutes);
if (menusRoutes)          app.use('/api/menus', menusRoutes);
if (dailyMenuRoutes)      app.use('/api/daily-menu', dailyMenuRoutes);

// ================= Health check =================
app.get('/ping', (req, res) => {
  res.json({ ok: true });
});

// ================= Start =================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
