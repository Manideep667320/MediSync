const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Pharmacy = require('../models/Pharmacy');
const { generateToken } = require('../middleware/auth');

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...additionalData } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      phone: additionalData.phone
    });

    // Create role-specific profile
    let profile;
    if (role === 'doctor' && additionalData.doctorData) {
      profile = await Doctor.create({
        userId: user._id,
        ...additionalData.doctorData
      });
    } else if (role === 'patient' && additionalData.patientData) {
      profile = await Patient.create({
        userId: user._id,
        ...additionalData.patientData
      });
    } else if (role === 'pharmacy' && additionalData.pharmacyData) {
      profile = await Pharmacy.create({
        userId: user._id,
        ...additionalData.pharmacyData
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.tokenVersion || 0);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        profile,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific profile
    let profile;
    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id })
        .populate('hospitalId', 'name address');
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id })
        .populate('hospitalId', 'name address');
    } else if (user.role === 'pharmacy') {
      profile = await Pharmacy.findOne({ userId: user._id });
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.tokenVersion || 0);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        profile,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    let profile;
    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id })
        .populate('hospitalId', 'name address phone');
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id })
        .populate('hospitalId', 'name address phone')
        .populate('preferredPharmacies', 'name address phone');
    } else if (user.role === 'pharmacy') {
      profile = await Pharmacy.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { userData, profileData } = req.body;

    // Update user data
    if (userData) {
      const user = await User.findById(req.user.userId);
      if (userData.phone) user.phone = userData.phone;
      if (userData.password) user.password = userData.password;
      await user.save();
    }

    // Update role-specific profile
    let profile;
    if (req.user.role === 'doctor' && profileData) {
      profile = await Doctor.findOneAndUpdate(
        { userId: req.user.userId },
        profileData,
        { new: true, runValidators: true }
      );
    } else if (req.user.role === 'patient' && profileData) {
      profile = await Patient.findOneAndUpdate(
        { userId: req.user.userId },
        profileData,
        { new: true, runValidators: true }
      );
    } else if (req.user.role === 'pharmacy' && profileData) {
      profile = await Pharmacy.findOneAndUpdate(
        { userId: req.user.userId },
        profileData,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout (client-side token removal, but we can track it)
exports.logout = async (req, res) => {
  try {
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
