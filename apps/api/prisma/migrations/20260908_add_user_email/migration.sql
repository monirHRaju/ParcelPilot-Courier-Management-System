-- Add optional email field to User for transactional email notifications
ALTER TABLE "User" ADD COLUMN "email" TEXT;

-- Add unique constraint (nullable unique columns work fine in PostgreSQL)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
