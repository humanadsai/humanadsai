-- Migration: Add extended X profile fields to operators table
-- Run this in Cloudflare D1 Console if operators table already exists

-- Extended X Profile Data
ALTER TABLE operators ADD COLUMN x_profile_image_url TEXT;
ALTER TABLE operators ADD COLUMN x_description TEXT;
ALTER TABLE operators ADD COLUMN x_url TEXT;
ALTER TABLE operators ADD COLUMN x_location TEXT;
ALTER TABLE operators ADD COLUMN x_created_at TEXT;
ALTER TABLE operators ADD COLUMN x_protected INTEGER DEFAULT 0;

-- X Verification
ALTER TABLE operators ADD COLUMN x_verified INTEGER DEFAULT 0;
ALTER TABLE operators ADD COLUMN x_verified_type TEXT;

-- X Public Metrics
ALTER TABLE operators ADD COLUMN x_followers_count INTEGER DEFAULT 0;
ALTER TABLE operators ADD COLUMN x_following_count INTEGER DEFAULT 0;
ALTER TABLE operators ADD COLUMN x_tweet_count INTEGER DEFAULT 0;
ALTER TABLE operators ADD COLUMN x_listed_count INTEGER DEFAULT 0;

-- Raw JSON and timestamps
ALTER TABLE operators ADD COLUMN x_raw_json TEXT;
ALTER TABLE operators ADD COLUMN x_fetched_at INTEGER;
ALTER TABLE operators ADD COLUMN x_connected_at INTEGER;
