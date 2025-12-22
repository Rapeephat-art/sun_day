// frontend/src/pages/Health.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function HealthPage() {
  const [teacherId, setTeacherId] = useState(''); // ถ้ามีระบบ auth ให้ดึงจาก session
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function load(teacher_id) {
    setMsg(null);
    try {
      const res = await API.get('/health/today', { params: { teacher_id } });
      setRows(res.data.rows || []);
    } catch (err) {
      console.error('load health err', err);
      setMsg({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลจาก server — ใช้งาน offline ได้' });
      const fallback = localStorage.getItem('health_rows');
      if (fallback) setRows(JSON.parse(fallback));
    }
  }

  useEffect(() => {
    // ถ้ามีระบบ auth ให้ตั้ง teacherId อัตโนมัติและเรียก load
  }, []);

  function onChangeField(child_id, field, value) {
    setRows(prev => prev.map(r => r.child_id === child_id ? {
      ...r,
      evaluation: {
        ...(r.evaluation || {}),
        [field]: value
      }
    } : r));
  }

  async function saveAll() {
    setMsg(null);
    setIsSaving(true);
    try {
      const items = rows.map(r => ({
        child_id: r.child_id,
        hair: r.evaluation?.hair || null,
        eye: r.evaluation?.eye || null,
        mouth: r.evaluation?.mouth || null,
        tooth: r.evaluation?.tooth || null,
        ear: r.evaluation?.ear || null,
        nose: r.evaluation?.nose || null,
        skin: r.evaluation?.skin || null,
        nail: r.evaluation?.nail || null,
        note: r.evaluation?.note || null,
        created_by: teacherId || null
      }));

      const res = await API.post('/health', { items });
      setMsg({ type: 'success', text: `บันทึกสำเร็จ (${res.data.saved || 0})` });
      localStorage.setItem('health_rows', JSON.stringify(rows));
    } catch (err) {
      console.error('saveAll health err', err);
      localStorage.setItem('health_rows', JSON.stringify(rows));
      setMsg({ type: 'warning', text: 'ไม่สามารถบันทึกบน server — สำรองไว้ในเครื่อง' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h3>บันทึกสุขภาพ (Health Evaluation)</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row mb-3">
        <div className="col-md-8 text-end">
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
                <th>ผม</th>
                <th>ตา</th>
                <th>ปาก</th>
                <th>ฟัน</th>
                <th>หู</th>
                <th>จมูก</th>
                <th>ผิวหนัง</th>
                <th>เล็บ</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="11" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, idx) => (
                <tr key={r.child_id}>
                  <td>{idx+1}</td>
                  <td>{r.name} {r.nickname ? `(${r.nickname})` : ''}</td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.hair || ''} onChange={(e)=> onChangeField(r.child_id, 'hair', e.target.value)} placeholder="ผม" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.eye || ''} onChange={(e)=> onChangeField(r.child_id, 'eye', e.target.value)} placeholder="ตา" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.mouth || ''} onChange={(e)=> onChangeField(r.child_id, 'mouth', e.target.value)} placeholder="ปาก" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.tooth || ''} onChange={(e)=> onChangeField(r.child_id, 'tooth', e.target.value)} placeholder="ฟัน" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.ear || ''} onChange={(e)=> onChangeField(r.child_id, 'ear', e.target.value)} placeholder="หู" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.nose || ''} onChange={(e)=> onChangeField(r.child_id, 'nose', e.target.value)} placeholder="จมูก" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.skin || ''} onChange={(e)=> onChangeField(r.child_id, 'skin', e.target.value)} placeholder="ผิวหนัง" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.nail || ''} onChange={(e)=> onChangeField(r.child_id, 'nail', e.target.value)} placeholder="เล็บ" /></td>
                  <td><input className="form-control form-control-sm" value={r.evaluation?.note || ''} onChange={(e)=> onChangeField(r.child_id, 'note', e.target.value)} placeholder="หมายเหตุ" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
