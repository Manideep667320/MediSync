const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const Consultation = require('../models/Consultation');
const fs = require('fs');
const { AssemblyAI } = require('assemblyai');
const { parseText, extractVoiceContext } = require('../services/prescriptionParser');

const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

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

    const recentPrescriptions = await Prescription.find({ 
      doctorId: doctor._id,
      status: { $ne: 'cancelled' },
      doctorNotes: { $not: /^Consultation / }
    })
      .populate('patientId', 'firstName lastName patientId')
      .sort({ createdAt: -1 })
      .limit(10);

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

    // Update patient statistics and notify them if patient exists
    if (prescription.patientId) {
      const patientObj = await Patient.findByIdAndUpdate(prescription.patientId, {
        $inc: { 'statistics.totalPrescriptions': 1 }
      }, { new: true });

      if (patientObj && patientObj.userId) {
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            userId: patientObj.userId,
            title: 'New Prescription Issued',
            message: `Dr. ${doctor.firstName} ${doctor.lastName} has created prescription ${prescription.prescriptionId || ''} for you.`,
            type: 'success',
            link: '/dashboard'
          });
        } catch (err) {
          console.error('Failed to create patient notification:', err);
        }
      }
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
    const query = { 
      doctorId: doctor._id,
      doctorNotes: { $not: /^Consultation / } 
    };

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

    // Update prescription status
    prescription.status = 'SENT';
    await prescription.save();

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

// Process Voice Prescription
exports.processVoicePrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AssemblyAI API key is missing. Please check your .env file.'
      });
    }

    // 1. Transcribe audio using AssemblyAI
    const transcript = await assemblyai.transcripts.transcribe({
      audio: req.file.buffer,
      speech_models: ['universal-2']
    });

    const rawText = transcript.text || '';

    // 2. Extract patient context (name, age, diagnosis, symptoms) from speech
    const context = extractVoiceContext(rawText);

    // 3. Parse only the medicine-related text into structured items
    const parsed = parseText(context.medicineText);
    const medicines = (parsed.items || []).map(item => ({
      medicine_name: item.medicine,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
      quantity: item.quantity || 1
    }));

    const structuredPrescription = {
      patient_name: context.patient_name,
      age: context.age,
      diagnosis: context.diagnosis,
      symptoms: context.symptoms,
      medicines,
      notes: rawText
    };

    res.json({
      success: true,
      data: {
        raw_text: rawText,
        prescription: structuredPrescription
      }
    });

  } catch (error) {
    console.error('Voice Prescription Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing voice prescription'
    });
  }
};

// Parse prescription text into structured data (no API key required)
exports.parsePrescriptionText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prescription text is required'
      });
    }

    const result = parseText(text);

    res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    console.error('Parse Prescription Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error parsing prescription text'
    });
  }
};
// Get all active pharmacies
exports.getPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true })
      .select('name address phone');

    res.json({
      success: true,
      data: pharmacies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validate prescription medicines for duplicates and dosage warnings
exports.validatePrescription = async (req, res) => {
  try {
    const { medicines } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Medicines array is required for validation'
      });
    }

    const alerts = [];
    const namesSeen = new Set();

    for (let med of medicines) {
      const nameNorm = (med.medicineName || med.medicine_name || '').trim().toLowerCase();
      if (!nameNorm) continue;

      // 1. Duplicate Check
      if (namesSeen.has(nameNorm)) {
        alerts.push({
          type: 'DUPLICATE',
          severity: 'WARNING',
          message: `Therapeutic Duplicate: '${med.medicineName || med.medicine_name}' is prescribed multiple times.`,
          medicineName: med.medicineName || med.medicine_name
        });
      }
      namesSeen.add(nameNorm);

      // 2. Dosage check
      const dosageStr = (med.dosage || '').trim().toLowerCase();
      let numericDosage = 0;
      if (dosageStr.includes('mg')) {
        numericDosage = parseFloat(dosageStr.replace(/[^\d.]/g, '')) || 0;
      } else if (dosageStr.includes('g') && !dosageStr.includes('mcg')) {
        numericDosage = (parseFloat(dosageStr.replace(/[^\d.]/g, '')) || 0) * 1000;
      } else if (dosageStr.includes('mcg')) {
        numericDosage = (parseFloat(dosageStr.replace(/[^\d.]/g, '')) || 0) / 1000;
      }

      if (nameNorm.includes('paracetamol') || nameNorm.includes('acetaminophen')) {
        if (numericDosage > 1000) {
          alerts.push({
            type: 'DOSAGE',
            severity: 'CRITICAL',
            message: `High Dosage Alert: Paracetamol dosage (${med.dosage}) exceeds the standard maximum single dose of 1000mg.`,
            medicineName: med.medicineName || med.medicine_name
          });
        }
      } else if (nameNorm.includes('amoxicillin')) {
        if (numericDosage > 1000) {
          alerts.push({
            type: 'DOSAGE',
            severity: 'CRITICAL',
            message: `High Dosage Alert: Amoxicillin dosage (${med.dosage}) exceeds the recommended maximum single dose of 1000mg.`,
            medicineName: med.medicineName || med.medicine_name
          });
        }
      } else if (nameNorm.includes('metformin')) {
        if (numericDosage > 1000) {
          alerts.push({
            type: 'DOSAGE',
            severity: 'WARNING',
            message: `High Dosage Alert: Metformin single dose (${med.dosage}) is high. Standard single dose should not exceed 1000mg.`,
            medicineName: med.medicineName || med.medicine_name
          });
        }
      } else if (nameNorm.includes('lisinopril')) {
        if (numericDosage > 40) {
          alerts.push({
            type: 'DOSAGE',
            severity: 'CRITICAL',
            message: `High Dosage Alert: Lisinopril dosage (${med.dosage}) exceeds the typical maximum single dose of 40mg.`,
            medicineName: med.medicineName || med.medicine_name
          });
        }
      } else if (nameNorm.includes('cetirizine')) {
        if (numericDosage > 10) {
          alerts.push({
            type: 'DOSAGE',
            severity: 'WARNING',
            message: `High Dosage Alert: Cetirizine dosage (${med.dosage}) exceeds the standard daily dose of 10mg.`,
            medicineName: med.medicineName || med.medicine_name
          });
        }
      }
    }

    res.json({
      success: true,
      isValid: alerts.length === 0,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor's consultations
exports.getConsultations = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { status } = req.query;
    const query = { doctorId: doctor._id };
    if (status) {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate('patientId', 'firstName lastName patientId dateOfBirth gender phone')
      .populate('hospitalId', 'name')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.json({
      success: true,
      message: 'Consultation status updated',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
