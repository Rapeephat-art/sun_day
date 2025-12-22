// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";


export default function Sidebar() {
return (
<aside className="sidebar">
<h2 className="logo">ศูนย์เด็กเล็ก</h2>
<nav>
<NavLink to="/admin">Dashboard</NavLink>
<NavLink to="/admin/children">ข้อมูลเด็ก</NavLink>
<NavLink to="/admin/teachers">ครู / บุคลากร</NavLink>
<NavLink to="/admin/enrollments">สมัครเข้าเรียน</NavLink>
<NavLink to="/admin/announcements">ประกาศ</NavLink>
</nav>
</aside>
);
}