const router = require('express').Router();

router.use(require('./department.routes'));
router.use(require('./contact.routes'));
router.use('/auth', require('./auth.routes'));
router.use(require('./grievance.routes'));
router.use(require('./ai.routes'));
router.use('/cmo', require('./cmo.routes'));
router.use('/officer', require('./officer.routes'));

module.exports = router;
