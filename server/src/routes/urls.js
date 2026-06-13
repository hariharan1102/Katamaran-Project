const express = require('express');
const multer = require('multer');
const {
  createShortUrl,
  listUrls,
  deleteUrl,
  updateUrl,
  bulkShorten,
} = require('../controllers/url.controller');
const {
  getUrlAnalytics,
  getPublicUrlStats,
  getQrCode,
} = require('../controllers/analytics.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// URL Shortening & Management
router.post('/', optionalAuth, createShortUrl);
router.get('/', authMiddleware, listUrls);
router.delete('/:id', authMiddleware, deleteUrl);
router.patch('/:id', authMiddleware, updateUrl);

// Bulk Shortening
router.post('/bulk', authMiddleware, upload.single('file'), bulkShorten);

// Analytics & QR Codes
router.get('/:id/analytics', authMiddleware, getUrlAnalytics);
router.get('/public/:shortCode', getPublicUrlStats);
router.get('/:shortCode/qr', getQrCode);

module.exports = router;
