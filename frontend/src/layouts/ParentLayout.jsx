import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

export default function ParentLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Top bar */}
      <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <strong>ระบบผู้ปกครอง</strong>
        <div>
          <span className="me-3">{user?.username}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside
            className="col-md-2 p-3 border-end"
            style={{ background: "#f8fafc" }}
          >
            <div className="list-group list-group-flush">
              <Link to="/my-enrollment" className="list-group-item">
                สถานะการสมัครเรียน
              </Link>
              <Link to="/my-children" className="list-group-item">
                ข้อมูลบุตรหลาน
              </Link>
              <Link to="/my-evaluations" className="list-group-item">
                พัฒนาการเด็ก
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
