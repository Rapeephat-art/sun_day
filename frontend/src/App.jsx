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

/* ===== Parent ===== */
import Enrollment from "./pages/Enrollment";
import EnrollmentStatus from "./pages/EnrollmentStatus";
import MyEnrollment from "./pages/MyEnrollment";
import Children from "./pages/Children";
import ChildDetail from "./pages/ChildDetail";

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
      {!isAdminPage && (
        <NavBar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />

        {/* ================= ADMIN ================= */}
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

        {/* ================= PARENT ================= */}
        <Route
          path="/enroll"
          element={
            <ProtectedRoute role="parent">
              <Enrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment-status"
          element={
            <ProtectedRoute role="parent">
              <EnrollmentStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/my"
          element={
            <ProtectedRoute role="parent">
              <MyEnrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/children"
          element={
            <ProtectedRoute role="parent">
              <Children />
            </ProtectedRoute>
          }
        />
        <Route
          path="/children/:id"
          element={
            <ProtectedRoute role="parent">
              <ChildDetail />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER ================= */}
        <Route
          path="/teacher/children"
          element={
            <ProtectedRoute role="teacher">
              <ChildrenInClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/checkin"
          element={
            <ProtectedRoute role="teacher">
              <CheckinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/measurements"
          element={
            <ProtectedRoute role="teacher">
              <MeasurementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/health"
          element={
            <ProtectedRoute role="teacher">
              <HealthPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/brushings"
          element={
            <ProtectedRoute role="teacher">
              <BrushingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lunch"
          element={
            <ProtectedRoute role="teacher">
              <LunchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lunch-eating"
          element={
            <ProtectedRoute role="teacher">
              <LunchEating />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/milk"
          element={
            <ProtectedRoute role="teacher">
              <MilkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/evaluation/desired-traits"
          element={
            <ProtectedRoute role="teacher">
              <DesiredTraitsTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
