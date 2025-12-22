import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminEnrollments() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  /* ===============================
     โหลดรายการสมัคร
  ================================ */
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await API.get("/enrollments");
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลการสมัครไม่สำเร็จ");
    }
  }

  /* ===============================
     อนุมัติ
  ================================ */
  async function approve(enrollmentId) {
    if (!window.confirm("ยืนยันการอนุมัติสมัครเรียน ?")) return;

    try {
      const res = await API.put(`/enrollments/${enrollmentId}/approve`);
      const childId = res.data.child_id;
      navigate(`/admin/student-record/${childId}`);
    } catch (err) {
      console.error(err);
      alert("อนุมัติไม่สำเร็จ");
    }
  }

  /* ===============================
     ไม่อนุมัติ
  ================================ */
  async function reject(enrollmentId) {
  const reason = window.prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ");

  if (!reason || !reason.trim()) {
    alert("ต้องระบุเหตุผล");
    return;
  }

  try {
    await API.put(`/enrollments/${enrollmentId}/reject`, {
      note: reason
    });
    load();
  } catch (err) {
    console.error(err);
    alert("เปลี่ยนสถานะไม่สำเร็จ");
  }
}


  /* ===============================
     helper: parse JSON
  ================================ */
  function parseJSON(v) {
    try {
      return typeof v === "string" ? JSON.parse(v) : v || {};
    } catch {
      return {};
    }
  }

  return (
    <div className="container mt-4">
      <h3>อนุมัติสมัครเรียน</h3>

      {/* ===== ตาราง ===== */}
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อเด็ก</th>
            <th>วันเกิด</th>
            <th>ระดับที่สมัคร</th>
            <th>สถานะ</th>
            <th style={{ width: 220 }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="6" align="center">ไม่มีข้อมูล</td>
            </tr>
          )}

          {rows.map((r, i) => {
            const d = parseJSON(r.extra_json);

            return (
              <tr key={r.enrollment_id}>
                <td>{i + 1}</td>
                <td>
                  {d.student_prefix || ""}{" "}
                  {d.student_firstname || "-"}{" "}
                  {d.student_lastname || ""}
                </td>
                <td>{d.birth_date || "-"}</td>
                <td>{d.apply_level || "-"}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => setSelected(r)}
                  >
                    ดูรายละเอียด
                  </button>

                  {r.status === "pending" && (
                    <>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => approve(r.enrollment_id)}
                      >
                        อนุมัติ
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => reject(r.enrollment_id)}
                      >
                        ไม่อนุมัติ
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ===============================
         Modal รายละเอียด (แท็บ + เอกสารแนบ)
      ================================ */}
      {selected && (() => {
        const d = parseJSON(selected.extra_json);

        // ===== files_json =====
        const rawFiles = parseJSON(selected.files_json) || {};

        // แปลง \ -> /
        const files = Object.fromEntries(
          Object.entries(rawFiles).map(([k, v]) => [
            k,
            typeof v === "string" ? v.replace(/\\/g, "/") : v
          ])
        );

        const fileLabels = {
          child_birth_certificate: "สูติบัตรเด็ก",
          child_house_reg: "ทะเบียนบ้านเด็ก",
          father_idcard_file: "บัตรประชาชนบิดา",
          mother_idcard_file: "บัตรประชาชนมารดา",
          father_house_reg: "ทะเบียนบ้านบิดา",
          mother_house_reg: "ทะเบียนบ้านมารดา"
        };

        return (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>รายละเอียดใบสมัคร</h5>
                  <button className="btn-close" onClick={() => setSelected(null)} />
                </div>

                <div className="modal-body">
                  {/* ===== Tabs ===== */}
                  <ul className="nav nav-tabs">
                    <li className="nav-item">
                      <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-student">
                        ข้อมูลเด็ก
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-address">
                        ที่อยู่
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-father">
                        บิดา
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-mother">
                        มารดา
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-care">
                        ผู้ส่ง / ผู้ดูแล
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-health">
                        สุขภาพ
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-files">
                        เอกสารแนบ
                      </button>
                    </li>
                  </ul>

                  <div className="tab-content pt-3">
                    {/* ===== ข้อมูลเด็ก ===== */}
                    <div className="tab-pane fade show active" id="tab-student">
                      <p><b>ชื่อเด็ก:</b> {d.student_prefix} {d.student_firstname} {d.student_lastname}</p>
                      <p><b>ชื่อเล่น:</b> {d.student_nickname || "-"}</p>
                      <p><b>วันเกิด:</b> {d.birth_date || "-"}</p>
                      <p><b>เพศ:</b> {d.gender || "-"}</p>
                      <p><b>เลขบัตรประชาชน:</b> {d.student_idcard || "-"}</p>
                      <p><b>น้ำหนัก / ส่วนสูง:</b> {d.birth_weight || "-"} กก. / {d.birth_height || "-"} ซม.</p>
                      <p><b>ระดับที่สมัคร:</b> {d.apply_level || "-"}</p>
                    </div>

                    {/* ===== ที่อยู่ ===== */}
                    <div className="tab-pane fade" id="tab-address">
                      <h6>ทะเบียนบ้าน</h6>
                      <p>
                        บ้านเลขที่ {d.reg_house_no || "-"} หมู่ {d.reg_moo || "-"} <br />
                        ต.{d.reg_tambon || "-"} อ.{d.reg_amphur || "-"} จ.{d.reg_province || "-"}
                      </p>

                      <h6 className="mt-3">ที่อยู่ปัจจุบัน</h6>
                      <p>
                        บ้านเลขที่ {d.curr_house_no || "-"} หมู่ {d.curr_moo || "-"} <br />
                        ต.{d.curr_tambon || "-"} อ.{d.curr_amphur || "-"} จ.{d.curr_province || "-"}
                      </p>
                    </div>

                    {/* ===== บิดา ===== */}
                    <div className="tab-pane fade" id="tab-father">
                      <p>{d.father_prefix || ""} {d.father_firstname || "-"} {d.father_lastname || "-"}</p>
                      <p>เลขบัตรประชาชน: {d.father_idcard || "-"}</p>
                      <p>อาชีพ: {d.father_job || "-"}</p>
                      <p>รายได้: {d.father_income || "-"}</p>
                      <p>โทรศัพท์: {d.father_phone || "-"}</p>
                    </div>

                    {/* ===== มารดา ===== */}
                    <div className="tab-pane fade" id="tab-mother">
                      <p>{d.mother_prefix || ""} {d.mother_firstname || "-"} {d.mother_lastname || "-"}</p>
                      <p>เลขบัตรประชาชน: {d.mother_idcard || "-"}</p>
                      <p>อาชีพ: {d.mother_job || "-"}</p>
                      <p>รายได้: {d.mother_income || "-"}</p>
                      <p>โทรศัพท์: {d.mother_phone || "-"}</p>
                    </div>

                    {/* ===== ผู้ส่ง / ผู้ดูแล ===== */}
                    <div className="tab-pane fade" id="tab-care">
                    <h6>ข้อมูลผู้ยื่นใบสมัคร</h6>
                    <p>
                        <b>ชื่อ–สกุล:</b>{" "}
                        {d.sender_prefix || ""} {d.sender_firstname || "-"} {d.sender_lastname || "-"}
                    </p>
                      <p><b>ความสัมพันธ์กับเด็ก:</b> {d.sender_relation || "-"}</p>
                      <p><b>หมายเลขโทรศัพท์:</b> {d.sender_phone || "-"}</p>

                          <hr />

                <h6>ข้อมูลผู้ดูแลเด็ก</h6>
                <p>
                     <b>ชื่อ–สกุล:</b>{" "}
                      {d.caregiver_prefix || ""} {d.caregiver_firstname || "-"} {d.caregiver_lastname || "-"}
                 </p>
                  <p><b>อาชีพ:</b> {d.caregiver_job || "-"}</p>
                  <p><b>รายได้:</b> {d.caregiver_income || "-"}</p>
                    <p><b>หมายเลขโทรศัพท์:</b> {d.caregiver_phone || "-"}</p>
                  </div>


                    {/* ===== สุขภาพ ===== */}
                    <div className="tab-pane fade" id="tab-health">
                      <p>สุขภาพช่องปาก: {d.oral_health || "-"}</p>
                      <p>หมายเหตุ: {d.note || "-"}</p>
                    </div>

                    {/* ===== เอกสารแนบ ===== */}
                    <div className="tab-pane fade" id="tab-files">
                      {Object.keys(files).length === 0 && (
                        <p className="text-muted">ไม่มีเอกสารแนบ</p>
                      )}

                      <ul>
                        {Object.entries(files).map(([key, path]) => (
                          <li key={key}>
                            {fileLabels[key] || key} :{" "}
                            {path ? (
                              <a
                                href={`http://localhost:4000/${path}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                เปิดไฟล์
                              </a>
                            ) : (
                              "-"
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
