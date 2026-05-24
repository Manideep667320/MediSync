const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { authenticate } = require('../middleware/auth');
const { requirePharmacy } = require('../middleware/roleCheck');

// All routes require authentication and pharmacy role
router.use(authenticate, requirePharmacy);

// Dashboard
router.get('/dashboard', pharmacyController.getDashboard);

// Orders
router.get('/orders', pharmacyController.getOrders);
router.post('/orders', pharmacyController.createIntake);
router.get('/orders/:id', pharmacyController.getOrder);
router.put('/orders/:id', pharmacyController.updateOrderStatus);

// Billing
router.post('/orders/:id/bill', pharmacyController.generateBill);

// Inventory
router.get('/inventory', pharmacyController.getInventory);
router.post('/inventory', pharmacyController.addInventoryItem);
router.put('/inventory/:id', pharmacyController.updateInventory);

// Analytics
router.get('/analytics', pharmacyController.getAnalytics);

module.exports = router;
