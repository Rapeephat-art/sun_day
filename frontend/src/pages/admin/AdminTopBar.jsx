import React from "react";

export default function AdminTopBar({ user, onLogout }) {
  return (
   <div
  className="d-flex align-items-center justify-content-between px-4 shadow-sm"
  style={{
    height: 64,
    background: "#1f2937",
    color: "#ffffff",
  }}
>

      {/* Left */}
      <div className="fw-semibold">
        ระบบจัดการศูนย์เด็กเล็ก
      </div>

      {/* Right */}
      <div className="d-flex align-items-center gap-3">
        {/* Search (ถ้าไม่อยากใช้ ลบได้) */}
        <input
          type="text"
          placeholder="ค้นหา..."
          className="form-control form-control-sm"
          style={{ width: 180 }}
        />

        {/* User */}
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-light dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {user?.username || "Admin"}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={onLogout}>
                ออกจากระบบ
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
