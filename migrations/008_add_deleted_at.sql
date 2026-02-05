-- Add deleted_at column for soft delete tracking
ALTER TABLE operators ADD COLUMN deleted_at TEXT;

-- Create index for deleted accounts lookup
CREATE INDEX IF NOT EXISTS idx_operators_deleted_at ON operators(deleted_at);
