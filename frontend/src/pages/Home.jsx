// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home-wrapper">

      {/* กรอบหัวข้อใหญ่ */}
      <div className="main-title-box">
        <h1>ระบบจัดการศูนย์พัฒนาเด็กเล็ก</h1>
      </div>

      {/* ---------- 3 การ์ดกลางหน้า (ชมพู / เหลือง / เขียว) ---------- */}
      <div className="cards-row">

        <div className="color-card card-pink">
          <div className="card-icon">👤</div>
          <h3 className="card-title">ลงทะเบียน</h3>
          <p className="card-desc">สำหรับ ผู้ปกครอง หรือผู้ที่เกี่ยวข้อง</p>
        </div>

        <div className="color-card card-yellow">
          <div className="card-icon">🔎</div>
          <h3 className="card-title">ประกาศล่าสุด</h3>
          <p className="card-desc">
            ประกาศเรื่อง: วันหยุดพิเศษ — กรุณามารับบุตรหลานวันนี้ก่อนเวลา 15:00 น.
          </p>
          <Link to="/announcements" className="btn-card">อ่านเพิ่มเติม</Link>
        </div>

        <div className="color-card card-green">
          <div className="card-icon"><img src="/seal-placeholder.png" alt="กรม" style={{ width: 56 }} /></div>
          <h3 className="card-title">ศูนย์</h3>
          <p className="card-desc">
            ที่อยู่ 399 หมู่ 11 ต.หนองน้ำแดง อ.ปากช่อง จ.นครราชสีมา<br/>โทร 044 000 360 2025
          </p>
        </div>

      </div>
      {/* ---------- จบ 3 การ์ดกลาง ---------- */}

      {/* กรอบข่าวประชาสัมพันธ์ (กรอบยาวตรงกลาง) */}
      <section className="news-wrapper">
        <div className="news-card">
          <h2 className="news-heading">ข่าวประชาสัมพันธ์</h2>

          <h3 className="news-title">ประกาศเรื่อง: วันหยุดพิเศษ</h3>
          <p className="news-text">
            เนื่องในโอกาสวันสำคัญ ทางศูนย์ฯ จะหยุดทำการในวันพรุ่งนี้
            กรุณามารับบุตรหลานวันนี้ก่อนเวลา 15:00 น.
          </p>
          <p className="news-meta">โดย admin • 23/11/2568</p>

          <div className="news-actions">
            <Link to="/announcements" className="btn-readmore">
              อ่านเพิ่มเติม
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}