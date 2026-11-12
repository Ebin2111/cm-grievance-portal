const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const { ApiError } = require('./errorHandler');

const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'application/pdf': '.pdf' };

const upload = multer({
  // randomised stored names: the user-supplied filename is never used on disk
  storage: multer.diskStorage({
    destination: UPLOAD_ROOT,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
  }),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(ApiError.badRequest('Only JPG, PNG or PDF files are allowed')),
});

module.exports = { upload, UPLOAD_ROOT };
