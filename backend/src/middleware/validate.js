const { z } = require('zod');
const { ApiError } = require('./errorHandler');
const { DISTRICTS, CATEGORIES, STATUSES, PRIORITIES } = require('../config/constants');

/** validate(schema) or validate(schema, 'query'): replaces req[source] with parsed (coerced, trimmed) data. */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors));
  req[source] = result.data;
  next();
};

const mobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

const schemas = {
  register: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    mobile,
    password: z.string().min(8).max(72),
  }),
  login: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }),
  createGrievance: z.object({
    district: z.enum(DISTRICTS),
    category: z.enum(CATEGORIES),
    subject: z.string().trim().min(5).max(150),
    description: z.string().trim().min(20).max(4000),
  }),
  analyze: z.object({ description: z.string().trim().min(20).max(4000), district: z.enum(DISTRICTS).optional() }),
  assign: z.object({ departmentId: z.string().uuid(), officerId: z.string().uuid().optional(), remarks: z.string().trim().max(1000).optional() }),
  cmoUpdate: z.object({
    priority: z.enum(PRIORITIES).optional(),
    category: z.enum(CATEGORIES).optional(),
    startReview: z.boolean().optional(),
    remarks: z.string().trim().max(1000).optional(),
  }),
  remarks: z.object({ remarks: z.string().trim().min(2).max(1000) }),
  reviewReport: z.object({ approve: z.boolean(), remarks: z.string().trim().max(1000).optional() }),
  officerProgress: z.object({ remarks: z.string().trim().min(2).max(1000) }),
  actionReport: z.object({ report: z.string().trim().min(10).max(5000) }),
  feedback: z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).optional() }),
  reopen: z.object({ reason: z.string().trim().min(5).max(1000) }),
  contact: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(2000),
  }),
  cmoList: z.object({
    district: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(PRIORITIES).optional(),
    status: z.enum(STATUSES).optional(),
    overdue: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

module.exports = { validate, schemas };
