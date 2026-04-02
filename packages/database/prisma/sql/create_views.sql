-- CreateView: visible_users
CREATE VIEW "visible_users" AS
SELECT * FROM users WHERE deleted_at IS NULL;

-- CreateView: visible_invitations
CREATE VIEW "visible_invitations" AS
SELECT * FROM invitations WHERE deleted_at IS NULL;

-- CreateView: visible_equipments
CREATE VIEW "visible_equipments" AS
SELECT * FROM equipments WHERE deleted_at IS NULL;

-- CreateView: visible_parts
CREATE VIEW "visible_parts" AS
SELECT * FROM parts WHERE deleted_at IS NULL;

-- CreateView: visible_inspection_items
CREATE VIEW "visible_inspection_items" AS
SELECT * FROM inspection_items WHERE deleted_at IS NULL;

-- CreateView: visible_inspection_records
CREATE VIEW "visible_inspection_records" AS
SELECT * FROM inspection_records WHERE deleted_at IS NULL;

-- CreateView: visible_failure_reports
CREATE VIEW "visible_failure_reports" AS
SELECT * FROM failure_reports WHERE deleted_at IS NULL;
