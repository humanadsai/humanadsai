-- Add role column to operators table for admin access control
-- Role can be 'user' (default) or 'admin'

ALTER TABLE operators ADD COLUMN role TEXT DEFAULT 'user';

-- Create index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_operators_role ON operators(role);

-- Set existing operators to 'user' role
UPDATE operators SET role = 'user' WHERE role IS NULL;
