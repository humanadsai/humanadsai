-- Add x_handle column to ai_advertisers (column already exists in prod)
-- ALTER TABLE ai_advertisers ADD COLUMN x_handle TEXT;

-- Backfill x_handle from verification_tweet_url
UPDATE ai_advertisers
SET x_handle = REPLACE(
  SUBSTR(verification_tweet_url, INSTR(verification_tweet_url, '.com/') + 5),
  '/status/' || verification_tweet_id, ''
)
WHERE verification_tweet_url IS NOT NULL AND x_handle IS NULL;
