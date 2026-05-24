const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Public routes
router.get('/', hospitalController.getHospitals);
router.get('/:id', hospitalController.getHospital);
router.get('/:hospitalId/doctors', hospitalController.getDoctors);

// Admin only routes
router.post('/', authenticate, requireAdmin, hospitalController.createHospital);
router.put('/:id', authenticate, requireAdmin, hospitalController.updateHospital);
router.delete('/:id', authenticate, requireAdmin, hospitalController.deleteHospital);

module.exports = router;
