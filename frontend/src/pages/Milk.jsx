// frontend/src/pages/Milk.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function MilkPage() {
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
      const res = await API.get('/milk/today', { params: { teacher_id: teacherId, date } });
      setRows(res.data.rows || []);
    } catch (err) {
      console.error('load milk err', err);
      setMsg({ type: 'danger', text: 'โหลดข้อมูลล้มเหลว' });
    }
  }

  useEffect(() => {
    // ถ้ามี auth ให้ setTeacherId จาก session แล้วเรียก load()
  }, []);

  useEffect(() => {
    load();
  }, [teacherId, date]);

  function updateMilk(child_id, field, value) {
    setRows(prev => prev.map(r => r.child_id === child_id ? {
      ...r,
      milk: { ...(r.milk || {}), [field]: value }
    } : r));
  }

  function updateStatus(child_id, status) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, status } : r));
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
        status: r.status || 'not',
        milk: {
          amount_ml: r.milk?.amount_ml || '',
          milk_type: r.milk?.milk_type || '',
          time: r.milk?.time || ''
        },
        log_id: r.log_id || null
      }));

      const res = await API.post('/milk/save', { teacher_id: teacherId, date, items });
      setMsg({ type: 'success', text: `บันทึกสำเร็จ (${res.data.saved || 0})` });
      // reload
      load();
    } catch (err) {
      console.error('save milk err', err);
      setMsg({ type: 'danger', text: 'บันทึกล้มเหลว' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h3>บันทึกการดื่มนม</h3>

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
                <th style={{width:120}}>สถานะ</th>
                <th style={{width:140}}>ปริมาณ (ml)</th>
                <th style={{width:160}}>ประเภท</th>
                <th style={{width:140}}>เวลา</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="7" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, idx) => (
                <tr key={r.child_id}>
                  <td>{idx+1}</td>
                  <td>{r.name} {r.nickname ? `(${r.nickname})` : ''}</td>
                  <td>
                    <select className="form-select form-select-sm" value={r.status || 'not'} onChange={(e)=> updateStatus(r.child_id, e.target.value)}>
                      <option value="drank">ดื่ม</option>
                      <option value="not">ไม่ดื่ม</option>
                      <option value="allergy">แพ้</option>
                      <option value="notcome">ไม่มา</option>
                    </select>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" type="number" min="0" step="1" value={r.milk?.amount_ml || ''} onChange={(e)=> updateMilk(r.child_id, 'amount_ml', e.target.value)} />
                  </td>
                  <td>
                    <select className="form-select form-select-sm" value={r.milk?.milk_type || ''} onChange={(e)=> updateMilk(r.child_id, 'milk_type', e.target.value)}>
                      <option value="">เลือก</option>
                      <option value="bottle">ขวด</option>
                      <option value="formula">นมผง</option>
                      <option value="milk_box">กล่องนม</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" type="time" value={r.milk?.time || ''} onChange={(e)=> updateMilk(r.child_id, 'time', e.target.value)} />
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.note || ''} onChange={(e)=> setRows(prev => prev.map(x => x.child_id === r.child_id ? { ...x, note: e.target.value } : x))} placeholder="หมายเหตุ (ถ้ามี)" />
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
