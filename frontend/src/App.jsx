// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

/* ===== Layouts ===== */
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import ParentLayout from "./layouts/ParentLayout";

/* ===== Public ===== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Announcements from "./pages/Announcements";

/* ===== Admin ===== */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/AdminEnrollments";

/* ===== Teacher ===== */
import ChildrenInClass from "./pages/ChildrenInClass";
import CheckinPage from "./pages/Checkin";

/* ===== Parent ===== */
import Enrollment from "./pages/Enrollment";
import MyEnrollment from "./pages/MyEnrollment";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // โหลด user จาก localStorage
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
        </Route>

        {/* ================= TEACHER ================= */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="children" element={<ChildrenInClass />} />
          <Route path="checkin" element={<CheckinPage />} />
        </Route>

        {/* ================= PARENT ================= */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="enroll" element={<Enrollment />} />
          <Route path="my-enrollment" element={<MyEnrollment />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
