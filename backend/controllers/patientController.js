const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const Billing = require('../models/Billing');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');

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

    // Doctor-issued prescriptions only (exclude consultation booking placeholders)
    const prescriptionCandidates = await Prescription.find({
      patientId: patient._id,
      status: { $ne: 'cancelled' },
      doctorNotes: { $not: /^Consultation / }
    })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    const recentPrescriptions = prescriptionCandidates.filter((rx) => {
      const meds = rx.medicines || [];
      if (meds.length === 0) return false;
      const onlyPlaceholder = meds.every((m) => m.medicineName === 'Awaiting consultation');
      return !onlyPlaceholder;
    }).slice(0, 5);

    const upcomingConsultations = await Consultation.find({
      patientId: patient._id,
      status: { $in: ['scheduled', 'in-progress'] }
    })
      .populate('doctorId', 'firstName lastName specialty consultationFee')
      .populate('hospitalId', 'name address phone')
      .sort({ scheduledDate: 1 })
      .limit(10);

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
        upcomingConsultations,
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

// Cancel a scheduled consultation (appointment)
exports.cancelConsultation = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      patientId: patient._id,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    consultation.status = 'cancelled';
    consultation.updatedAt = new Date();
    await consultation.save();

    // Clean up legacy booking placeholder prescriptions linked to this consultation
    await Prescription.updateMany(
      { patientId: patient._id, doctorNotes: `Consultation ${consultation._id}` },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel a pending prescription (legacy booking records)
exports.cancelPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patientId: patient._id
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const cancellableStatuses = ['PENDING', 'draft', 'pending'];
    if (!cancellableStatuses.includes(prescription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending consultation bookings can be cancelled'
      });
    }

    const activeOrder = await Order.findOne({
      prescriptionId: prescription._id,
      status: { $nin: ['completed', 'cancelled'] }
    });

    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a prescription with an active pharmacy order'
      });
    }

    prescription.status = 'cancelled';
    await prescription.save();

    if (prescription.doctorNotes?.startsWith('Consultation ')) {
      const consultationId = prescription.doctorNotes.replace('Consultation ', '').trim();
      if (mongoose.Types.ObjectId.isValid(consultationId)) {
        await Consultation.findOneAndUpdate(
          { _id: consultationId, patientId: patient._id, status: 'scheduled' },
          { status: 'cancelled', updatedAt: new Date() }
        );
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Book a consultation
exports.bookConsultation = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const { doctorId, hospitalId, scheduledDate, consultationType, reason } = req.body;
    const effectiveHospitalId = hospitalId || patient.hospitalId;

    if (!doctorId || !effectiveHospitalId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctorId, hospitalId, scheduledDate'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      });
    }

    const consultation = await Consultation.create({
      patientId: patient._id,
      doctorId,
      hospitalId: effectiveHospitalId,
      scheduledDate: new Date(scheduledDate),
      consultationType: consultationType || 'in-person',
      reason,
      status: 'scheduled'
    });

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('doctorId', 'firstName lastName specialty consultationFee')
      .populate('hospitalId', 'name address phone');

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: { consultation: populatedConsultation }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient consultations
exports.getConsultations = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const consultations = await Consultation.find({ patientId: patient._id })
      .populate('doctorId', 'firstName lastName specialty consultationFee')
      .populate('hospitalId', 'name address phone')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      data: { consultations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all doctors for booking
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .select('firstName lastName specialty experience consultationFee profileImage hospitalId')
      .populate('hospitalId', 'name');
      
    res.json({
      success: true,
      data: { doctors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
