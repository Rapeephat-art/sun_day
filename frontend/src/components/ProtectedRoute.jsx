import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <Navigate to="/login" replace />;

  const user = JSON.parse(rawUser);

  // ถ้ามีการกำหนด role และ role ไม่ตรง
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
