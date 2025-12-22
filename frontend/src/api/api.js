// src/api/api.js
import axios from 'axios';
/*
  Axios instance for frontend API calls.
  - อ่าน baseURL จาก VITE_API_URL ถ้ามี (ไฟล์ .env)
  - ฟังก์ชัน setAuthToken(token) จะเซ็ต Authorization header ให้ axios ทั้งหมด
  - ใส่ตัวแปร UPLOADED_SQL_PATH เพื่ออ้างอิงไฟล์ SQL ที่คุณอัปโหลด: /mnt/data/carechild_db.sql
    (ระบบจะเปลี่ยนเป็น URL ให้เมื่อคุณต้องการเรียกใช้งานไฟล์จริง)
*/
export const UPLOADED_SQL_PATH = '/mnt/data/carechild_db.sql';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// ตั้ง token ถ้ามีเก็บใน localStorage ตอนโหลดหน้า
const existingToken = localStorage.getItem('token');
if (existingToken) {
  API.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}
export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}
// Optional: response interceptor to centralize error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can customize global error behavior here
    // e.g. if (error.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);

export default API;
