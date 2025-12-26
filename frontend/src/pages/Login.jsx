import React, { useState } from "react";
import API, { setAuthToken } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data;

      setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); // ⭐ สำคัญ

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher/children");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.status, err.response?.data);
      alert("login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button>Login</button>
    </form>
  );
}
