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
      setUser?.(user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher/children");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data);
      alert(err.response?.data?.error || "login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
}
