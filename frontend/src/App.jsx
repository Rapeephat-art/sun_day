// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet
} from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

/* ===== Public ===== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Announcements from "./pages/Announcements";

/* ===== Admin ===== */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

/* ===== Teacher ===== */
import ChildrenInClass from "./pages/ChildrenInClass";

/* ===== Parent ===== */
import MyEnrollment from "./pages/MyEnrollment";
import MyChildren from "./pages/MyChildren";
import ParentLayout from "./layouts/ParentLayout";

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");

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
      {/* แสดง NavBar เฉพาะหน้าไม่ใช่ admin */}
      {!isAdminPage && <NavBar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* ===== ADMIN ===== */}
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
        </Route>

        {/* ===== TEACHER ===== */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ChildrenInClass />
            </ProtectedRoute>
          }
        />

        {/* ===== PARENT ===== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="my-enrollment" element={<MyEnrollment />} />
          <Route path="my-children" element={<MyChildren />} />
        </Route>

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
