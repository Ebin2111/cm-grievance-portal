const { ApiError } = require('./errorHandler');

/** Role guard: requireRole('CMO_ADMIN') or requireRole('CITIZEN', 'CMO_ADMIN'). Use after authenticate. */
const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

module.exports = { requireRole };
