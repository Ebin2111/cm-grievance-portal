const router = require('express').Router();
const c = require('../controllers/officer.controller');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.use(authenticate, requireRole('OFFICER'));
router.get('/grievances', c.list);
router.patch('/grievances/:id/status', validate(schemas.officerProgress), c.progress);
router.post('/grievances/:id/action-report', validate(schemas.actionReport), c.saveReport);
router.post('/grievances/:id/submit', c.submit);
module.exports = router;
