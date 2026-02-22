const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');

// Get doctor dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPrescriptions = await Prescription.countDocuments({
      doctorId: doctor._id,
      createdAt: { $gte: today }
    });

    const totalPatients = await Prescription.distinct('patientId', {
      doctorId: doctor._id
    });

    const recentPrescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName patientId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statistics: {
          todayPrescriptions,
          activePatients: totalPatients.length,
          totalPrescriptions: doctor.statistics.totalPrescriptions,
          averageRating: doctor.statistics.averageRating
        },
        recentPrescriptions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const prescriptionData = {
      ...req.body,
      doctorId: doctor._id,
      hospitalId: doctor.hospitalId
    };

    const prescription = await Prescription.create(prescriptionData);

    // Update doctor statistics
    doctor.statistics.totalPrescriptions += 1;
    await doctor.save();

    // Update patient statistics if patient exists
    if (prescription.patientId) {
      await Patient.findByIdAndUpdate(prescription.patientId, {
        $inc: { 'statistics.totalPrescriptions': 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions by doctor
exports.getPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    const { status, page = 1, limit = 10, search } = req.query;
    const query = { doctorId: doctor._id };
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { patientName: new RegExp(search, 'i') },
        { prescriptionId: new RegExp(search, 'i') },
        { diagnosis: new RegExp(search, 'i') }
      ];
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'firstName lastName patientId')
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
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialty licenseNumber')
      .populate('patientId', 'firstName lastName patientId dateOfBirth gender')
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

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send prescription to pharmacy
exports.sendToPharmacy = async (req, res) => {
  try {
    const { pharmacyId, deliveryType, patientNotes } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Create order
    const order = await Order.create({
      prescriptionId: prescription._id,
      patientId: prescription.patientId,
      pharmacyId,
      deliveryType: deliveryType || 'pickup',
      patientNotes,
      items: prescription.medicines.map(med => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        quantity: med.quantity || 1
      })),
      status: 'prescription_sent'
    });

    res.status(201).json({
      success: true,
      message: 'Prescription sent to pharmacy successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patients list
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    // Get unique patients from prescriptions
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .distinct('patientId');

    const patients = await Patient.find({ _id: { $in: prescriptions } })
      .select('firstName lastName patientId dateOfBirth gender phone');

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Prescriptions over time
    const prescriptions = await Prescription.aggregate([
      {
        $match: {
          doctorId: doctor._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most prescribed medicines
    const topMedicines = await Prescription.aggregate([
      { $match: { doctorId: doctor._id } },
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.medicineName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Common diagnoses
    const topDiagnoses = await Prescription.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: '$diagnosis',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        prescriptionsTrend: prescriptions,
        topMedicines,
        topDiagnoses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
