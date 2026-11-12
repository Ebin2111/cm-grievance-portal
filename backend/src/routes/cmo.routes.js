const router = require('express').Router();
const c = require('../controllers/cmo.controller');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.use(authenticate, requireRole('CMO_ADMIN'));
router.get('/grievances', validate(schemas.cmoList, 'query'), c.list);
router.get('/stats', c.stats);
router.get('/officers', c.officers);
router.patch('/grievances/:id', validate(schemas.cmoUpdate), c.update);
router.post('/grievances/:id/assign', validate(schemas.assign), c.assign);
router.post('/grievances/:id/remarks', validate(schemas.remarks), c.remark);
router.post('/grievances/:id/escalate', c.escalate);
router.post('/grievances/:id/review-report', validate(schemas.reviewReport), c.reviewReport);
module.exports = router;
