const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    return res.json({
      token: 'test-token',
      user: {
        username: 'admin',
        role: 'admin'
      }
    });
  }

  res.status(401).json({ error: 'invalid credentials' });
});

module.exports = router;
