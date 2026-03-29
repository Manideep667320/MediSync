const mongoose = require('mongoose');

const pharmacyInventorySchema = new mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    medicine: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    isAvailable: {
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
}, {
    collection: 'pharmacy_inventory'
});

// Auto-update isAvailable based on stock before saving
pharmacyInventorySchema.pre('save', function () {
    if (this.stock <= 0) {
        this.isAvailable = false;
    }
});

// Update timestamp on save
pharmacyInventorySchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Create index for faster querying by pharmacy and medicine name
pharmacyInventorySchema.index({ pharmacyId: 1, medicine: 1 }, { unique: true });

module.exports = mongoose.model('PharmacyInventory', pharmacyInventorySchema);
