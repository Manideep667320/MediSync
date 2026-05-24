const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { requirePatient } = require('../middleware/roleCheck');

// All routes require authentication and patient role
router.use(authenticate, requirePatient);

// Dashboard
router.get('/dashboard', patientController.getDashboard);

// Prescriptions
router.get('/prescriptions', patientController.getPrescriptions);
router.get('/prescriptions/:id', patientController.getPrescription);
router.patch('/prescriptions/:id/cancel', patientController.cancelPrescription);
router.post('/prescriptions/:id/refill', patientController.requestRefill);

// Orders
router.get('/orders', patientController.getOrders);
router.get('/orders/:id', patientController.getOrder);

// Billing
router.get('/billing', patientController.getBillingHistory);

// Preferred pharmacies
router.put('/preferred-pharmacies', patientController.updatePreferredPharmacies);

// Doctors
router.get('/doctors', patientController.getDoctors);

// Consultations
router.post('/consultations', patientController.bookConsultation);
router.get('/consultations', patientController.getConsultations);
router.patch('/consultations/:id/cancel', patientController.cancelConsultation);

module.exports = router;
