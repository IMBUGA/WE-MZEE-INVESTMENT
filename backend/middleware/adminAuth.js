const adminAuth = (req, res, next) => {
  if (!req.member || !['admin', 'treasurer', 'secretary'].includes(req.member.role)) {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

module.exports = adminAuth;