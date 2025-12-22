// src/components/NavBar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api/api'; // optional
import "../styles/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const role = user?.role || null;

  function handleLogout() {
    try { setAuthToken && setAuthToken(null); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm navbar-custom">
      <div className="container d-flex align-items-center justify-content-between">

        {/* left: logo + brand */}
        <div className="navbar-left d-flex align-items-center">
          <Link to="/" className="logo-link d-flex align-items-center text-decoration-none">
            <img src="/logo-placeholder.png" alt="โลโก้ศูนย์" className="nav-logo" />
            <span className="brand-text ms-2">ศูนย์พัฒนาเด็กเล็ก</span>
          </Link>
        </div>

        {/* toggler (mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* right: menu */}
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {!user && (
              <>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-primary" to="/login">เข้าสู่ระบบ</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary text-white" to="/register">สมัคร</Link>
                </li>
              </>
            )}

            {user && role === 'parent' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/enroll">สมัครเรียน</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/my-children">ข้อมูลบุตรหลาน</Link></li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#!" id="userMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    สวัสดี, {user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                    <li><button className="dropdown-item" onClick={() => navigate('/profile')}>โปรไฟล์</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>ออกจากระบบ</button></li>
                  </ul>
                </li>
              </>
            )}

            {user && role === 'teacher' && (
              <>
                
                <li className="nav-item"><Link className="nav-link" to="/teacher/children">ข้อมูลเด็ก</Link></li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#!" id="teacherForms" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ฟอร์มครู
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="teacherForms">
                                        <li><Link className="dropdown-item" to="/teacher/checkin">บันทึกเช็คชื่อ</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/measurements">บันทึกน้ำหนัก/ส่วนสูง</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/health">บันทึกสุขภาพ</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/brushings">บันทึกแปรงฟัน</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/milk">บันทึกดื่มนม</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/lunch-eating">บันทึกการรับประทานอาหารกลางวัน</Link></li>
                                        <li><Link className="dropdown-item" to="/teacher/evaluation/desired-traits">ประเมินคุณลักษณะ</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>ออกจากระบบ</button></li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#!" id="userMenuT" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    สวัสดี, {user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuT">
                    <li><button className="dropdown-item" onClick={() => navigate('/profile')}>โปรไฟล์</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>ออกจากระบบ</button></li>
                  </ul>
                </li>
              </>
            )}

            {user && role === 'admin' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin/users">จัดการผู้ใช้</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/announcements">ประกาศ</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/enrollments">สมัครเรียน</Link></li>
                <li className="nav-item">
                                  <Link className="nav-link" to="/admin/daily-menu">เมนูอาหาร</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#!" id="adminMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ระบบ (Admin)
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenu">
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>ออกจากระบบ</button></li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>

      </div>
    </nav>
  );
}