// frontend/src/pages/LunchEating.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function LunchEating() {
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!teacherId) {
      setRows([]);
      return;
    }
    try {
      setMsg(null);
      const res = await API.get('/lunch-eating/today', { params: { teacher_id: teacherId, date } });
      setRows(res.data.rows || []);
    } catch (err) {
      console.error('load lunch eating err', err);
      setMsg({ type: 'danger', text: 'โหลดข้อมูลล้มเหลว' });
    }
  }

  useEffect(() => {
    // ถ้ามีระบบ auth ให้ setTeacherId จาก session แล้วเรียก load()
  }, []);

  useEffect(() => {
    // reload เมื่อ teacherId หรือ date เปลี่ยน
    load();
  }, [teacherId, date]);

  function updateStatus(child_id, status) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, status } : r));
  }

  function updateNote(child_id, note) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, note } : r));
  }

  async function saveAll() {
    if (!teacherId) {
      setMsg({ type: 'danger', text: 'กรุณาระบุ teacher_id' });
      return;
    }
    setSaving(true);
    try {
      const items = rows.map(r => ({
        child_id: r.child_id,
        status: r.status,
        note: r.note,
        log_id: r.log_id || null
      }));
      await API.post('/lunch-eating/save', { teacher_id: teacherId, date, items });
      setMsg({ type: 'success', text: 'บันทึกสำเร็จ' });
      // reload to get log_id updated
      load();
    } catch (err) {
      console.error('save lunch eating err', err);
      setMsg({ type: 'danger', text: 'บันทึกล้มเหลว' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h3>บันทึกการรับประทานอาหารกลางวัน</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row mb-3 g-2">
        
        <div className="col-md-3">
          <label className="form-label">วันที่</label>
          <input type="date" className="form-control" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        <div className="col-md-6 text-end align-self-end">
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>ชื่อ</th>
                <th style={{width:180}}>สถานะ</th>
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
                    <select className="form-select form-select-sm" value={r.status} onChange={(e)=> updateStatus(r.child_id, e.target.value)}>
                      <option value="กิน">กิน</option>
                      <option value="ไม่กิน">ไม่กิน</option>
                      <option value="แพ้อาหาร">แพ้อาหาร</option>
                      <option value="ไม่มา">ไม่มา</option>
                    </select>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.note || ''} onChange={(e)=> updateNote(r.child_id, e.target.value)} placeholder="หมายเหตุ (เช่น แพ้ถั่ว)" />
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
