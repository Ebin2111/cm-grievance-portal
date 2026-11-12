const router = require('express').Router();
const c = require('../controllers/department.controller');
router.get('/departments', c.list);
router.get('/meta', c.meta);
router.get('/stats/public', c.publicStats);
module.exports = router;
