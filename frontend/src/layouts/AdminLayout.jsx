import React from "react";
import { Outlet } from "react-router-dom";
import AdminTopBar from "../pages/admin/AdminTopBar";


export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
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
             <a href="/admin" className="list-group-item list-group-item-action">แดชบอร์ด</a>
              <a href="/admin/users" className="list-group-item">
                จัดการผู้ใช้
              </a>
              <a href="/admin/announcements" className="list-group-item">
                ประกาศ
              </a>
              <a href="/admin/enrollments" className="list-group-item">
                สมัครเรียน
              </a>
              <a href="/admin/menus" className="list-group-item">
                เมนูอาหาร
              </a>
            </div>
          </aside>

          {/* Content */}
          <main className="col-md-10 p-4"><div className="bg-white rounded shadow-sm p-4"><Outlet /></div></main>
        </div>
      </div>
    </div>
  );
}
