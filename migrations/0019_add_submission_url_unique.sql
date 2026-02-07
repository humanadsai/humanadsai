-- Prevent same X post URL from being submitted for multiple missions (double-dipping)
-- First, clear duplicate submission_urls (keep only the latest mission per URL)
UPDATE missions SET submission_url = NULL
WHERE submission_url IS NOT NULL
AND id NOT IN (
  SELECT MAX(id) FROM missions WHERE submission_url IS NOT NULL GROUP BY submission_url
);

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_missions_submission_url
ON missions(submission_url) WHERE submission_url IS NOT NULL;
