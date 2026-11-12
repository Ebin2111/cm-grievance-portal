const router = require('express').Router();
const c = require('../controllers/ai.controller');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { aiLimiter } = require('../middleware/rateLimit');
router.post('/ai/analyze', authenticate, requireRole('CITIZEN', 'CMO_ADMIN'), aiLimiter, validate(schemas.analyze), c.analyze);
module.exports = router;
