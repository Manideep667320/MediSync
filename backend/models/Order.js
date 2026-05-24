const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema({
  medicineName: String,
  dosage: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  availability: {
    type: String,
    enum: ['available', 'unavailable', 'alternative_suggested'],
    default: 'available'
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  localUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'prescription_sent',
      'received_by_pharmacy',
      'checking_stock',
      'confirmed',
      'packing',
      'ready_for_pickup',
      'out_for_delivery',
      'completed',
      'cancelled'
    ],
    default: 'prescription_sent'
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'home_delivery'],
    default: 'pickup'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  estimatedTime: Number,
  actualFulfillmentTime: Number,
  pharmacyNotes: String,
  patientNotes: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  inventoryDeducted: {
    type: Boolean,
    default: false
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate order ID
orderSchema.pre('validate', async function() {
  if (!this.orderId) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderId = `ORD${String(counter.seq).padStart(6, '0')}`;
  }
});

// Add to timeline on status change
orderSchema.pre('save', function() {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date()
    });
  }
});

module.exports = mongoose.model('Order', orderSchema);
