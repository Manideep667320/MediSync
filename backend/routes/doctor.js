const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');
const { requireDoctor } = require('../middleware/roleCheck');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// All routes require authentication and doctor role
router.use(authenticate, requireDoctor);

// Dashboard
router.get('/dashboard', doctorController.getDashboard);

// Prescriptions
router.post('/prescriptions', doctorController.createPrescription);
router.get('/prescriptions', doctorController.getPrescriptions);
router.get('/prescriptions/:id', doctorController.getPrescription);
router.put('/prescriptions/:id', doctorController.updatePrescription);

// Voice to Text Prescription
router.post('/voice-prescription', upload.single('audio'), doctorController.processVoicePrescription);

// Parse prescription text into structured data
router.post('/parse-prescription', doctorController.parsePrescriptionText);

// Send prescription to pharmacy
router.post('/prescriptions/:id/send', doctorController.sendToPharmacy);

// Patients
router.get('/patients', doctorController.getPatients);

// Analytics
router.get('/analytics', doctorController.getAnalytics);

// Pharmacies
router.get('/pharmacies', doctorController.getPharmacies);

module.exports = router;
