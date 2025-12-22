import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function Enrollment() {
  const initial = {
        /* ===== ข้อมูลเด็ก ===== */
    apply_level: "",
    student_prefix: "",
    student_firstname: "",
    student_lastname: "",
    student_nickname: "",
    student_idcard: "",
    birth_date: "",
    birth_weight: "",
    birth_height: "",
    oral_health: "",

    /* ===== ที่อยู่เด็ก ===== */
    reg_house_no: "",
    reg_moo: "",
    reg_tambon: "",
    reg_amphur: "",
    reg_province: "",
    curr_house_no: "",
    curr_moo: "",
    curr_tambon: "",
    curr_amphur: "",
    curr_province: "",

    /* ===== มารดา ===== */
    mother_prefix: "",
    mother_firstname: "",
    mother_lastname: "",
    mother_idcard: "",
    mother_birthdate: "",
    mother_phone: "",
    mother_job: "",
    mother_income: "",
    mother_reg_house_no: "",
    mother_reg_moo: "",
    mother_reg_tambon: "",
    mother_reg_amphur: "",
    mother_reg_province: "",
    mother_curr_house_no: "",
    mother_curr_moo: "",
    mother_curr_tambon: "",
    mother_curr_amphur: "",
    mother_curr_province: "",

    /* ===== บิดา ===== */
    father_prefix: "",
    father_firstname: "",
    father_lastname: "",
    father_idcard: "",
    father_birthdate: "",
    father_phone: "",
    father_job: "",
    father_income: "",
    father_reg_house_no: "",
    father_reg_moo: "",
    father_reg_tambon: "",
    father_reg_amphur: "",
    father_reg_province: "",
    father_curr_house_no: "",
    father_curr_moo: "",
    father_curr_tambon: "",
    father_curr_amphur: "",
    father_curr_province: "",

    /* ===== ความดูแล ===== */
    care_responsible: "",
    caregiver_prefix: "",
    caregiver_firstname: "",
    caregiver_lastname: "",
    caregiver_job: "",
    caregiver_income: "",
    caregiver_phone: "",

    /* ===== ผู้รับส่ง ===== */
    sender_prefix: "",
    sender_firstname: "",
    sender_lastname: "",
    sender_relation: "",
    sender_phone: ""
  };


  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState(null);
  const [myEnrollment, setMyEnrollment] = useState(null);

  /* ===== ไฟล์แนบ ===== */
  const [files, setFiles] = useState({
    child_birth_certificate: null,
    child_house_reg: null,
    father_idcard_file: null,
    father_house_reg: null,
    mother_idcard_file: null,
    mother_house_reg: null,
  });
useEffect(() => {
    loadMyEnrollment();
  }, []);

  async function loadMyEnrollment() {
    try {
      const res = await API.get("/enrollments/my");
      setMyEnrollment(res.data?.[0] || null);
    } catch {
      setMyEnrollment(null);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  function onFileChange(e) {
    const { name, files } = e.target;
    setFiles(s => ({ ...s, [name]: files[0] || null }));
  }

  async function handleSubmit() {
    if (myEnrollment) {
      setMsg({ type: "warning", text: "คุณได้สมัครไปแล้ว" });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify(form));

      Object.entries(files).forEach(([k, f]) => {
        if (f) fd.append(k, f);
      });

      await API.post("/enrollments", fd);

      setMsg({ type: "success", text: "สมัครเรียนเรียบร้อย" });
      loadMyEnrollment();
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "สมัครเรียนไม่สำเร็จ" });
    }
  }


  return (
   <div className="container my-5" style={{ zIndex: 10 }}>
      <h2 className="mb-4">แบบฟอร์มสมัครเข้าเรียน</h2>

      <Link to="/enrollments/my" className="btn btn-outline-primary mb-3">
        ตรวจสอบสถานะการสมัคร
      </Link>

      {myEnrollment && (
        <div className="alert alert-info">
          สถานะการสมัคร: <b>{myEnrollment.status}</b>
          {myEnrollment.status === "rejected" && (
            <div className="text-danger mt-2">
              เหตุผล: {myEnrollment.note}
            </div>
          )}
        </div>
      )}
      {msg && (
        <div className={`alert alert-${msg.type}`}>  {msg.text} </div> )}

      <form onSubmit={(e) => e.preventDefault()}>
         {/* ================= ข้อมูลเด็ก ================= */}
        <div className="card mb-3"><div className="card-body">
          <h5>ข้อมูลเด็ก</h5>

          <select className="form-select mb-2" name="apply_level" value={form.apply_level} onChange={onChange}>
            <option value="">ชั้นที่สมัคร</option>
            <option value="ต่ำกว่า 3 ปี">ต่ำกว่า 3 ปี</option>
            <option value="อายุ 3 ปี">อายุ 3 ปี</option>
          </select>

          <select className="form-select mb-2" name="student_prefix" value={form.student_prefix} onChange={onChange}>
            <option value="">คำนำหน้า</option>
            <option value="เด็กชาย">เด็กชาย</option>
            <option value="เด็กหญิง">เด็กหญิง</option>
          </select>

          <input className="form-control mb-2" name="student_firstname" value={form.student_firstname} onChange={onChange} placeholder="ชื่อเด็ก" />
          <input className="form-control mb-2" name="student_lastname" value={form.student_lastname} onChange={onChange} placeholder="นามสกุลเด็ก" />
          <input className="form-control mb-2" name="student_nickname" value={form.student_nickname} onChange={onChange} placeholder="ชื่อเล่น" />
          <input className="form-control mb-2" name="student_idcard" value={form.student_idcard} onChange={onChange} placeholder="เลขบัตรประชาชน" />

          <input type="date" className="form-control mb-2" name="birth_date" value={form.birth_date} onChange={onChange} />
          <input className="form-control mb-2" name="birth_weight" value={form.birth_weight} onChange={onChange} placeholder="น้ำหนัก" />
          <input className="form-control mb-2" name="birth_height" value={form.birth_height} onChange={onChange} placeholder="ส่วนสูง" />

          <select className="form-select" name="oral_health" value={form.oral_health} onChange={onChange}>
            <option value="">สุขภาพช่องปาก</option>
            <option value="ฟันผุ">ฟันผุ</option>
            <option value="ฟันไม่ผุ">ฟันไม่ผุ</option>
          </select>
        </div></div>
       {/* ================= ที่อยู่เด็ก ================= */}
        <div className="card mb-3"><div className="card-body">
          <h5>ที่อยู่เด็ก</h5>

          <h6>ทะเบียนบ้าน</h6>
          <input className="form-control mb-2" name="reg_house_no" value={form.reg_house_no} onChange={onChange} placeholder="บ้านเลขที่" />
          <input className="form-control mb-2" name="reg_moo" value={form.reg_moo} onChange={onChange} placeholder="หมู่" />
          <input className="form-control mb-2" name="reg_tambon" value={form.reg_tambon} onChange={onChange} placeholder="ตำบล" />
          <input className="form-control mb-2" name="reg_amphur" value={form.reg_amphur} onChange={onChange} placeholder="อำเภอ" />
          <input className="form-control mb-2" name="reg_province" value={form.reg_province} onChange={onChange} placeholder="จังหวัด" />

          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" onChange={(e)=>e.target.checked && setForm(s=>({
              ...s,
              curr_house_no:s.reg_house_no,
              curr_moo:s.reg_moo,
              curr_tambon:s.reg_tambon,
              curr_amphur:s.reg_amphur,
              curr_province:s.reg_province
            }))}/>
            <label className="form-check-label">ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน</label>
          </div>

          <h6>ที่อยู่ปัจจุบัน</h6>
          <input className="form-control mb-2" name="curr_house_no" value={form.curr_house_no} onChange={onChange}placeholder="บ้านเลขที่" />
          <input className="form-control mb-2" name="curr_moo" value={form.curr_moo} onChange={onChange} placeholder="หมู่" />
          <input className="form-control mb-2" name="curr_tambon" value={form.curr_tambon} onChange={onChange} placeholder="ตำบล"/>
          <input className="form-control mb-2" name="curr_amphur" value={form.curr_amphur} onChange={onChange}  placeholder="อำเภอ"/>
          <input className="form-control mb-2" name="curr_province" value={form.curr_province} onChange={onChange} placeholder="จังหวัด"/>
        </div></div>

        {/* ================= มารดา ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ข้อมูลมารดา</h5>
             <select
      className="form-select mb-2"
      name="mother_prefix"
      value={form.mother_prefix}
      onChange={onChange}
    >
      <option value="">คำนำหน้า</option>
      <option value="นาง">นาง</option>
      <option value="นางสาว">นางสาว</option>
    </select>
            <input className="form-control mb-2" name="mother_firstname" value={form.mother_firstname} onChange={onChange} placeholder="ชื่อแม่" />
            <input className="form-control mb-2" name="mother_lastname" value={form.mother_lastname} onChange={onChange} placeholder="นามสกุลแม่" />
            <input className="form-control mb-2" name="mother_idcard" value={form.mother_idcard} onChange={onChange} placeholder="เลขบัตรประชาชน" />
            <input type="date" className="form-control mb-2" name="mother_birthdate" value={form.mother_birthdate} onChange={onChange} />
            <h6 className="mt-3">ที่อยู่ตามทะเบียนบ้าน (มารดา)</h6>
            <input className="form-control mb-2" name="mother_reg_house_no" value={form.mother_reg_house_no} onChange={onChange} placeholder="บ้านเลขที่" />
            <input className="form-control mb-2" name="mother_reg_moo" value={form.mother_reg_moo} onChange={onChange} placeholder="หมู่" />
            <input className="form-control mb-2" name="mother_reg_tambon" value={form.mother_reg_tambon} onChange={onChange} placeholder="ตำบล" />
            <input className="form-control mb-2" name="mother_reg_amphur" value={form.mother_reg_amphur} onChange={onChange} placeholder="อำเภอ" />
            <input className="form-control mb-2" name="mother_reg_province" value={form.mother_reg_province} onChange={onChange} placeholder="จังหวัด" />
            <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" onChange={(e)=>e.target.checked && setForm(s=>({
              ...s,
              mother_curr_house_no: s.mother_reg_house_no,
              mother_curr_moo: s.mother_reg_moo,
              mother_curr_tambon: s.mother_reg_tambon,
              mother_curr_amphur: s.mother_reg_amphur,
              mother_curr_province: s.mother_reg_province
            }))}/>
            <label className="form-check-label">ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน</label>
          </div>
            <h6 className="mt-3">ที่อยู่ปัจจุบัน (มารดา)</h6>
            <input className="form-control mb-2" name="mother_curr_house_no" value={form.mother_curr_house_no} onChange={onChange} placeholder="บ้านเลขที่" />
            <input className="form-control mb-2" name="mother_curr_moo" value={form.mother_curr_moo} onChange={onChange} placeholder="หมู่" />
            <input className="form-control mb-2" name="mother_curr_tambon" value={form.mother_curr_tambon} onChange={onChange} placeholder="ตำบล" />
            <input className="form-control mb-2" name="mother_curr_amphur" value={form.mother_curr_amphur} onChange={onChange} placeholder="อำเภอ" />
            <input className="form-control mb-2" name="mother_curr_province" value={form.mother_curr_province} onChange={onChange} placeholder="จังหวัด" />

            <input className="form-control mb-2" name="mother_phone" value={form.mother_phone} onChange={onChange} placeholder="โทรศัพท์" />
            <input className="form-control mb-2" name="mother_job" value={form.mother_job} onChange={onChange} placeholder="อาชีพ" />
            <input className="form-control" name="mother_income" value={form.mother_income} onChange={onChange} placeholder="รายได้ต่อเดือน" />
          </div>
        </div>

        {/* ================= บิดา ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ข้อมูลบิดา</h5>
            {/* คำนำหน้าพ่อ */}
    <select
      className="form-select mb-2"
      name="father_prefix"
      value={form.father_prefix}
      onChange={onChange}
    >
      <option value="">คำนำหน้า</option>
      <option value="นาย">นาย</option>
    </select>
            <input className="form-control mb-2" name="father_firstname" value={form.father_firstname} onChange={onChange} placeholder="ชื่อพ่อ" />
            <input className="form-control mb-2" name="father_lastname" value={form.father_lastname} onChange={onChange} placeholder="นามสกุลพ่อ" />
            <input className="form-control mb-2" name="father_idcard" value={form.father_idcard} onChange={onChange} placeholder="เลขบัตรประชาชน" />
            <input type="date" className="form-control mb-2" name="father_birthdate" value={form.father_birthdate} onChange={onChange} />
            <h6 className="mt-3">ที่อยู่ตามทะเบียนบ้าน (บิดา)</h6>
            <input className="form-control mb-2" name="father_reg_house_no" value={form.father_reg_house_no} onChange={onChange} placeholder="บ้านเลขที่" />
            <input className="form-control mb-2" name="father_reg_moo" value={form.father_reg_moo} onChange={onChange} placeholder="หมู่" />
            <input className="form-control mb-2" name="father_reg_tambon" value={form.father_reg_tambon} onChange={onChange} placeholder="ตำบล" />
            <input className="form-control mb-2" name="father_reg_amphur" value={form.father_reg_amphur} onChange={onChange} placeholder="อำเภอ" />
            <input className="form-control mb-2" name="father_reg_province" value={form.father_reg_province} onChange={onChange} placeholder="จังหวัด" />
            <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" onChange={(e)=>e.target.checked && setForm(s=>({
              ...s,
              father_curr_house_no: s.father_reg_house_no,
              father_curr_moo: s.father_reg_moo,
              father_curr_tambon: s.father_reg_tambon,
              father_curr_amphur: s.father_reg_amphur,
              father_curr_province: s.father_reg_province
            }))}/>
            <label className="form-check-label">ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน</label>
          </div>
            <h6 className="mt-3">ที่อยู่ปัจจุบัน (บิดา)</h6>
            <input className="form-control mb-2" name="father_curr_house_no" value={form.father_curr_house_no} onChange={onChange} placeholder="บ้านเลขที่" />
            <input className="form-control mb-2" name="father_curr_moo" value={form.father_curr_moo} onChange={onChange} placeholder="หมู่" />
            <input className="form-control mb-2" name="father_curr_tambon" value={form.father_curr_tambon} onChange={onChange} placeholder="ตำบล" />
            <input className="form-control mb-2" name="father_curr_amphur" value={form.father_curr_amphur} onChange={onChange} placeholder="อำเภอ" />
        <input className="form-control mb-2" name="father_curr_province" value={form.father_curr_province} onChange={onChange} placeholder="จังหวัด" />

            <input className="form-control mb-2" name="father_phone" value={form.father_phone} onChange={onChange} placeholder="โทรศัพท์" />
            <input className="form-control mb-2" name="father_job" value={form.father_job} onChange={onChange} placeholder="อาชีพ" />
            <input className="form-control" name="father_income" value={form.father_income} onChange={onChange} placeholder="รายได้ต่อเดือน" />
          </div>
        </div>
<div className="card mb-3">
  <div className="card-body">
    <h5>ปัจจุบันเด็กอยู่ในความดูแลอุปการะรับผิดชอบของ</h5>

    {/* ผู้ดูแลเป็นใคร */}
    <select
      className="form-select mb-2"
      name="care_responsible"
      value={form.care_responsible}
      onChange={onChange}
    >
      <option value="">-- เลือก --</option>
      <option value="บิดา">บิดา</option>
      <option value="มารดา">มารดา</option>
      <option value="บิดาและมารดา">บิดาและมารดา</option>
      <option value="ญาติ">ญาติ</option>
      <option value="อื่น ๆ">อื่น ๆ</option>
    </select>

    {/* คำนำหน้า */}
    <select
      className="form-select mb-2"
      name="caregiver_prefix"
      value={form.caregiver_prefix}
      onChange={onChange}
    >
      <option value="">คำนำหน้า</option>
      <option value="นาย">นาย</option>
      <option value="นาง">นาง</option>
      <option value="นางสาว">นางสาว</option>
    </select>

    {/* ชื่อ */}
    <input
      className="form-control mb-2"
      name="caregiver_firstname"
      value={form.caregiver_firstname}
      onChange={onChange}
      placeholder="ชื่อผู้อุปการะ"
    />

    {/* นามสกุล */}
    <input
      className="form-control mb-2"
      name="caregiver_lastname"
      value={form.caregiver_lastname}
      onChange={onChange}
      placeholder="นามสกุลผู้อุปการะ"
    />

    {/* อาชีพ */}
    <input
      className="form-control mb-2"
      name="caregiver_job"
      value={form.caregiver_job}
      onChange={onChange}
      placeholder="อาชีพผู้อุปการะ"
    />

    {/* รายได้ */}
    <input
      className="form-control mb-2"
      name="caregiver_income"
      value={form.caregiver_income}
      onChange={onChange}
      placeholder="รายได้ต่อเดือน"
    />

    {/* โทรศัพท์ */}
    <input
      className="form-control"
      name="caregiver_phone"
      value={form.caregiver_phone}
      onChange={onChange}
      placeholder="หมายเลขโทรศัพท์"
    />
  </div>
</div>


        {/* ================= ผู้รับส่ง ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ผู้รับส่งเด็ก</h5>
             <select
      className="form-select mb-2"
      name="sender_prefix"
      value={form.sender_prefix}
      onChange={onChange}
      >
      <option value="">คำนำหน้า</option>
      <option value="นาย">นาย</option>
      <option value="นาง">นาง</option>
      <option value="นางสาว">นางสาว</option>
      </select>
            <input className="form-control mb-2" name="sender_firstname" value={form.sender_firstname} onChange={onChange} placeholder="ชื่อ" />
            <input className="form-control mb-2" name="sender_lastname" value={form.sender_lastname} onChange={onChange} placeholder="นามสกุล" />
            <input className="form-control mb-2" name="sender_relation" value={form.sender_relation} onChange={onChange} placeholder="ความสัมพันธ์" />
            <input className="form-control" name="sender_phone" value={form.sender_phone} onChange={onChange} placeholder="โทรศัพท์" />
          </div>
        </div>
        {/* ================= เอกสารแนบ ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>เอกสารประกอบการสมัคร</h5>

            <label className="form-label">สำเนาสูติบัตรเด็ก</label>
            <input type="file" className="form-control mb-2" name="child_birth_certificate" onChange={onFileChange} />

            <label className="form-label">สำเนาทะเบียนบ้านเด็ก</label>
            <input type="file" className="form-control mb-2" name="child_house_reg" onChange={onFileChange} />

            <label className="form-label">สำเนาบัตรประชาชนบิดา</label>
            <input type="file" className="form-control mb-2" name="father_idcard_file" onChange={onFileChange} />

            <label className="form-label">สำเนาทะเบียนบ้านบิดา</label>
            <input type="file" className="form-control mb-2" name="father_house_reg" onChange={onFileChange} />

            <label className="form-label">สำเนาบัตรประชาชนมารดา</label>
            <input type="file" className="form-control mb-2" name="mother_idcard_file" onChange={onFileChange} />

            <label className="form-label">สำเนาทะเบียนบ้านมารดา</label>
            <input type="file" className="form-control mb-2" name="mother_house_reg" onChange={onFileChange} />
          </div>
        </div>
              <div className="d-flex justify-content-center mb-5">
  <button
    type="button"
    className="btn btn-success btn-lg"
    onClick={handleSubmit}
  >
    สมัครเรียน
  </button>
  
</div>
            
      </form>
    </div>
  );
}
