const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: String,
  quantity: Number,
  manufacturingDate: Date,
  expiryDate: Date,
  supplierName: String,
  costPrice: Number
});

const inventorySchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0
  },
  minimumStockLevel: {
    type: Number,
    default: 10
  },
  unitPrice: {
    type: Number,
    required: true
  },
  batches: [batchSchema],
  lastRestocked: Date,
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
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

// Update status based on quantity
inventorySchema.pre('save', function() {
  if (this.availableQuantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.availableQuantity <= this.minimumStockLevel) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
});

// Compound index for pharmacy and medicine
inventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
