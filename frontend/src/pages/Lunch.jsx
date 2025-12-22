// frontend/src/pages/Lunch.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function LunchPage() {
  const [teacherId, setTeacherId] = useState(''); // ถ้ามี auth ให้ดึงจาก session
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [menus, setMenus] = useState([]);
  const [menuId, setMenuId] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  async function loadMenus() {
    setLoadingMenus(true);
    try {
      const res = await API.get('/lunch/menus');
      setMenus(res.data.menus || []);
    } catch (err) {
      console.error('loadMenus err', err);
      setMsg({ type: 'danger', text: 'ไม่สามารถโหลดเมนูจาก server' });
    } finally {
      setLoadingMenus(false);
    }
  }

  async function loadSummaries() {
    try {
      const res = await API.get('/lunch/summaries', { params: { date, teacher_id: teacherId || undefined } });
      setSummaries(res.data.rows || []);
    } catch (err) {
      console.error('loadSummaries err', err);
      setMsg({ type: 'warning', text: 'ไม่สามารถโหลดสรุปอาหารจาก server' });
    }
  }

  useEffect(() => {
    loadMenus();
    // ถ้ามี teacherId อัตโนมัติ ให้เรียก loadSummaries ที่ useEffect ต่อไป
  }, []);

  useEffect(() => {
    if (teacherId) loadSummaries();
  }, [date, teacherId]);

  async function saveSummary() {
    setMsg(null);
    if (!menuId) {
      setMsg({ type: 'danger', text: 'กรุณาเลือกเมนู' });
      return;
    }
    if (!teacherId) {
      setMsg({ type: 'danger', text: 'กรุณาระบุ teacher_id (หรือเชื่อม auth)' });
      return;
    }

    try {
      const payload = { menu_id: menuId, summary_date: date, teacher_id: teacherId, note };
      const res = await API.post('/lunch/summaries', payload);
      setMsg({ type: 'success', text: 'บันทึกสรุปอาหารเรียบร้อย' });
      setNote('');
      // reload summaries
      loadSummaries();
    } catch (err) {
      console.error('saveSummary err', err);
      setMsg({ type: 'danger', text: 'บันทึกไม่สำเร็จ' });
    }
  }

  return (
    <div className="container my-4">
      <h3>บันทึกอาหารกลางวัน</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row g-2 align-items-end mb-3">
        <div className="col-md-3">
          <label className="form-label">วันที่</label>
          <input type="date" className="form-control" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>

        <div className="col-md-3">
          <label className="form-label">เมนู</label>
          <select className="form-select" value={menuId} onChange={(e)=>setMenuId(e.target.value)}>
            <option value="">-- เลือกเมนู --</option>
            {menus.map(m => <option key={m.menu_id} value={m.menu_id}>{m.name} {m.menu_type ? `(${m.menu_type})` : ''}</option>)}
          </select>
        </div>

       

        <div className="col-md-3 text-end">
          <button className="btn btn-primary" onClick={saveSummary}>บันทึกสรุปอาหาร</button>
        </div>

        <div className="col-12 mt-2">
          <label className="form-label">หมายเหตุ / คำอธิบาย</label>
          <input className="form-control" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="ตัวอย่าง: เด็กหลายคนแพ้ถั่ว, ลดเค็ม" />
        </div>
      </div>

      <hr />

      <h5>สรุปอาหารวันนี้</h5>
      <div className="mb-3">
        <button className="btn btn-outline-secondary me-2" onClick={loadSummaries}>โหลดสรุป</button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ลำดับ</th>
                <th>เมนู</th>
                <th>ครู/ผู้บันทึก</th>
                <th>หมายเหตุ</th>
                <th>บันทึกเวลา</th>
              </tr>
            </thead>
            <tbody>
              {summaries.length === 0 && <tr><td colSpan="5" className="text-center py-4">ยังไม่มีสรุปสำหรับวันนี้</td></tr>}
              {summaries.map((s, i) => (
                <tr key={s.summary_id || i}>
                  <td>{i+1}</td>
                  <td>{s.menu_name || '-'}</td>
                  <td>{s.teacher_first ? `${s.teacher_first} ${s.teacher_last || ''}` : (s.teacher_id || '-')}</td>
                  <td>{s.note || '-'}</td>
                  <td>{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
