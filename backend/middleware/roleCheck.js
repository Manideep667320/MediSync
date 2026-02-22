// Role-based access control middleware

exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

exports.requireDoctor = exports.requireRole('doctor');
exports.requirePatient = exports.requireRole('patient');
exports.requirePharmacy = exports.requireRole('pharmacy');
exports.requireAdmin = exports.requireRole('admin');
