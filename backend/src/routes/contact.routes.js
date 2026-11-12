const router = require('express').Router();
const c = require('../controllers/contact.controller');
const { validate, schemas } = require('../middleware/validate');
router.post('/contact', validate(schemas.contact), c.create);
module.exports = router;
