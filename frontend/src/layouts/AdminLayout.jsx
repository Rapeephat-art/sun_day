import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import AdminTopBar from "../pages/admin/AdminTopBar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Top bar */}
      <AdminTopBar user={user} onLogout={handleLogout} />

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside
            className="col-md-2 p-3 border-end"
            style={{
              background: "#f8fafc",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <div className="list-group list-group-flush">
              <Link
                to="/admin"
                className="list-group-item list-group-item-action"
              >
                แดชบอร์ด
              </Link>

              <Link to="/admin/users" className="list-group-item">
                จัดการผู้ใช้
              </Link>

              <Link to="/admin/announcements" className="list-group-item">
                ประกาศ
              </Link>

              <Link to="/admin/enrollments" className="list-group-item">
                สมัครเรียน
              </Link>

              <Link to="/admin/menus" className="list-group-item">
                เมนูอาหาร
              </Link>
            </div>
          </aside>

          {/* Content */}
          <main className="col-md-10 p-4">
            <div className="bg-white rounded shadow-sm p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
