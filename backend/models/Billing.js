const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number
});

const billingSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
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
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  items: [billingItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    cgst: Number,
    sgst: Number,
    totalTax: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'net_banking', 'wallet', 'insurance'],
    default: 'cash'
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    claimAmount: Number,
    claimStatus: String
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

// Auto-generate bill ID
billingSchema.pre('save', async function() {
  if (!this.billId) {
    const count = await mongoose.model('Billing').countDocuments();
    this.billId = `BILL${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Billing', billingSchema);
