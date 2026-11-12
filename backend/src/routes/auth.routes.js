const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, validate(schemas.register), c.register);
router.post('/login', authLimiter, validate(schemas.login), c.login);
router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);
module.exports = router;
