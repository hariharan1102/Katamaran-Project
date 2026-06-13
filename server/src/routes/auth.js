const express = require('express');
const { register, login, refresh, getMe } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, getMe);

module.exports = router;
