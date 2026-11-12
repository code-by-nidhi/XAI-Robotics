-- Settings become the four groups the Zaavi website reads:
--   general  business details for the footer and contact page
--   social   profile links
--   seo      default title / description, and whether search engines may index
--   email    where alerts for new enquiries and applications go
--
-- Each group is a JSON column on the one settings row, merged over defaults in
-- code (settings.repo.ts), so a group that was never saved still reads as a
-- complete object and adding a field later needs no migration.
--
-- The institute's columns go: logo and favicon (the website ships its own),
-- headline stats, robots.txt (the website derives it from seo.allowIndexing),
-- and the notification / integration blobs that `email` replaces.

ALTER TABLE settings
  ADD COLUMN general JSON NULL AFTER id,
  ADD COLUMN seo     JSON NULL AFTER social,
  ADD COLUMN email   JSON NULL AFTER seo;

UPDATE settings SET general = '{}', seo = '{}', email = '{}', social = '{}' WHERE id = 1;

ALTER TABLE settings DROP FOREIGN KEY fk_settings_logo;
ALTER TABLE settings DROP FOREIGN KEY fk_settings_favicon;

ALTER TABLE settings
  DROP COLUMN site_name,
  DROP COLUMN tagline,
  DROP COLUMN logo_id,
  DROP COLUMN favicon_id,
  DROP COLUMN contact_email,
  DROP COLUMN contact_phone,
  DROP COLUMN address,
  DROP COLUMN stats,
  DROP COLUMN robots_txt,
  DROP COLUMN notifications,
  DROP COLUMN integrations;

INSERT INTO settings (id, general, social, seo, email, created_at, updated_at)
SELECT 1, '{}', '{}', '{}', '{}', NOW(3), NOW(3)
 WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);
