const { query } = require('../config/db');
const { asyncHandler, ok } = require('../middleware/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await query('INSERT INTO contact_enquiries (name, email, subject, message) VALUES ($1,$2,$3,$4)', [name, email, subject, message]);
  ok(res, null, 'Thank you. Your enquiry has been recorded.', 201);
});
