// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

/* ===== Public ===== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Announcements from "./pages/Announcements";

/* ===== Admin ===== */
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AnnouncementForm from "./pages/AnnouncementForm";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminEnrollments from "./pages/AdminEnrollments";
import ChildrenCount from "./pages/ChildrenCount";
import AdminMenus from "./pages/AdminMenus";
import AdminDailyMenu from "./pages/AdminDailyMenu";
import AdminDashboard from "./pages/admin/AdminDashboard";

/* ===== Children / Enrollment ===== */
import Children from "./pages/Children";
import ChildDetail from "./pages/ChildDetail";
import Enrollment from "./pages/Enrollment";
import EnrollmentStatus from "./pages/EnrollmentStatus";
import MyEnrollment from "./pages/MyEnrollment";

/* ===== Teacher ===== */
import ChildrenInClass from "./pages/ChildrenInClass";
import CheckinPage from "./pages/Checkin";
import MeasurementsPage from "./pages/Measurements";
import HealthPage from "./pages/Health";
import BrushingsPage from "./pages/Brushings";
import MilkPage from "./pages/Milk";
import LunchPage from "./pages/Lunch";
import LunchEating from "./pages/LunchEating";
/* ===== Evaluation ===== */
import DesiredTraitsTable from "./pages/evaluation/DesiredTraitsTable";


function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // เช็กว่าเป็นหน้า Admin หรือไม่
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      {/* แสดง NavBar เฉพาะหน้าไม่ใช่ Admin */}
      {!isAdminPage && (
        <NavBar user={user} onLogout={handleLogout} />
      )}

      {/* หน้า Admin ไม่ใช้ site-wrapper */}
      {isAdminPage ? (
        <Routes>
          {/* ===== Admin (Protected) ===== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="children-count" element={<ChildrenCount />} />

            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="announcements/new" element={<AnnouncementForm />} />
            <Route path="announcements/:id" element={<AnnouncementDetail />} />
            <Route path="announcements/:id/edit" element={<AnnouncementForm />} />

            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="menus" element={<AdminMenus />} />
            <Route path="daily-menu" element={<AdminDailyMenu />} />
          </Route>
        </Routes>
      ) : (
        <div className="site-wrapper">
          <Routes>
            {/* ===== Public ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/enrollments/my" element={<MyEnrollment />} />

            {/* ===== Children / Enrollment ===== */}
            <Route path="/children" element={<Children />} />
            <Route path="/children/:id" element={<ChildDetail />} />
            <Route path="/enroll" element={<Enrollment />} />
            <Route path="/enrollment-status" element={<EnrollmentStatus />} />

            {/* ===== Teacher ===== */}
            <Route path="/teacher/children" element={<ChildrenInClass />} />
            <Route path="/teacher/checkin" element={<CheckinPage />} />
            <Route path="/teacher/:teacherId/checkin" element={<CheckinPage />} />
            <Route path="/teacher/measurements" element={<MeasurementsPage />} />
            <Route path="/teacher/:teacherId/measurements" element={<MeasurementsPage />} />
            <Route path="/teacher/health" element={<HealthPage />} />
            <Route path="/teacher/:teacherId/health" element={<HealthPage />} />
            <Route path="/teacher/brushings" element={<BrushingsPage />} />
            <Route path="/teacher/:teacherId/brushings" element={<BrushingsPage />} />
            <Route path="/teacher/lunch" element={<LunchPage />} />
            <Route path="/teacher/:teacherId/lunch" element={<LunchPage />} />
            <Route path="/teacher/lunch-eating" element={<LunchEating />} />
            <Route path="/teacher/:teacherId/lunch-eating" element={<LunchEating />} />
            <Route path="/teacher/milk" element={<MilkPage />} />
            <Route path="/teacher/:teacherId/milk" element={<MilkPage />} />

            <Route path="/teacher/evaluation/desired-traits" element={<DesiredTraitsTable />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
