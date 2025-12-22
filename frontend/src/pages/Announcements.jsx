// src/pages/Announcements.jsx  (ผู้ปกครอง)
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

export default function Announcements() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/announcements');
        setRows(res.data.rows || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="container my-4">
      <h3>ข่าวประชาสัมพันธ์</h3>
      {rows.map(r => (
        <div key={r.announcement_id} className="card mb-2">
          <div className="card-body d-flex">
            {r.image_url && <div style={{marginRight:12}}><img src={r.image_url} alt={r.title} style={{maxWidth:160, maxHeight:120, objectFit:'cover'}}/></div>}
            <div>
              <strong>{r.title || ''}</strong>
              <div style={{whiteSpace:'pre-wrap'}}>{r.content}</div>
              <div className="text-muted small mt-2">{r.created_at}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-3">
        <Link to="/">กลับหน้าแรก</Link>
      </div>
    </div>
  );
}
