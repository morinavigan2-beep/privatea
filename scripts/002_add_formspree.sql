-- Add formspree_id to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS formspree_id TEXT;

-- Update Kelmendi with formspree_id
UPDATE businesses SET formspree_id = 'xjgrkkpk' WHERE slug = 'kelmendi';
