// frontend/src/pages/Brushings.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function BrushingsPage() {
  const [teacherId, setTeacherId] = useState('');
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function load(teacher_id) {
    setMsg(null);
    try {
      const res = await API.get('/brushings/today', { params: { teacher_id } });
      setRows(res.data.rows || []);
    } catch (err) {
      console.error('load brushings err', err);
      setMsg({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลจาก server — ใช้งาน offline ได้' });
      const fallback = localStorage.getItem('brushings_rows');
      if (fallback) setRows(JSON.parse(fallback));
    }
  }

  useEffect(() => {
    // ถ้ามี auth ให้เอา teacherId จาก session แล้วเรียก load
  }, []);

  function toggle(child_id) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, brushed: !r.brushed } : r));
  }

  async function saveAll() {
    setMsg(null);
    setIsSaving(true);
    try {
      const items = rows.map(r => ({
        child_id: r.child_id,
        status: r.brushed ? 'done' : 'not',
        note: r.log?.note || null,
        created_by: teacherId || null
      }));

      const res = await API.post('/brushings', { items });
      setMsg({ type: 'success', text: `บันทึกสำเร็จ (${res.data.saved || 0})` });
      localStorage.setItem('brushings_rows', JSON.stringify(rows));
    } catch (err) {
      console.error('save brushings err', err);
      localStorage.setItem('brushings_rows', JSON.stringify(rows));
      setMsg({ type: 'warning', text: 'บันทึกไม่สำเร็จบน server — สำรองไว้ที่เครื่อง' });
    } finally {
      setIsSaving(false);
    }
  }

  function setNote(child_id, note) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, log: { ...(r.log||{}), note } } : r));
  }

  return (
    <div className="container my-4">
      <h3>บันทึกการแปรงฟัน</h3>

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
                <th style={{width:120}}>แปรงฟัน</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="4" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, idx) => (
                <tr key={r.child_id}>
                  <td>{idx+1}</td>
                  <td>{r.name} {r.nickname ? `(${r.nickname})` : ''}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" checked={!!r.brushed} onChange={()=>toggle(r.child_id)} />
                    </div>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.log?.note || ''} onChange={(e)=> setNote(r.child_id, e.target.value)} placeholder="หมายเหตุ (เช่น ทำความสะอาด/มีปัญหา)" />
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
