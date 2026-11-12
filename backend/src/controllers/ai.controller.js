const { asyncHandler, ok } = require('../middleware/errorHandler');
const { analyzeGrievance } = require('../services/ai.service');
const { findPossibleDuplicate } = require('../services/duplicate.service');

/** Returns suggestions only; nothing is saved and no decision is made. */
exports.analyze = asyncHandler(async (req, res) => {
  const analysis = await analyzeGrievance(req.body.description);
  const dup = req.body.district ? await findPossibleDuplicate(req.body.district, analysis.category, req.body.description) : null;
  ok(res, {
    ...analysis,
    possibleDuplicate: Boolean(dup),
    notice: 'AI suggestions are advisory. You can edit them before submitting; a human officer makes all decisions.',
  });
});
