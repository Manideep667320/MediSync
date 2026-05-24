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

const { sendNotificationEmail } = require('../utils/emailService');

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pharmacyNotes, estimatedTime, items } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('patientId')
      .populate('pharmacyId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.status;
    if (status) order.status = status;
    if (pharmacyNotes) order.pharmacyNotes = pharmacyNotes;
    if (estimatedTime) order.estimatedTime = estimatedTime;
    if (items) order.items = items;

    // Calculate total amount
    if (items) {
      order.totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }

    // Auto-deduct inventory if transitioning to received_by_pharmacy, confirmed, or completed
    if (
      status &&
      ['received_by_pharmacy', 'confirmed', 'completed'].includes(status) &&
      !order.inventoryDeducted
    ) {
      try {
        const PharmacyInventory = require('../models/PharmacyInventory');
        for (const item of order.items) {
          const invItem = await PharmacyInventory.findOne({
            pharmacyId: order.pharmacyId._id,
            medicine: { $regex: new RegExp(`^${item.medicineName || item.medicine_name}$`, 'i') }
          });
          if (invItem) {
            invItem.stock = Math.max(0, invItem.stock - item.quantity);
            if (invItem.stock <= 0) {
              invItem.isAvailable = false;
            }
            await invItem.save();
          }
        }
        order.inventoryDeducted = true;
      } catch (err) {
        console.error('Inventory auto-deduction failed:', err);
      }
    }

    await order.save();

    // Trigger in-app notification to the patient on status change
    if (status && status !== previousStatus) {
      try {
        const Patient = require('../models/Patient');
        const patientObj = await Patient.findById(order.patientId).populate('userId');
        if (patientObj && patientObj.userId) {
          const Notification = require('../models/Notification');
          
          let title = 'Order Update';
          let message = `Your order ${order.orderId} status has been updated to ${status.replace(/_/g, ' ')}.`;
          let type = 'info';

          if (status === 'received_by_pharmacy') {
            title = 'Order Confirmed';
            message = `Pharmacy has received your order ${order.orderId} and is verifying stock.`;
            type = 'success';
          } else if (status === 'packing') {
            title = 'Order Packing';
            message = `Pharmacy is packing your medicines for order ${order.orderId}.`;
            type = 'info';
          } else if (status === 'ready_for_pickup') {
            title = 'Order Ready for Pickup';
            message = `Your order ${order.orderId} is packed and ready for pickup at ${order.pharmacyId.name || 'the pharmacy'}.`;
            type = 'success';
          } else if (status === 'completed') {
            title = 'Order Completed';
            message = `Your order ${order.orderId} has been successfully picked up/delivered.`;
            type = 'success';
          } else if (status === 'cancelled') {
            title = 'Order Cancelled';
            message = `Your order ${order.orderId} has been cancelled.`;
            type = 'warning';
          }

          await Notification.create({
            userId: patientObj.userId._id || patientObj.userId,
            title,
            message,
            type,
            link: '/dashboard'
          });
        }
      } catch (notifyError) {
        console.error('Failed to create in-app status notification:', notifyError);
      }
    }

    // Trigger Notification if status changed to ready_for_pickup
    if (status === 'ready_for_pickup' && previousStatus !== 'ready_for_pickup') {
      try {
        // Fetch User to get email from the patient reference
        const Patient = require('../models/Patient');
        const User = require('../models/User');
        
        const patientData = await Patient.findById(order.patientId._id).populate('userId');
        const userEmail = patientData.userId.email;

        await sendNotificationEmail(
          userEmail,
          `MeidSync: Your Prescription ${order.orderId} is Ready for Pickup!`,
          'READY_FOR_PICKUP',
          {
            patientName: `${patientData.firstName} ${patientData.lastName}`,
            orderId: order.orderId,
            pharmacyName: order.pharmacyId.name,
            pharmacyAddress: order.pharmacyId.address
          }
        );
      } catch (notifyError) {
        console.error('Failed to send notification email:', notifyError);
        // We don't fail the request if notification fails
      }
    }

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

    console.log('--- GET INVENTORY DEBUG ---');
    console.log('Pharmacy ID:', pharmacy._id);
    console.log('Query:', JSON.stringify(query));
    
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

// Create new intake prescription and order
exports.createIntake = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.userId });
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    const { patientName, patientAge, patientGender, diagnosis, medicines, doctorNotes } = req.body;

    // 1. Create a Prescription first
    const prescription = await Prescription.create({
      patientName,
      patientAge: parseInt(patientAge) || 30,
      patientGender: patientGender || 'Male',
      diagnosis: diagnosis || 'Intake Walk-in',
      medicines: (medicines || []).map(m => ({
        medicineName: m.medicineName || m.name || 'Unknown',
        dosage: m.dosage || '500mg',
        frequency: m.frequency || 'Once daily',
        duration: m.duration || '5 days',
        quantity: parseInt(m.quantity) || 10,
        instructions: m.instructions || 'Take as directed'
      })),
      doctorNotes,
      isDigital: true,
      status: 'active'
    });

    // 2. Query pharmacy inventory for pricing
    const pharmacyInventory = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      medicine: { $in: prescription.medicines.map(m => m.medicineName) }
    });

    const items = prescription.medicines.map(med => {
      const match = pharmacyInventory.find(inv => inv.medicine.toLowerCase() === med.medicineName.toLowerCase());
      const unitPrice = match ? match.price : 10.0;
      const quantity = med.quantity || 1;
      return {
        medicineName: med.medicineName,
        dosage: med.dosage,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // 3. Create the Order
    const order = await Order.create({
      prescriptionId: prescription._id,
      pharmacyId: pharmacy._id,
      deliveryType: 'pickup',
      items,
      totalAmount,
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      message: 'Intake order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
