import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function AdminMenus() {
  const [menus, setMenus] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ menu_type_id: "", name: "", notes: "" });
  const [editingId, setEditingId] = useState(null);

  async function loadMenus() {
    const res = await API.get("/menus");
    setMenus(res.data.rows || []);
  }

  async function loadTypes() {
    const res = await API.get("/menus/types");
    setTypes(res.data.rows || []);
  }

  useEffect(() => {
    loadMenus();
    loadTypes();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editingId) {
      await API.post("/menus", form);
    } else {
      await API.put(`/menus/${editingId}`, form);
    }
    setForm({ menu_type_id: "", name: "", notes: "" });
    setEditingId(null);
    loadMenus();
  }

  async function handleDelete(id) {
    if (window.confirm("ลบเมนูนี้?")) {
      await API.delete(`/menus/${id}`);
      loadMenus();
    }
  }

  function handleEdit(m) {
    setEditingId(m.menu_id);
    setForm({
      menu_type_id: m.menu_type_id,
      name: m.name,
      notes: m.notes
    });
  }

  return (
    <div className="container my-4">
      <h3>เมนูอาหารทั้งหมด</h3>

      {/* Form */}
      <form className="card p-3 mb-4" onSubmit={handleSubmit}>
        <select
          className="form-control mb-2"
          name="menu_type_id"
          value={form.menu_type_id}
          onChange={handleChange}
        >
          <option value="">-- เลือกประเภทเมนู --</option>
          {types.map((t) => (
            <option key={t.menu_type_id} value={t.menu_type_id}>
              {t.menu_type}
            </option>
          ))}
        </select>

        <input
          className="form-control mb-2"
          name="name"
          placeholder="ชื่อเมนูอาหาร"
          value={form.name}
          onChange={handleChange}
        />

        <textarea
          className="form-control mb-2"
          name="notes"
          placeholder="รายละเอียด"
          value={form.notes}
          onChange={handleChange}
        />

        <button className="btn btn-primary">
          {editingId ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
        </button>
      </form>

      {/* Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อเมนู</th>
            <th>ประเภท</th>
            <th>หมายเหตุ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((m, i) => (
            <tr key={m.menu_id}>
              <td>{i + 1}</td>
              <td>{m.name}</td>
              <td>{m.menu_type}</td>
              <td>{m.notes}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(m)}>
                  แก้ไข
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.menu_id)}>
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
