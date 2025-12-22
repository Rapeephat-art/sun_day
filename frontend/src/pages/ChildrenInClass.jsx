// src/pages/ChildrenInClass.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ChildrenInClass() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  function getTeacherIdFromLocalStorage() {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      // ลองหลาย field ที่เป็นไปได้
      return user?.teacher_id || user?.id || user?.userId || null;
    } catch (e) {
      return null;
    }
  }

  async function load() {
    setLoading(true);
    setMsg(null);
    setRows([]);
    try {
      const teacherId = getTeacherIdFromLocalStorage();
      if (!teacherId) {
        setMsg({ type: 'warning', text: 'ไม่พบ teacher_id ใน localStorage. สำหรับทดสอบ ให้รัน: localStorage.setItem(\"user\", JSON.stringify({teacher_id:1})) (เปลี่ยน 1 เป็น id จริง)' });
        setLoading(false);
        return;
      }

      // ส่งเป็น query param
      const res = await API.get('/children/myclass', { params: { teacher_id: teacherId } });
      if (res?.data?.rows) setRows(res.data.rows);
    } catch (err) {
      console.error('load children in class err', err);
      const text = err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว';
      setMsg({ type: 'danger', text: `โหลดข้อมูลล้มเหลว: ${text}` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function gotoDetail(child_id) {
    navigate(`/children/${child_id}`);
  }

  return (
    <div className="container my-4">
      <h3>รายการเด็กในห้องของครู</h3>

      {msg && <div className={`alert alert-${msg.type || 'info'}`}>{msg.text}</div>}

      <div className="mb-3">
        <button className="btn btn-secondary" onClick={load} disabled={loading}>{loading ? 'กำลังโหลด...' : 'รีโหลด'}</button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>รหัส</th>
                <th>ชื่อ - นามสกุล</th>
                <th>ชื่อเล่น</th>
                <th>วันเกิด</th>
                <th>เพศ</th>
                <th>เชื้อชาติ / สัญชาติ</th>
                <th>หมายเหตุ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="9" className="text-center py-4">ยังไม่มีข้อมูล</td></tr>}
              {rows.map((r, idx) => (
                <tr key={r.child_id}>
                  <td>{idx+1}</td>
                  <td>{r.child_code || '-'}</td>
                  <td>{(r.prefix ? r.prefix + ' ' : '') + r.first_name + ' ' + (r.last_name || '')}</td>
                  <td>{r.nickname || '-'}</td>
                  <td>{r.birthday || '-'}</td>
                  <td>{r.gender || '-'}</td>
                  <td>{(r.ethnicity || '') + (r.nationality ? ' / ' + r.nationality : '')}</td>
                  <td style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.note || ''}>{r.note || ''}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => gotoDetail(r.child_id)}>รายละเอียด</button>
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
