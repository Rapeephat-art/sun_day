import axios from 'axios';

const API = axios.create({
  baseURL: "https://sun-day-node.onrender.com"
});


export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  }
}

export default API;
