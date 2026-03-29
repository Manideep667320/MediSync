const Pharmacy = require('../models/Pharmacy');
const Order = require('../models/Order');
const PharmacyInventory = require('../models/PharmacyInventory');
const Billing = require('../models/Billing');
const Prescription = require('../models/Prescription');

// Get pharmacy dashboard
exports.getDashboard = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's statistics
    const todayOrders = await Order.countDocuments({
      pharmacyId: pharmacy._id,
      createdAt: { $gte: today }
    });

    const pendingOrders = await Order.countDocuments({
      pharmacyId: pharmacy._id,
      status: { $nin: ['completed', 'cancelled'] }
    });

    const lowStockItems = await PharmacyInventory.countDocuments({
      pharmacyId: pharmacy._id,
      stock: { $lt: 20 } // Threshold for low stock based on new model
    });

    // Recent orders
    const recentOrders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('prescriptionId', 'prescriptionId patientName diagnosis')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        statistics: {
          todayOrders,
          pendingOrders,
          lowStockItems,
          totalOrders: pharmacy.statistics.totalOrders,
          completedOrders: pharmacy.statistics.completedOrders,
          rating: pharmacy.rating
        },
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get incoming prescriptions/orders
exports.getOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });
    const { status, page = 1, limit = 10 } = req.query;

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const query = { pharmacyId: pharmacy._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('prescriptionId', 'prescriptionId patientName diagnosis medicines')
      .populate('patientId', 'firstName lastName phone')
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

// Get single order details
exports.getOrder = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      pharmacyId: pharmacy._id
    })
      .populate('prescriptionId')
      .populate('patientId', 'firstName lastName phone address');

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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pharmacyNotes, estimatedTime, items } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) order.status = status;
    if (pharmacyNotes) order.pharmacyNotes = pharmacyNotes;
    if (estimatedTime) order.estimatedTime = estimatedTime;
    if (items) order.items = items;

    // Calculate total amount
    if (items) {
      order.totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }

    await order.save();

    // Update pharmacy statistics
    if (status === 'completed') {
      await Pharmacy.findByIdAndUpdate(order.pharmacyId, {
        $inc: { 'statistics.completedOrders': 1 }
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get inventory
exports.getInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });
    const { status, search, page = 1, limit = 20 } = req.query;

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const query = { pharmacyId: pharmacy._id };

    if (status === 'out_of_stock' || status === 'unavailable') {
      query.isAvailable = false;
    } else if (status === 'in_stock' || status === 'available') {
      query.isAvailable = true;
    }

    if (search) {
      query.medicine = new RegExp(search, 'i');
    }

    const inventory = await PharmacyInventory.find(query)
      .sort({ medicine: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PharmacyInventory.countDocuments(query);

    // Get stock summary mapping new boolean state to old dashboard expectations if necessary
    const stockSummary = await PharmacyInventory.aggregate([
      { $match: { pharmacyId: pharmacy._id } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$isAvailable", true] }, 'Available', 'Unavailable'] },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        inventory,
        stockSummary,
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

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const inventory = await PharmacyInventory.findOneAndUpdate(
      { _id: req.params.id, pharmacyId: pharmacy._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add inventory item
exports.addInventoryItem = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const inventoryData = {
      ...req.body,
      pharmacyId: pharmacy._id
    };

    const inventory = await PharmacyInventory.create(inventoryData);

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate bill for order
exports.generateBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('prescriptionId')
      .populate('patientId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const subtotal = order.totalAmount;
    const cgst = subtotal * 0.06; // 6% CGST
    const sgst = subtotal * 0.06; // 6% SGST
    const totalTax = cgst + sgst;
    const totalAmount = subtotal + totalTax;

    const bill = await Billing.create({
      orderId: order._id,
      prescriptionId: order.prescriptionId._id,
      patientId: order.patientId?._id,
      pharmacyId: order.pharmacyId,
      items: order.items.map(item => ({
        description: `${item.medicineName} - ${item.dosage}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal,
      tax: { cgst, sgst, totalTax },
      discount: req.body.discount || 0,
      totalAmount: totalAmount - (req.body.discount || 0),
      paymentMethod: req.body.paymentMethod || 'cash'
    });

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: bill
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
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });
    const { period = '30' } = req.query;

    if (!pharmacy) {
      return res.status(200).json({
        success: false,
        requireProfileSetup: true,
        message: 'Pharmacy profile not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Orders over time
    const ordersTimeline = await Order.aggregate([
      {
        $match: {
          pharmacyId: pharmacy._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top selling medicines
    const topMedicines = await Order.aggregate([
      { $match: { pharmacyId: pharmacy._id } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicineName',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        ordersTimeline,
        topMedicines
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
