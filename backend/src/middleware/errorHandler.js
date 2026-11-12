const { MulterError } = require('multer');

class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
  static badRequest(m, d) { return new ApiError(400, m, 'BAD_REQUEST', d); }
  static unauthorized(m = 'Authentication required') { return new ApiError(401, m, 'UNAUTHORIZED'); }
  static forbidden(m = 'You do not have permission') { return new ApiError(403, m, 'FORBIDDEN'); }
  static notFound(m = 'Resource not found') { return new ApiError(404, m, 'NOT_FOUND'); }
  static conflict(m) { return new ApiError(409, m, 'CONFLICT'); }
}

/** Wraps async route handlers so rejected promises reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const ok = (res, data, message = 'OK', status = 200) => res.status(status).json({ success: true, data, message });

const notFound = (_req, _res, next) => next(ApiError.notFound('Route not found'));

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err instanceof MulterError) {
    return res.status(400).json({ success: false, error: { code: 'UPLOAD_ERROR', message: err.message } });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: { code: 'BAD_JSON', message: 'Malformed JSON body' } });
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Something went wrong' } });
}

module.exports = { ApiError, asyncHandler, ok, notFound, errorHandler };
