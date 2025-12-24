import React, { useState } from "react";
import API, { setAuthToken } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("api/auth/login", { username, password });
      const { token, user } = res.data;

      setAuthToken(token);
      localStorage.setItem("user", JSON.stringiSfy(user));
      setUser && setUser(user);

      // redirect ตามสิทธิ์
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher/children");
      } else {
        navigate("/");
      }

    } catch (err) {
  console.error("LOGIN ERROR:", err.response?.data || err.message);
  alert(
    err.response?.data?.error ||
    err.response?.data?.message ||
    JSON.stringify(err.response?.data) ||
    "เข้าสู่ระบบไม่สำเร็จ"
  );
}

  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #cceeff, #e8fff2)"
      }}
    >
      <div className="card shadow-lg" style={{ width: 380, borderRadius: 18 }}>
        <div className="card-body p-4">
          <h4 className="text-center mb-4 text-primary">
            เข้าสู่ระบบ
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/register" className="text-decoration-none">
              ยังไม่มีบัญชี? สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
