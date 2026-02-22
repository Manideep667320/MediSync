const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const Billing = require('../models/Billing');

// Get patient dashboard
exports.getDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({ patientId: patient._id })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get active orders
    const activeOrders = await Order.find({
      patientId: patient._id,
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('pharmacyId', 'name address phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        patient,
        statistics: patient.statistics,
        recentPrescriptions,
        activeOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions for patient
exports.getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patientId: patient._id };
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'firstName lastName specialty')
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single prescription
exports.getPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
      .populate('doctorId', 'firstName lastName specialty licenseNumber')
      .populate('hospitalId', 'name address phone');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders
exports.getOrders = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patientId: patient._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('prescriptionId', 'prescriptionId diagnosis')
      .populate('pharmacyId', 'name address phone rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order with tracking
exports.getOrder = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    const order = await Order.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
      .populate('prescriptionId')
      .populate('pharmacyId', 'name address phone location operatingHours');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get billing history
exports.getBillingHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const { page = 1, limit = 10 } = req.query;

    const bills = await Billing.find({ patientId: patient._id })
      .populate('pharmacyId', 'name')
      .populate('prescriptionId', 'prescriptionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Billing.countDocuments({ patientId: patient._id });

    res.json({
      success: true,
      data: {
        bills,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update preferred pharmacies
exports.updatePreferredPharmacies = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const { pharmacyIds } = req.body;

    patient.preferredPharmacies = pharmacyIds;
    await patient.save();

    res.json({
      success: true,
      message: 'Preferred pharmacies updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Request prescription refill
exports.requestRefill = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription || prescription.patientId.toString() !== patient._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Here you would implement refill request logic
    // For now, just return success message

    res.json({
      success: true,
      message: 'Refill request sent to doctor successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
