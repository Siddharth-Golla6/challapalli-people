-- CHECK constraints for enum-like columns. These are String columns in the
-- Prisma schema (not native Postgres enums) because several real values
-- contain spaces/ampersands ("Ward Admin", "Roads & Transport", "Waiting
-- for Funds") that Postgres enum identifiers can't represent — application
-- code already validates these against the same option lists
-- (server/src/models/*.js), this just enforces it at the database layer too.
--
-- Safe to re-run: each constraint is dropped first if it already exists.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('Resident', 'Volunteer', 'Ward Admin', 'Administrator'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
ALTER TABLE users ADD CONSTRAINT users_preferred_language_check
  CHECK (preferred_language IN ('en', 'te'));

ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_category_check;
ALTER TABLE problems ADD CONSTRAINT problems_category_check
  CHECK (category IN (
    'Roads & Transport', 'Water Supply', 'Electricity', 'Sanitation & Waste',
    'Drainage', 'Public Health', 'Education', 'Street Lighting'
  ));

ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_status_check;
ALTER TABLE problems ADD CONSTRAINT problems_status_check
  CHECK (status IN (
    'New', 'Verified', 'In Progress', 'Waiting for Funds', 'Completed', 'Rejected'
  ));

ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_priority_check;
ALTER TABLE problems ADD CONSTRAINT problems_priority_check
  CHECK (priority IN ('Critical', 'Medium', 'Low'));

ALTER TABLE status_history DROP CONSTRAINT IF EXISTS status_history_status_check;
ALTER TABLE status_history ADD CONSTRAINT status_history_status_check
  CHECK (status IN (
    'New', 'Verified', 'In Progress', 'Waiting for Funds', 'Completed', 'Rejected'
  ));

ALTER TABLE otp_codes DROP CONSTRAINT IF EXISTS otp_codes_purpose_check;
ALTER TABLE otp_codes ADD CONSTRAINT otp_codes_purpose_check
  CHECK (purpose IN ('register', 'login'));

-- support_count should never go negative (mirrors app-level increment-only usage).
ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_support_count_check;
ALTER TABLE problems ADD CONSTRAINT problems_support_count_check
  CHECK (support_count >= 0);

-- Suggestions
ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_category_check;
ALTER TABLE suggestions ADD CONSTRAINT suggestions_category_check
  CHECK (category IN (
    'Infrastructure', 'Public Services', 'Health & Sanitation', 'Education',
    'Environment', 'Culture & Events', 'Governance', 'Other'
  ));

ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_status_check;
ALTER TABLE suggestions ADD CONSTRAINT suggestions_status_check
  CHECK (status IN ('Submitted', 'Under Review', 'Accepted', 'Rejected', 'Implemented'));

ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_support_count_check;
ALTER TABLE suggestions ADD CONSTRAINT suggestions_support_count_check
  CHECK (support_count >= 0);

-- Feedback
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_topic_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_topic_check
  CHECK (topic IN (
    'Community Services', 'Government Initiatives', 'Website Experience',
    'General Appreciation', 'Other'
  ));

ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
