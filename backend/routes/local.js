const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

// Upload prescription image (OCR) - requires authentication
router.post(
  '/upload-prescription',
  authenticate,
  uploadLimiter,
  upload.single('prescription'),
  localController.uploadPrescription
);

// Find nearby pharmacies - public endpoint (no auth required)
router.post('/pharmacies/nearby', localController.findNearbyPharmacies);

// Prescriptions (for local users) - requires authentication
router.get('/prescriptions', authenticate, localController.getPrescriptions);
router.post('/prescriptions', authenticate, localController.savePrescription);
router.get('/prescriptions/:id', authenticate, localController.getPrescription);

// Orders (for local users) - requires authentication
router.post('/orders', authenticate, localController.placeOrder);
router.get('/orders', authenticate, localController.getOrders);
router.get('/orders/:id', authenticate, localController.getOrder);

module.exports = router;
