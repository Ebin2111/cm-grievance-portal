const crypto = require('crypto');

/** e.g. CMK-2026-483920. Caller retries on the (very rare) unique-constraint collision. */
const generateReferenceId = () =>
  `CMK-${new Date().getFullYear()}-${String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')}`;

module.exports = { generateReferenceId };
