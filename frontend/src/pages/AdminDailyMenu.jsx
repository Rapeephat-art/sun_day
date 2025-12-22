import React, { useEffect, useState } from "react";
import API from "../api/api";

/* helper: วันที่วันนี้ (YYYY-MM-DD) */
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function AdminDailyMenu() {
  const [form, setForm] = useState({
    menu_date: todayISO(),
    main_menu: "",
    stir_menu: "",
    soup_menu: "",
    fried_menu: "",
    dessert_menu: "",
    note: ""
  });

  const [menus, setMenus] = useState([]);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);

  /* โหลดรายการเมนูทั้งหมด */
  async function loadMenus() {
    try {
      const res = await API.get("/daily-menu");
      setMenus(res.data || []);
    } catch (err) {
      console.error("loadMenus error", err);
    }
  }

  useEffect(() => {
    loadMenus();
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* เพิ่ม / แก้ไขเมนู */
  async function onSubmit(e) {
    e.preventDefault();
    try {
      await API.post("/daily-menu", form);

      setMsg({
        type: "success",
        text: editingId ? "แก้ไขเมนูเรียบร้อย" : "เพิ่มเมนูเรียบร้อย"
      });

      setEditingId(null);
      setForm({
        menu_date: todayISO(),
        main_menu: "",
        stir_menu: "",
        soup_menu: "",
        fried_menu: "",
        dessert_menu: "",
        note: ""
      });

      loadMenus();
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "บันทึกไม่สำเร็จ" });
    }
  }

  /* ลบเมนู */
  async function handleDelete(id) {
    if (!window.confirm("ยืนยันการลบเมนูวันนี้?")) return;

    try {
      await API.delete(`/daily-menu/${id}`);
      loadMenus();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  }

  /* แก้ไขเมนู */
  function handleEdit(menu) {
    setEditingId(menu.daily_menu_id);
    setForm({
      menu_date: menu.menu_date,
      main_menu: menu.main_menu || "",
      stir_menu: menu.stir_menu || "",
      soup_menu: menu.soup_menu || "",
      fried_menu: menu.fried_menu || "",
      dessert_menu: menu.dessert_menu || "",
      note: menu.note || ""
    });
  }

  return (
    <div className="container my-4">
      <h4>จัดการเมนูอาหารกลางวัน (Admin)</h4>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* ===== ฟอร์มเพิ่ม / แก้ไข ===== */}
      <form onSubmit={onSubmit} className="card p-3 mb-4">
        <div className="mb-2">
          <label>วันที่</label>
          <input
            type="date"
            className="form-control"
            name="menu_date"
            value={form.menu_date}
            onChange={onChange}
            required
          />
        </div>

        <input
          className="form-control mb-2"
          name="main_menu"
          placeholder="เมนูหลัก"
          value={form.main_menu}
          onChange={onChange}
        />

        <input
          className="form-control mb-2"
          name="stir_menu"
          placeholder="เมนูผัด"
          value={form.stir_menu}
          onChange={onChange}
        />

        <input
          className="form-control mb-2"
          name="soup_menu"
          placeholder="เมนูต้ม"
          value={form.soup_menu}
          onChange={onChange}
        />

        <input
          className="form-control mb-2"
          name="fried_menu"
          placeholder="เมนูทอด"
          value={form.fried_menu}
          onChange={onChange}
        />

        <input
          className="form-control mb-2"
          name="dessert_menu"
          placeholder="ขนม / ของหวาน"
          value={form.dessert_menu}
          onChange={onChange}
        />

        <textarea
          className="form-control mb-3"
          name="note"
          placeholder="หมายเหตุ"
          value={form.note}
          onChange={onChange}
        />

        <button className="btn btn-primary">
          {editingId ? "บันทึกการแก้ไข" : "บันทึกเมนู"}
        </button>
      </form>

      {/* ===== ตารางรายการเมนู ===== */}
      <div className="card p-3">
        <h5>รายการเมนูทั้งหมด</h5>

        <table className="table table-bordered mt-2">
          <thead>
            <tr>
              <th width="120">วันที่</th>
              <th>รายการ</th>
              <th>หมายเหตุ</th>
              <th width="150">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {menus.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}

            {menus.map(m => (
              <tr key={m.daily_menu_id}>
                <td>{m.menu_date}</td>
                <td>
                  {m.main_menu && <>ข้าว: {m.main_menu} / </>}
                  {m.stir_menu && <>ผัด: {m.stir_menu} / </>}
                  {m.soup_menu && <>ต้ม: {m.soup_menu} / </>}
                  {m.fried_menu && <>ทอด: {m.fried_menu} / </>}
                  {m.dessert_menu && <>ขนม: {m.dessert_menu}</>}
                </td>
                <td>{m.note || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-1"
                    onClick={() => handleEdit(m)}
                  >
                    แก้ไข
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(m.daily_menu_id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
