// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    children: 0,
    teachers: 0,
    enrollments: 0,
    announcements: 0,
  });

  useEffect(() => {
    API.get("/admin/dashboard")
      .then((res) => setSummary(res.data))
      .catch(() => {
        // mock data ชั่วคราว
        setSummary({
          children: 120,
          teachers: 8,
          enrollments: 5,
          announcements: 3,
        });
      });
  }, []);

  return (
    <div>
      <h2 className="mb-4 fw-bold text-success">
        ผู้ดูแลระบบ
      </h2>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm rounded-4 text-center p-3">
            <div className="text-muted">เด็กทั้งหมด</div>
            <h2 className="fw-bold text-primary">{summary.children}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm rounded-4 text-center p-3">
            <div className="text-muted">ครู / บุคลากร</div>
            <h2 className="fw-bold text-success">{summary.teachers}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm rounded-4 text-center p-3">
            <div className="text-muted">สมัครเรียนใหม่</div>
            <h2 className="fw-bold text-warning">{summary.enrollments}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm rounded-4 text-center p-3">
            <div className="text-muted">ประกาศ</div>
            <h2 className="fw-bold text-danger">{summary.announcements}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
