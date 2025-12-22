import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    center_id: "",
    prefix: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    username: "",
    password: ""
  });

  /* ================= โหลดรายชื่อศูนย์ ================= */
  useEffect(() => {
    API.get("/centers")
      .then(res => setCenters(res.data))
      .catch(() =>
        setMsg({ type: "danger", text: "โหลดข้อมูลศูนย์ไม่สำเร็จ" })
      );
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  }

  function validate() {
    if (!form.center_id) return "กรุณาเลือกศูนย์เด็กเล็ก";
    if (!form.first_name || !form.last_name) return "กรุณากรอกชื่อ-สกุล";
    if (!form.username || form.username.length < 3)
      return "username อย่างน้อย 3 ตัวอักษร";
    if (!form.password || form.password.length < 4)
      return "password อย่างน้อย 4 ตัวอักษร";
    return null;
  }

  /* ================= สมัครสมาชิก ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const err = validate();
    if (err) {
      setMsg({ type: "danger", text: err });
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);
      setMsg({ type: "success", text: "สมัครสมาชิกสำเร็จ" });
      navigate("/login");
    } catch (err) {
      setMsg({
        type: "danger",
        text:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "สมัครสมาชิกไม่สำเร็จ"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">สมัครสมาชิกผู้ปกครอง</h2>

      {msg && (
        <div className={`alert alert-${msg.type}`} role="alert">
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ===== เลือกศูนย์ ===== */}
        <div className="mb-3">
          <label className="form-label">ศูนย์เด็กเล็ก</label>
          <select
            name="center_id"
            className="form-select"
            value={form.center_id}
            onChange={onChange}
            required
          >
            <option value="">-- เลือกศูนย์ --</option>
            {centers.map(c => (
              <option key={c.center_id} value={c.center_id}>
                {c.name}
            </option>
            ))}
          </select>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">คำนำหน้า</label>
            <select
              name="prefix"
              className="form-select"
              value={form.prefix}
              onChange={onChange}
            >
              <option value="">-- เลือก --</option>
              <option value="นาย">นาย</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นาง">นาง</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">ชื่อ</label>
            <input
              name="first_name"
              className="form-control"
              value={form.first_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">นามสกุล</label>
            <input
              name="last_name"
              className="form-control"
              value={form.last_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">เบอร์โทรศัพท์</label>
            <input
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">อีเมล</label>
            <input
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Username</label>
            <input
              name="username"
              className="form-control"
              value={form.username}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

          <button
            type="button"
            className="btn btn-link ms-3"
            onClick={() => navigate("/login")}
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
}
