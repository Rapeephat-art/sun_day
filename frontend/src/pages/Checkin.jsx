// frontend/src/pages/Checkin.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api'; // axios instance
import { useNavigate } from 'react-router-dom';

export default function CheckinPage({ /* optional: teacherId from props */ }) {
  const [rows, setRows] = useState([]); // children + status
  const [classroomId, setClassroomId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  // NOTE: ถ้าแอปของคุณมีระบบ auth ให้รับ teacher_id จาก user session.
  // ตอนนี้ใช้ prompt/กรอกเพื่อทดสอบ หรือคุณจะส่ง teacher_id ผ่าน query string
  const [teacherIdInput, setTeacherIdInput] = useState('');

  async function load(teacher_id) {
    setMsg(null);
    try {
      const res = await API.get('/checkins/today', { params: { teacher_id } });
      setRows(res.data.rows || []);
      setClassroomId(res.data.classroom_id || null);
      setDate(res.data.date || date);
    } catch (err) {
      console.error('load checkins err', err);
      setMsg({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลเช็คชื่อจาก server' });
    }
  }

  useEffect(() => {
    // ถ้าแอปมี user session ให้เรียก load(user.teacher_id) แทน
    // ปล่อยให้ครูกรอก teacher id สำหรับเดโม
    // ถ teacherIdInput มีค่า ให้ load อัตโนมัติ
  }, []);

  function mark(child_id, status) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, status } : r));
    setMsg(null);
  }

  function setNote(child_id, note) {
    setRows(prev => prev.map(r => r.child_id === child_id ? { ...r, note } : r));
  }

  async function saveOne(r) {
    try {
      const payload = {
        child_id: r.child_id,
        status: r.status,
        note: r.note,
        created_by: teacherIdInput || null
      };
      const res = await API.post('/checkins', payload);
      setMsg({ type: 'success', text: `บันทึก: ${r.name} (${res.data.action})` });
    } catch (err) {
      console.error('save one err', err);
      setMsg({ type: 'danger', text: `บันทึกล้มเหลวสำหรับ ${r.name}` });
    }
  }

  async function saveAll() {
    setMsg(null);
    try {
      // บันทึกทีละคน (เรียก POST /api/checkins)
      for (const r of rows) {
        await API.post('/checkins', {
          child_id: r.child_id,
          status: r.status,
          note: r.note,
          created_by: teacherIdInput || null
        });
      }
      setMsg({ type: 'success', text: 'บันทึกเช็คชื่อทั้งหมดสำเร็จ' });
    } catch (err) {
      console.error('saveAll err', err);
      setMsg({ type: 'warning', text: 'บันทึกบางรายการล้มเหลว — ตรวจ console' });
    }
  }

  return (
    <div className="container my-4">
      <h3>เช็คชื่อ (วันที่ {date})</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row mb-3">
        <div className="col-md-8 text-end">
          <button className="btn btn-secondary me-2" onClick={()=> load(teacherIdInput)}>โหลดรายชื่อ</button>
          <button className="btn btn-primary" onClick={saveAll}>บันทึกทั้งหมด</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อ</th>
                <th style={{width:240}}>สถานะ</th>
                <th>หมายเหตุ</th>
                <th style={{width:140}}>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="5" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, i) => (
                <tr key={r.child_id}>
                  <td>{i+1}</td>
                  <td>{r.name} {r.nickname ? `(${r.nickname})` : ''}</td>
                  <td>
                    <select className="form-select form-select-sm" value={r.status}onChange={(e) => mark(r.child_id, e.target.value)}>
                        <option value="มา">มา</option>
                        <option value="ขาด">ขาด</option>
                        <option value="ลา">ลา</option>
                    </select>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.note || ''} onChange={(e)=>setNote(r.child_id, e.target.value)} placeholder="หมายเหตุ (ถ้ามี)" />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={()=>saveOne(r)}>บันทึก</button>
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
