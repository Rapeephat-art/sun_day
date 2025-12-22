// frontend/src/pages/Measurements.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function MeasurementsPage() {
  const [teacherId, setTeacherId] = useState(''); // เติมจาก session หากมี
  const [rows, setRows] = useState([]); // { child_id, name, nickname, measurement: {weight,height,note} }
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [msg, setMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function load(teacher_id) {
    setMsg(null);
    try {
      const res = await API.get('/measurements/today', { params: { teacher_id } });
      setRows(res.data.rows || []);
      // ถ้า API ส่ง month/year ปรับ date แต่ไม่จำเป็น
    } catch (err) {
      console.error('load measurements err', err);
      setMsg({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลจาก server — ใช้งาน offline ได้' });
      // fallback: ถ้ามี localStorage
      const fallback = localStorage.getItem(`measurements_${date}`);
      if (fallback) setRows(JSON.parse(fallback));
    }
  }

  useEffect(() => {
    // ถ้ามีระบบ auth ให้เอา teacherId มาจาก session แทน
    // ตัวอย่าง: setTeacherId(auth.user.teacher_id); เลยแล้วเรียก load
  }, []);

  function onChangeVal(child_id, key, value) {
    setRows(prev => prev.map(r => r.child_id === child_id ? {
      ...r,
      measurement: {
        ...(r.measurement || {}),
        [key]: value
      }
    } : r));
  }

  async function saveAll() {
    setMsg(null);
    setIsSaving(true);
    try {
      const items = rows.map(r => ({
        child_id: r.child_id,
        measurement_date: date,
        weight: r.measurement?.weight || null,
        height: r.measurement?.height || null,
        note: r.measurement?.note || null,
        created_by: teacherId || null
      }));

      const res = await API.post('/measurements', { items });
      setMsg({ type: 'success', text: `บันทึกสำเร็จ (${res.data.saved || 0})` });
      // สำรอง local
      localStorage.setItem(`measurements_${date}`, JSON.stringify(rows));
    } catch (err) {
      console.error('saveAll measurements err', err);
      // fallback local
      localStorage.setItem(`measurements_${date}`, JSON.stringify(rows));
      setMsg({ type: 'warning', text: 'ไม่สามารถบันทึกบน server — บันทึกสำรองไว้ที่เครื่อง' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h3>บันทึกน้ำหนัก-ส่วนสูง</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row mb-3">
        <div className="col-md-3">
          <input type="date" className="form-control" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>

        <div className="col-md-6 text-end">
          <button className="btn btn-outline-secondary me-2" onClick={()=> load(teacherId)}>โหลดรายชื่อ</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={isSaving}>{isSaving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อ</th>
                <th style={{width:140}}>น้ำหนัก (kg)</th>
                <th style={{width:140}}>ส่วนสูง (cm)</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="5" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, idx) => (
                <tr key={r.child_id}>
                  <td>{idx+1}</td>
                  <td>{r.name} {r.nickname ? `(${r.nickname})` : ''}</td>
                  <td>
                    <input className="form-control form-control-sm" type="number" step="0.1" min="0" value={r.measurement?.weight || ''} onChange={(e)=> onChangeVal(r.child_id, 'weight', e.target.value)} />
                  </td>
                  <td>
                    <input className="form-control form-control-sm" type="number" step="0.1" min="0" value={r.measurement?.height || ''} onChange={(e)=> onChangeVal(r.child_id, 'height', e.target.value)} />
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.measurement?.note || ''} onChange={(e)=> onChangeVal(r.child_id, 'note', e.target.value)} placeholder="หมายเหตุ (ถ้ามี)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
