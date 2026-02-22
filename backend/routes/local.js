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

// Find nearby pharmacies - requires authentication
router.post('/pharmacies/nearby', authenticate, localController.findNearbyPharmacies);

// Save prescription (for local users) - requires authentication
router.post('/prescriptions', authenticate, localController.savePrescription);

// Get prescription - requires authentication
router.get('/prescriptions/:id', authenticate, localController.getPrescription);

module.exports = router;
