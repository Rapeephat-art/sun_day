// src/pages/AnnouncementForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/api';

export default function AnnouncementForm() {
  const { id } = useParams(); // ถ้า edit จะมี id
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // load existing announcement
      (async () => {
        setLoading(true);
        try {
          const res = await API.get(`/announcements/${id}`);
          const r = res.data.row;
          setTitle(r.title || '');
          setContent(r.content || '');
          setPreviewUrl(r.image_url || null);
        } catch (err) {
          console.error(err);
          setMsg({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลได้' });
        } finally { setLoading(false); }
      })();
    }
  }, [id]);

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setImageFile(f || null);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    if (!content || content.trim() === '') {
      setMsg({ type: 'warning', text: 'กรุณากรอกข้อความ' });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('content', content);
      if (title) fd.append('title', title);
      if (imageFile) fd.append('image', imageFile);

      // add created_by from localStorage (fallback)
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u.user_id) fd.append('created_by', u.user_id);
          else if (u.teacher_id) fd.append('created_by', u.teacher_id);
        } catch (e) {}
      }

      if (id) {
        await API.put(`/announcements/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ type: 'success', text: 'บันทึกการแก้ไขเรียบร้อย' });
        // ไปหน้า detail หรือรายการ
        navigate('/admin/announcements');
      } else {
        await API.post('/announcements', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ type: 'success', text: 'ประกาศถูกสร้าง' });
        navigate('/admin/announcements');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err && err.response && err.response.data && err.response.data.error ? err.response.data.error : 'ส่งล้มเหลว';
      setMsg({ type: 'danger', text: errMsg });
    }
  }

  return (
    <div className="container my-4">
      <h3>{id ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</h3>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input className="form-control" placeholder="หัวข้อ (ถ้ามี)" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="mb-2">
          <textarea className="form-control" rows={6} placeholder="เนื้อหา" value={content} onChange={e=>setContent(e.target.value)} />
        </div>

        <div className="mb-2">
          <label className="form-label">รูปประกอบ (ไม่จำเป็น)</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {previewUrl && <div style={{marginTop:8}}><img src={previewUrl} alt="preview" style={{maxWidth:240, maxHeight:160, objectFit:'cover'}} /></div>}
        </div>

        <div className="mb-3">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={()=>navigate('/admin/announcements')}>ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}
