-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'MANAGER', 'MAINTENANCE', 'FIELD_WORKER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "InspectionInputType" AS ENUM ('NUMERIC', 'TEXT');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "external_id" TEXT,
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "phone_number" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FIELD_WORKER',
    "line_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_signed_in_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "synced_at" TIMESTAMPTZ(6),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FIELD_WORKER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invited_by_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line_name" TEXT NOT NULL,
    "machine_number" TEXT NOT NULL,
    "category" TEXT,
    "installed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "standard_replace_cycle_days" INTEGER,
    "last_replaced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_items" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "input_type" "InspectionInputType" NOT NULL,
    "unit" TEXT,
    "upper_limit" DOUBLE PRECISION,
    "lower_limit" DOUBLE PRECISION,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_records" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "inspected_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "inspection_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_values" (
    "id" SERIAL NOT NULL,
    "record_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "numeric_value" DOUBLE PRECISION,
    "text_value" TEXT,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "inspection_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failure_reports" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "part_id" INTEGER,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "symptom" TEXT NOT NULL,
    "estimated_cause" TEXT,
    "action" TEXT NOT NULL,
    "action_at" TIMESTAMPTZ(6) NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "responder_id" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "failure_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "failure_report_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "captured_at" TIMESTAMPTZ(6),
    "uploader_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "target_year" INTEGER NOT NULL,
    "target_month" INTEGER NOT NULL,
    "report_data" JSONB NOT NULL,
    "pdf_path" TEXT,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: users
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_public_id_idx" ON "users"("public_id");
CREATE INDEX "users_external_id_idx" ON "users"("external_id");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_auth_provider_id_idx" ON "users"("auth_provider_id");
CREATE INDEX "users_is_active_idx" ON "users"("is_active");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex: invitations
CREATE UNIQUE INDEX "invitations_public_id_key" ON "invitations"("public_id");
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");
CREATE INDEX "invitations_token_idx" ON "invitations"("token");
CREATE INDEX "invitations_email_idx" ON "invitations"("email");
CREATE INDEX "invitations_status_idx" ON "invitations"("status");
CREATE INDEX "invitations_invited_by_id_idx" ON "invitations"("invited_by_id");
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex: equipments
CREATE UNIQUE INDEX "equipments_public_id_key" ON "equipments"("public_id");
CREATE INDEX "equipments_public_id_idx" ON "equipments"("public_id");
CREATE INDEX "equipments_line_name_idx" ON "equipments"("line_name");
CREATE INDEX "equipments_deleted_at_idx" ON "equipments"("deleted_at");

-- CreateIndex: parts
CREATE UNIQUE INDEX "parts_public_id_key" ON "parts"("public_id");
CREATE INDEX "parts_equipment_id_idx" ON "parts"("equipment_id");
CREATE INDEX "parts_public_id_idx" ON "parts"("public_id");
CREATE INDEX "parts_deleted_at_idx" ON "parts"("deleted_at");

-- CreateIndex: inspection_items
CREATE UNIQUE INDEX "inspection_items_public_id_key" ON "inspection_items"("public_id");
CREATE INDEX "inspection_items_equipment_id_idx" ON "inspection_items"("equipment_id");
CREATE INDEX "inspection_items_public_id_idx" ON "inspection_items"("public_id");
CREATE INDEX "inspection_items_deleted_at_idx" ON "inspection_items"("deleted_at");

-- CreateIndex: inspection_records
CREATE UNIQUE INDEX "inspection_records_public_id_key" ON "inspection_records"("public_id");
CREATE INDEX "inspection_records_equipment_id_idx" ON "inspection_records"("equipment_id");
CREATE INDEX "inspection_records_inspector_id_idx" ON "inspection_records"("inspector_id");
CREATE INDEX "inspection_records_inspected_at_idx" ON "inspection_records"("inspected_at");
CREATE INDEX "inspection_records_public_id_idx" ON "inspection_records"("public_id");
CREATE INDEX "inspection_records_deleted_at_idx" ON "inspection_records"("deleted_at");

-- CreateIndex: inspection_values
CREATE UNIQUE INDEX "inspection_values_record_id_item_id_key" ON "inspection_values"("record_id", "item_id");
CREATE INDEX "inspection_values_record_id_idx" ON "inspection_values"("record_id");
CREATE INDEX "inspection_values_item_id_idx" ON "inspection_values"("item_id");

-- CreateIndex: failure_reports
CREATE UNIQUE INDEX "failure_reports_public_id_key" ON "failure_reports"("public_id");
CREATE INDEX "failure_reports_equipment_id_idx" ON "failure_reports"("equipment_id");
CREATE INDEX "failure_reports_part_id_idx" ON "failure_reports"("part_id");
CREATE INDEX "failure_reports_reporter_id_idx" ON "failure_reports"("reporter_id");
CREATE INDEX "failure_reports_responder_id_idx" ON "failure_reports"("responder_id");
CREATE INDEX "failure_reports_occurred_at_idx" ON "failure_reports"("occurred_at");
CREATE INDEX "failure_reports_public_id_idx" ON "failure_reports"("public_id");
CREATE INDEX "failure_reports_deleted_at_idx" ON "failure_reports"("deleted_at");

-- CreateIndex: photos
CREATE UNIQUE INDEX "photos_public_id_key" ON "photos"("public_id");
CREATE INDEX "photos_failure_report_id_idx" ON "photos"("failure_report_id");
CREATE INDEX "photos_uploader_id_idx" ON "photos"("uploader_id");

-- CreateIndex: ai_reports
CREATE UNIQUE INDEX "ai_reports_public_id_key" ON "ai_reports"("public_id");
CREATE UNIQUE INDEX "ai_reports_target_year_target_month_key" ON "ai_reports"("target_year", "target_month");
CREATE INDEX "ai_reports_target_year_target_month_idx" ON "ai_reports"("target_year", "target_month");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parts" ADD CONSTRAINT "parts_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_items" ADD CONSTRAINT "inspection_items_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_values" ADD CONSTRAINT "inspection_values_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "inspection_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_values" ADD CONSTRAINT "inspection_values_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inspection_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_failure_report_id_fkey" FOREIGN KEY ("failure_report_id") REFERENCES "failure_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateView: visible_users
CREATE VIEW "visible_users" AS
SELECT * FROM "users" WHERE "deleted_at" IS NULL;

-- CreateView: visible_invitations
CREATE VIEW "visible_invitations" AS
SELECT * FROM "invitations" WHERE "deleted_at" IS NULL;

-- CreateView: visible_equipments
CREATE VIEW "visible_equipments" AS
SELECT * FROM "equipments" WHERE "deleted_at" IS NULL;

-- CreateView: visible_parts
CREATE VIEW "visible_parts" AS
SELECT * FROM "parts" WHERE "deleted_at" IS NULL;

-- CreateView: visible_inspection_items
CREATE VIEW "visible_inspection_items" AS
SELECT * FROM "inspection_items" WHERE "deleted_at" IS NULL;

-- CreateView: visible_inspection_records
CREATE VIEW "visible_inspection_records" AS
SELECT * FROM "inspection_records" WHERE "deleted_at" IS NULL;

-- CreateView: visible_failure_reports
CREATE VIEW "visible_failure_reports" AS
SELECT * FROM "failure_reports" WHERE "deleted_at" IS NULL;
