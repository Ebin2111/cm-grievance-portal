/**
 * LABELLED FALLBACK, used only when the LLM is unavailable.
 * This is a keyword heuristic, NOT AI. Results carry isFallback=true and the UI says so.
 */
const RULES = [
  { category: 'Healthcare', department: 'Health & Family Welfare', words: ['hospital', 'doctor', 'medicine', 'clinic', 'patient', 'ambulance', 'nurse', 'dengue', 'fever'] },
  { category: 'Education', department: 'General Education', words: ['school', 'teacher', 'student', 'college', 'exam', 'scholarship', 'classroom'] },
  { category: 'Water & Sanitation', department: 'Water Resources', words: ['water', 'drinking', 'pipe', 'sewage', 'drain', 'sanitation', 'waste', 'garbage', 'flood'] },
  { category: 'Public Infrastructure', department: 'Public Works (PWD)', words: ['road', 'pothole', 'bridge', 'street light', 'streetlight', 'footpath', 'culvert', 'repair'] },
  { category: 'Transport', department: 'Transport', words: ['bus', 'ksrtc', 'license', 'licence', 'vehicle', 'traffic', 'permit'] },
  { category: 'Agriculture', department: 'Agriculture', words: ['farmer', 'crop', 'paddy', 'seed', 'fertilizer', 'irrigation', 'harvest'] },
  { category: 'Police & Safety', department: 'Home (Police)', words: ['theft', 'police', 'harass', 'assault', 'crime', 'unsafe', 'threat'] },
  { category: 'Public Services', department: 'Revenue', words: ['certificate', 'ration', 'pension', 'land', 'tax', 'office', 'document', 'application'] },
];
const HIGH = ['danger', 'urgent', 'emergency', 'accident', 'death', 'collapse', 'fire', 'no water', 'outbreak', 'injur', 'life'];
const LOW = ['suggest', 'minor', 'information', 'query'];

function fallbackClassify(description) {
  const text = description.toLowerCase();
  let best = { score: 0, rule: null };
  for (const rule of RULES) {
    const score = rule.words.filter((w) => text.includes(w)).length;
    if (score > best.score) best = { score, rule };
  }
  const priority = HIGH.some((w) => text.includes(w)) ? 'HIGH' : LOW.some((w) => text.includes(w)) ? 'LOW' : 'MEDIUM';
  return {
    department: best.rule ? best.rule.department : 'Revenue',
    category: best.rule ? best.rule.category : 'Other',
    priority,
    summary: description.length > 220 ? `${description.slice(0, 217).trim()}...` : description,
    reasoning: 'Rule-based fallback (AI unavailable): matched keywords in the complaint text.',
  };
}

module.exports = { fallbackClassify };
