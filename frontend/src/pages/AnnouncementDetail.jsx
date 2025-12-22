// src/pages/AnnouncementDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/announcements/${id}`);
        setRow(res.data.row);
      } catch (err) {
        console.error(err);
        setMsg({ type: 'danger', text: 'โหลดข้อมูลล้มเหลว' });
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('ยืนยันลบประกาศนี้?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      navigate('/admin/announcements');
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: 'ลบล้มเหลว' });
    }
  }

  if (loading) return <div className="container my-4">กำลังโหลด...</div>;
  if (!row) return <div className="container my-4">ไม่พบประกาศ</div>;

  return (
    <div className="container my-4">
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <h3>{row.title || 'ประกาศ'}</h3>
      <div className="mb-3 text-muted">{row.created_at} {row.created_by ? `• by ${row.created_by}` : ''}</div>
      {row.image_url && <div className="mb-3"><img src={row.image_url} alt={row.title || 'img'} style={{maxWidth:400}}/></div>}
      <div style={{whiteSpace:'pre-wrap'}} className="mb-4">{row.content}</div>

      <div>
        <Link to={`/admin/announcements/${id}/edit`} className="btn btn-primary me-2">แก้ไข</Link>
        <button className="btn btn-danger" onClick={handleDelete}>ลบ</button>
        <button className="btn btn-secondary ms-2" onClick={()=>navigate('/admin/announcements')}>กลับ</button>
      </div>
    </div>
  );
}
