const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    return res.json({
      token: 'admin-token',
      user: { username, role: 'admin' }
    });
  }

  if (username === 'teacher' && password === '1234') {
    return res.json({
      token: 'teacher-token',
      user: { username, role: 'teacher' }
    });
  }

  if (username === 'parent' && password === '1234') {
    return res.json({
      token: 'parent-token',
      user: { username, role: 'parent' }
    });
  }

  return res.status(401).json({ error: 'invalid credentials' });
});


module.exports = router;
