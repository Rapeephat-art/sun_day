import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function StudentRecord() {
  const navigate = useNavigate();
  const STORAGE_KEY = "enrollDraftPayload";

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ===============================
     FORM STATE
  =============================== */
  const [form, setForm] = useState({
    child_prefix: "",
    child_firstname: "",
    child_lastname: "",
    gender: "",
    birth_date: "",
    weight_kg: "",
    height_cm: "",

    number_of_siblings: "",
    child_order: "",

    chronic_disease: "",
    allergies: "",
    food_restrictions: "",

    vaccine_complete: false,
    vaccine_incomplete: false,

    can_feed_self: false,
    can_express_need: false,

    other_notes: ""
  });

  /* ===============================
     FILE STATE (6 FILES)
  =============================== */
  const [files, setFiles] = useState({
    child_birth_certificate: null,
    child_house_reg: null,
    father_idcard: null,
    father_house_reg: null,
    mother_idcard: null,
    mother_house_reg: null
  });

  /* ===============================
     LOAD DRAFT FROM LOCALSTORAGE
  =============================== */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const payload = JSON.parse(raw);

        setForm((f) => ({
          ...f,
          child_prefix: payload.student_prefix || "",
          child_firstname: payload.student_firstname || "",
          child_lastname: payload.student_lastname || "",
          gender:
            payload.student_prefix === "เด็กชาย"
              ? "ชาย"
              : payload.student_prefix === "เด็กหญิง"
              ? "หญิง"
              : "",
          birth_date: payload.birth_date || "",
          weight_kg: payload.birth_weight || "",
          height_cm: payload.birth_height || ""
        }));
      } catch (e) {
        console.warn("invalid draft", e);
      }
    }
    setLoading(false);
  }, []);

  /* ===============================
     HANDLERS
  =============================== */
  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function onFileChange(e) {
    const { name, files } = e.target;
    setFiles((s) => ({ ...s, [name]: files[0] || null }));
  }

  function saveDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...base,
        student_record: form
      })
    );
    setMsg({ type: "success", text: "บันทึกแบบฟอร์มเรียบร้อย" });
  }

  function handleBack() {
    saveDraft();
    navigate("/admission");
  }

  /* ===============================
     FINAL SUBMIT (FormData)
  =============================== */
  async function handleFinalSubmit() {
    try {
      setSubmitting(true);
      setMsg(null);

      const raw = localStorage.getItem(STORAGE_KEY);
      const payload = raw ? JSON.parse(raw) : {};

      const formData = new FormData();

      // ⚠️ backend ต้องการ field ชื่อ payload
      formData.append(
        "payload",
        JSON.stringify({
          ...payload,
          student_record: form,
          status: "pending"
        })
      );

      // แนบไฟล์ทั้ง 6 รายการ
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const res = await API.post("/enrollments", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === 200 || res.status === 201) {
        localStorage.removeItem(STORAGE_KEY);
        setMsg({ type: "success", text: "สมัครเรียนเรียบร้อย" });
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "สมัครเรียนไม่สำเร็จ กรุณาลองใหม่" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container my-4">Loading…</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-3">ทะเบียนประวัตินักเรียน / แนบเอกสาร</h2>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* ================= DETAILS ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="mb-3">รายละเอียดทะเบียน</h5>

          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label">คำนำหน้า</label>
              <select
                className="form-select"
                name="child_prefix"
                value={form.child_prefix}
                onChange={onChange}
              >
                <option value="">เลือก</option>
                <option value="เด็กชาย">เด็กชาย</option>
                <option value="เด็กหญิง">เด็กหญิง</option>
              </select>
            </div>

            <div className="col-md-5">
              <label className="form-label">ชื่อ</label>
              <input
                className="form-control"
                name="child_firstname"
                value={form.child_firstname}
                onChange={onChange}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label">นามสกุล</label>
              <input
                className="form-control"
                name="child_lastname"
                value={form.child_lastname}
                onChange={onChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">เพศ</label>
              <select
                className="form-select"
                name="gender"
                value={form.gender}
                onChange={onChange}
              >
                <option value="">-- เลือก --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">วันเกิด</label>
              <input
                type="date"
                className="form-control"
                name="birth_date"
                value={form.birth_date}
                onChange={onChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">น้ำหนัก (kg)</label>
              <input
                className="form-control"
                name="weight_kg"
                value={form.weight_kg}
                onChange={onChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">ส่วนสูง (cm)</label>
              <input
                className="form-control"
                name="height_cm"
                value={form.height_cm}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">ประวัติการเจ็บป่วย / โรคประจำตัว</label>
            <textarea
              className="form-control"
              rows="2"
              name="chronic_disease"
              value={form.chronic_disease}
              onChange={onChange}
            />
          </div>

          <div className="mt-3">
            <label className="form-label">แพ้ / อาหาร / ข้อควรระวัง</label>
            <textarea
              className="form-control"
              rows="2"
              name="allergies"
              value={form.allergies}
              onChange={onChange}
            />
          </div>

          <div className="mt-3">
            <label className="form-label">อาหารที่ต้องงด / ข้อจำกัดทางอาหาร</label>
            <textarea
              className="form-control"
              rows="2"
              name="food_restrictions"
              value={form.food_restrictions}
              onChange={onChange}
            />
          </div>
        </div>
      </div>

      {/* ================= FILE UPLOAD ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="mb-3">เอกสารประกอบการสมัคร</h5>

          {[
            ["child_birth_certificate", "สำเนาสูติบัตรเด็ก"],
            ["child_house_reg", "สำเนาทะเบียนบ้านเด็ก"],
            ["father_idcard", "สำเนาบัตรประชาชนบิดา"],
            ["father_house_reg", "สำเนาทะเบียนบ้านบิดา"],
            ["mother_idcard", "สำเนาบัตรประชาชนมารดา"],
            ["mother_house_reg", "สำเนาทะเบียนบ้านมารดา"]
          ].map(([name, label]) => (
            <div className="mb-2" key={name}>
              <label className="form-label">{label}</label>
              <input
                type="file"
                className="form-control"
                name={name}
                onChange={onFileChange}
                accept=".jpg,.png,.pdf"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={handleBack}>
          ย้อนกลับ
        </button>
        <button className="btn btn-primary me-2" onClick={saveDraft}>
          บันทึกแบบฟอร์ม
        </button>
        <button
          className="btn btn-success"
          onClick={handleFinalSubmit}
          disabled={submitting}
        >
          {submitting ? "กำลังส่ง..." : "สมัครเรียน"}
        </button>
      </div>
    </div>
  );
}
