// Shared option lists — validated at the application layer here, and also
// enforced at the database layer via CHECK constraints
// (prisma/sql/constraints.sql). Keep both in sync if these ever change.

export const ROLE_OPTIONS = ["Resident", "Volunteer", "Ward Admin", "Administrator"];
export const PRIORITY_OPTIONS = ["Critical", "Medium", "Low"];
export const STATUS_OPTIONS = [
  "New",
  "Verified",
  "In Progress",
  "Waiting for Funds",
  "Completed",
  "Rejected",
];
export const CATEGORY_OPTIONS = [
  "Roads & Transport",
  "Water Supply",
  "Electricity",
  "Sanitation & Waste",
  "Drainage",
  "Public Health",
  "Education",
  "Street Lighting",
];

// Stable ids only — the question text shown to users is a frontend i18n
// concern (src/i18n/{en,te}.js, "secq.<id>"), same pattern as CATEGORY_OPTIONS.
export const SECURITY_QUESTION_OPTIONS = [
  "first-pet",
  "childhood-nickname",
  "favorite-teacher",
  "first-school",
  "childhood-place",
];
