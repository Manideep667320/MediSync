const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true,
    index: true
  },
  manufacturer: String,
  category: {
    type: String,
    required: true,
    enum: [
      'Antibiotic',
      'Analgesic',
      'Antidiabetic',
      'Antihypertensive',
      'Antihistamine',
      'Antacid',
      'Vitamin',
      'Supplement',
      'Other'
    ]
  },
  form: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'],
    required: true
  },
  strength: String,
  description: String,
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  requiresPrescription: {
    type: Boolean,
    default: true
  },
  schedule: {
    type: String,
    enum: ['Schedule H', 'Schedule H1', 'Schedule X', 'OTC', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for search
medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
