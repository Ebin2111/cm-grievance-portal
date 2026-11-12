const router = require('express').Router();
const c = require('../controllers/grievance.controller');
const { validate, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { upload } = require('../middleware/upload');

// public (limited fields)
router.get('/grievances/track/:referenceId', c.track);

// citizen
router.post('/grievances', authenticate, requireRole('CITIZEN'), upload.array('attachments', 3), validate(schemas.createGrievance), c.create);
router.get('/grievances/my', authenticate, requireRole('CITIZEN'), c.mine);
router.post('/grievances/:id/feedback', authenticate, requireRole('CITIZEN'), validate(schemas.feedback), c.feedback);
router.post('/grievances/:id/reopen', authenticate, requireRole('CITIZEN'), validate(schemas.reopen), c.reopen);

// any authenticated role, scope enforced inside the controller
router.get('/grievances/:id', authenticate, c.detail);
router.get('/attachments/:id', authenticate, c.attachment);
module.exports = router;
