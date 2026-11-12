const { query } = require('../config/db');

const STOP = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'there', 'are', 'was', 'not', 'has', 'been', 'our', 'near', 'please']);
const tokens = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((t) => { if (b.has(t)) inter++; });
  return inter / (a.size + b.size - inter);
}

/** Flags (never blocks) a likely duplicate for human review: same district + category in the last 60 days. */
async function findPossibleDuplicate(district, category, description, threshold = 0.45) {
  const { rows } = await query(
    `SELECT id, reference_id, description FROM grievances
     WHERE district = $1 AND category = $2 AND created_at > now() - interval '60 days'
     ORDER BY created_at DESC LIMIT 100`,
    [district, category],
  );
  const mine = tokens(description);
  let best = null;
  for (const r of rows) {
    const score = jaccard(mine, tokens(r.description));
    if (score >= threshold && (!best || score > best.score)) best = { id: r.id, referenceId: r.reference_id, score };
  }
  return best;
}

module.exports = { findPossibleDuplicate, jaccard, tokens };
