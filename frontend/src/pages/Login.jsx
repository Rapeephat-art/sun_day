import React, { useState } from "react";
import API from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", {
        username,
        password
      });
      alert("LOGIN OK: " + JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("LOGIN FAIL");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button>login</button>
    </form>
  );
}
