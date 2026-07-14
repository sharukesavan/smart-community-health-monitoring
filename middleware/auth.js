// Authentication Middleware
exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

exports.requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
};

exports.requireWorker = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'health_worker') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden. Health worker access required.' });
};

exports.requireAdminOrWorker = (req, res, next) => {
  if (req.session && req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'health_worker')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden. Authorized personnel only.' });
};
