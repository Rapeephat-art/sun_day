import React from 'react';
import NavBar from '../components/NavBar';
import { NavLink, Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div style={styles.wrapper}>
      {/* ===== Sidebar ===== */}
      <aside style={styles.sidebar}>
        <h3 style={styles.title}>เมนูครู</h3>

        <nav>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <NavLink
                to="/teacher/classroom"
                style={({ isActive }) =>
                  isActive ? styles.activeLink : styles.link
                }
              >
                ห้องเรียน
              </NavLink>
            </li>

            <li style={styles.li}>
              <NavLink
                to="/teacher/attendance"
                style={({ isActive }) =>
                  isActive ? styles.activeLink : styles.link
                }
              >
                เช็คชื่อ
              </NavLink>
            </li>

            {/* ✅ เมนูประเมินคุณลักษณะ */}
            <li style={styles.li}>
              <NavLink
                to="/teacher/evaluation/desired-traits"
                style={({ isActive }) =>
                  isActive ? styles.activeLink : styles.link
                }
              >
                ประเมินคุณลักษณะ
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ===== Content ===== */}
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

/* ===================== styles ===================== */
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Tahoma, Arial, sans-serif",
  },
  sidebar: {
    width: "240px",
    background: "#2c3e50",
    color: "#fff",
    padding: "20px 15px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "18px",
    borderBottom: "1px solid #555",
    paddingBottom: "10px",
  },
  ul: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  li: {
    marginBottom: "10px",
  },
  link: {
    display: "block",
    padding: "10px 12px",
    color: "#ecf0f1",
    textDecoration: "none",
    borderRadius: "4px",
  },
  activeLink: {
    display: "block",
    padding: "10px 12px",
    background: "#3498db",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: "20px",
    background: "#f5f6fa",
  },
};
