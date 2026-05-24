const mongoose = require("mongoose");
const Counter = require('./Counter');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false
  },
  localUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false
  },
  prescriptionId: {
    type: String,
    unique: true,
    sparse: true
  },
  patientName: {
    type: String,
    trim: true
  },
  patientAge: {
    type: Number
  },
  patientGender: {
    type: String
  },
  diagnosis: {
    type: String,
    trim: true
  },
  symptoms: {
    type: String,
    trim: true
  },
  medicines: [
    {
      medicineName: {
        type: String,
        required: true
      },
      dosage: String,
      frequency: String,
      duration: String,
      quantity: {
        type: Number,
        default: 1
      },
      instructions: String
    }
  ],
  doctorNotes: {
    type: String,
    trim: true
  },
  urgent: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "READY", "draft", "active", "completed", "cancelled"],
    default: "PENDING"
  }
}, { timestamps: true });

// Auto-generate a unique prescriptionId string pre-save if not provided
prescriptionSchema.pre('validate', async function() {
  if (!this.prescriptionId) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'prescriptionId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.prescriptionId = `RX${String(counter.seq).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
