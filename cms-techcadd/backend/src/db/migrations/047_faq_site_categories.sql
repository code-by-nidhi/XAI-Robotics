-- The FAQ categories the website actually has tabs for.
--
-- The site's FAQ page renders seven tabs — the six course categories, then
-- General (see `src/lib/faq.ts` in the website). `faq_categories` only ever
-- held whatever names had been typed into a question, so a tab nobody had
-- filed under yet could not be chosen or filtered by in the CMS, and a name
-- that differed from the site's ("AI & Data") matched no tab and its questions
-- fell through to General.
--
-- Slugs are the site's own tab keys, which is what the site matches on first.
--
-- Plain statements against literals only, and safe to run more than once.
-- This file runs on every boot until it succeeds, and the API does not start
-- if it fails — so no temporary table (a privilege the database user may not
-- have), no comparison between two tables' columns (which fails outright when
-- their collations differ), and IGNORE wherever a unique key could object.

-- Anything else ("Fees", "Placements") keeps its relative order, after the tabs.
UPDATE faq_categories SET sort_order = sort_order + 100
 WHERE sort_order < 100
   AND slug NOT IN ('digital-marketing', 'ai-data', 'development', 'cyber-cloud',
                    'cad-design', 'programming', 'general');

-- A category already carrying a tab's name takes the tab's key as its slug.
-- IGNORE leaves it alone if another row holds that slug already.
UPDATE IGNORE faq_categories SET slug = 'digital-marketing' WHERE name = 'Digital Marketing';
UPDATE IGNORE faq_categories SET slug = 'ai-data'           WHERE name = 'Artificial Intelligence & Data';
UPDATE IGNORE faq_categories SET slug = 'development'       WHERE name = 'Full-Stack Development';
UPDATE IGNORE faq_categories SET slug = 'cyber-cloud'       WHERE name = 'Cyber Security & Cloud';
UPDATE IGNORE faq_categories SET slug = 'cad-design'        WHERE name = 'CAD / CAM & Design';
UPDATE IGNORE faq_categories SET slug = 'programming'       WHERE name = 'Core Programming';
UPDATE IGNORE faq_categories SET slug = 'general'           WHERE name = 'General';

-- The tabs that are still missing. Name and slug are both unique, so IGNORE
-- skips any tab that already exists under either.
INSERT IGNORE INTO faq_categories (id, name, slug, sort_order, active, created_at, updated_at) VALUES
  (UUID(), 'Digital Marketing',              'digital-marketing', 1, 1, NOW(3), NOW(3)),
  (UUID(), 'Artificial Intelligence & Data', 'ai-data',           2, 1, NOW(3), NOW(3)),
  (UUID(), 'Full-Stack Development',         'development',       3, 1, NOW(3), NOW(3)),
  (UUID(), 'Cyber Security & Cloud',         'cyber-cloud',       4, 1, NOW(3), NOW(3)),
  (UUID(), 'CAD / CAM & Design',             'cad-design',        5, 1, NOW(3), NOW(3)),
  (UUID(), 'Core Programming',               'programming',       6, 1, NOW(3), NOW(3)),
  (UUID(), 'General',                        'general',           7, 1, NOW(3), NOW(3));

-- In the order the website shows them.
UPDATE faq_categories SET sort_order = 1 WHERE slug = 'digital-marketing';
UPDATE faq_categories SET sort_order = 2 WHERE slug = 'ai-data';
UPDATE faq_categories SET sort_order = 3 WHERE slug = 'development';
UPDATE faq_categories SET sort_order = 4 WHERE slug = 'cyber-cloud';
UPDATE faq_categories SET sort_order = 5 WHERE slug = 'cad-design';
UPDATE faq_categories SET sort_order = 6 WHERE slug = 'programming';
UPDATE faq_categories SET sort_order = 7 WHERE slug = 'general';
