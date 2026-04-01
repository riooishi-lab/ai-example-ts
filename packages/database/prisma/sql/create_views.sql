-- Create Visible Views (論理削除されていないデータのみを表示)
-- These views filter out soft-deleted records (deleted_at IS NULL)

-- CreateView: visible_teams
CREATE VIEW "visible_teams" AS
SELECT * FROM teams WHERE deleted_at IS NULL;

-- CreateView: visible_users
CREATE VIEW "visible_users" AS
SELECT * FROM users WHERE deleted_at IS NULL;

-- CreateView: visible_invitations
CREATE VIEW "visible_invitations" AS
SELECT * FROM invitations WHERE deleted_at IS NULL;

-- CreateView: visible_accounts
CREATE VIEW "visible_accounts" AS
SELECT * FROM accounts WHERE deleted_at IS NULL;

-- CreateView: visible_individuals
CREATE VIEW "visible_individuals" AS
SELECT * FROM individuals WHERE deleted_at IS NULL;

-- CreateView: visible_candidates
CREATE VIEW "visible_candidates" AS
SELECT * FROM candidates WHERE deleted_at IS NULL;

-- CreateView: visible_contacts
CREATE VIEW "visible_contacts" AS
SELECT * FROM contacts WHERE deleted_at IS NULL;

-- CreateView: visible_leads
CREATE VIEW "visible_leads" AS
SELECT * FROM leads WHERE deleted_at IS NULL;

-- CreateView: visible_opportunities
CREATE VIEW "visible_opportunities" AS
SELECT * FROM opportunities WHERE deleted_at IS NULL;

-- CreateView: visible_products
CREATE VIEW "visible_products" AS
SELECT * FROM products WHERE deleted_at IS NULL;

-- CreateView: visible_opportunity_relations
CREATE VIEW "visible_opportunity_relations" AS
SELECT * FROM opportunity_relations WHERE deleted_at IS NULL;

-- CreateView: visible_hiring_selections
CREATE VIEW "visible_hiring_selections" AS
SELECT * FROM hiring_selections WHERE deleted_at IS NULL;

-- CreateView: visible_hiring_selection_processes
CREATE VIEW "visible_hiring_selection_processes" AS
SELECT * FROM hiring_selection_processes WHERE deleted_at IS NULL;

-- CreateView: visible_orders
CREATE VIEW "visible_orders" AS
SELECT * FROM orders WHERE deleted_at IS NULL;

-- CreateView: visible_subscriptions
CREATE VIEW "visible_subscriptions" AS
SELECT * FROM subscriptions WHERE deleted_at IS NULL;

-- CreateView: visible_invoices
CREATE VIEW "visible_invoices" AS
SELECT * FROM invoices WHERE deleted_at IS NULL;

-- CreateView: visible_payments
CREATE VIEW "visible_payments" AS
SELECT * FROM payments WHERE deleted_at IS NULL;

-- CreateView: visible_refunds
CREATE VIEW "visible_refunds" AS
SELECT * FROM refunds WHERE deleted_at IS NULL;

-- CreateView: visible_revenue_schedules
CREATE VIEW "visible_revenue_schedules" AS
SELECT * FROM revenue_schedules WHERE deleted_at IS NULL;

-- CreateView: visible_tasks
CREATE VIEW "visible_tasks" AS
SELECT * FROM tasks WHERE deleted_at IS NULL;

-- CreateView: visible_events
CREATE VIEW "visible_events" AS
SELECT * FROM events WHERE deleted_at IS NULL;

-- CreateView: visible_event_notes
CREATE VIEW "visible_event_notes" AS
SELECT * FROM event_notes WHERE deleted_at IS NULL;

-- CreateView: visible_notes
CREATE VIEW "visible_notes" AS
SELECT * FROM notes WHERE deleted_at IS NULL;

-- CreateView: visible_documents
CREATE VIEW "visible_documents" AS
SELECT * FROM documents WHERE deleted_at IS NULL;
