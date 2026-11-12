const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam',
  'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];
const CATEGORIES = [
  'Public Infrastructure', 'Healthcare', 'Education', 'Public Services', 'Water & Sanitation',
  'Transport', 'Agriculture', 'Police & Safety', 'Other',
];
const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
// SLA (days) per priority; drives due_date and the "overdue" count
const SLA_DAYS = { HIGH: 7, MEDIUM: 15, LOW: 30 };

module.exports = { DISTRICTS, CATEGORIES, STATUSES, PRIORITIES, SLA_DAYS };
