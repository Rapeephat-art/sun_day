// src/pages/AdminAnnouncements.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

export default function AdminAnnouncements() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/announcements');
      setRows(res.data.rows || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>ประกาศ (Admin)</h3>
        <Link to="/admin/announcements/new" className="btn btn-primary">+ สร้างประกาศ</Link>
      </div>

      <div className="list-group">
        {rows.map(r => (
          <div key={r.announcement_id} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <strong>{r.title || '(ไม่มีหัวข้อ)'}</strong>
              <div className="text-muted small">{r.created_at}</div>
              <div style={{whiteSpace:'pre-wrap'}}>{r.content && r.content.slice(0,200)}</div>
            </div>
            <div className="text-end">
              <Link to={`/admin/announcements/${r.announcement_id}`} className="btn btn-sm btn-outline-primary me-2">รายละเอียด</Link>
              <Link to={`/admin/announcements/${r.announcement_id}/edit`} className="btn btn-sm btn-outline-success">แก้ไข</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
