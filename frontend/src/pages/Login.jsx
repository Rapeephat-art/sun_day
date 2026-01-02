import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api/api";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("กรุณากรอก username และ password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data;

      setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      if (setUser) setUser(user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher/children");
      } else {
        navigate("/");
      }
    } catch (err) {
      // debug เห็น error จริงจาก backend
      console.error("LOGIN ERROR FULL:", err.response || err);
      setError(err.response?.data?.error || "login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>เข้าสู่ระบบ</h2>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
      </form>
    </div>
  );
}
