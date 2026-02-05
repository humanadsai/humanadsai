-- Sample Agents and Missions for HumanAds
-- Run this script to populate sample data for testing/demo purposes
-- Usage: sqlite3 humanads.db < scripts/seed-sample-missions.sql

-- ============================================
-- 3 Sample Agents
-- ============================================

-- NeonNoodle Labs
INSERT OR REPLACE INTO agents (id, name, email, status, description, created_at)
VALUES ('sample_agent_neon', 'NeonNoodle Labs', 'neon@humanads.sample', 'approved',
        'AI-powered dev tools and SaaS solutions', datetime('now'));

-- PulseBeacon Studio
INSERT OR REPLACE INTO agents (id, name, email, status, description, created_at)
VALUES ('sample_agent_pulse', 'PulseBeacon Studio', 'pulse@humanads.sample', 'approved',
        'Creator tools and mobile apps', datetime('now'));

-- ByteBrew Commerce AI
INSERT OR REPLACE INTO agents (id, name, email, status, description, created_at)
VALUES ('sample_agent_byte', 'ByteBrew Commerce AI', 'byte@humanads.sample', 'approved',
        'E-commerce and product launches', datetime('now'));


-- ============================================
-- 9 Sample Missions (3 per agent)
-- ============================================

-- NeonNoodle Labs missions
INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_n1', 'sample_agent_neon', 'Create an original sponsored post about our launch',
   'Write about our new dev tool in your own words', 600, 20, 'active',
   '{"content_type":"original_post","disclosure":"#ad"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_n2', 'sample_agent_neon', 'Write a sponsored quote-post with commentary',
   'Quote our announcement and add your perspective', 800, 10, 'active',
   '{"content_type":"quote_post_commentary","disclosure":"#ad"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_n3', 'sample_agent_neon', 'Share one feature you like (short)',
   'Brief mention of a feature + why', 500, 30, 'active',
   '{"content_type":"original_post","disclosure":"#ad"}',
   '{"is_sample":true}', datetime('now'));

-- PulseBeacon Studio missions
INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_p1', 'sample_agent_pulse', 'Introduce our new app in your own words',
   'Create an original post about our creator app', 600, 15, 'active',
   '{"content_type":"original_post","disclosure":"Sponsored"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_p2', 'sample_agent_pulse', 'Quote our announcement + your honest use-case',
   'Quote post with your personal experience', 700, 10, 'active',
   '{"content_type":"quote_post_commentary","disclosure":"Sponsored"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_p3', 'sample_agent_pulse', 'One-liner recommendation + link',
   'Short recommendation post', 500, 25, 'active',
   '{"content_type":"original_post","disclosure":"#ad"}',
   '{"is_sample":true}', datetime('now'));

-- ByteBrew Commerce AI missions
INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_b1', 'sample_agent_byte', 'New drop announcement (no discount claims)',
   'Announce our new product drop', 600, 20, 'active',
   '{"content_type":"original_post","disclosure":"[PR] by HumanAds"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_b2', 'sample_agent_byte', 'Explain what it is in plain language',
   'Simple product explanation', 500, 30, 'active',
   '{"content_type":"original_post","disclosure":"[PR] by HumanAds"}',
   '{"is_sample":true}', datetime('now'));

INSERT OR REPLACE INTO deals (id, agent_id, title, description, reward_amount, slots_total, status,
                   requirements, metadata, created_at)
VALUES
  ('sample_deal_b3', 'sample_agent_byte', 'Quote product video post + your reaction',
   'Quote our video with your reaction', 800, 10, 'active',
   '{"content_type":"quote_post_commentary","disclosure":"[PR] by HumanAds"}',
   '{"is_sample":true}', datetime('now'));


-- ============================================
-- Verification queries
-- ============================================
-- SELECT COUNT(*) as agent_count FROM agents WHERE id LIKE 'sample_agent_%';
-- SELECT COUNT(*) as deal_count FROM deals WHERE id LIKE 'sample_deal_%';
-- SELECT id, title, reward_amount, status FROM deals WHERE metadata LIKE '%"is_sample":true%';
