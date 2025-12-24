// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

/* layouts */
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import ParentLayout from "./layouts/ParentLayout";
import PublicLayout from "./layouts/PublicLayout";

/* pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* admin */
import AdminDashboard from "./pages/admin/AdminDashboard";

/* teacher */
import ChildrenInClass from "./pages/ChildrenInClass";

/* parent */
import MyChildren from "./pages/MyChildren";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <Routes>

      {/* ========== PUBLIC ========== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ========== ADMIN ========== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* ========== TEACHER ========== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher/children" element={<ChildrenInClass />} />
      </Route>

      {/* ========== PARENT ========== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/my-children" element={<MyChildren />} />
      </Route>

      {/* ========== FALLBACK ========== */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
