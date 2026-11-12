-- Categories, services, projects and pages leave the CMS.
--
-- The site's services and projects are now fixed in the website's code, and
-- the blog, case study and portfolio categories are fixed lists in this API
-- (src/modules/shared/taxonomy.ts). A handful of entries that change once a
-- year did not earn four admin screens, and keeping them in code means the
-- website and the CMS cannot disagree about what exists.
--
-- Content keeps its category as the slug itself, copied from the category it
-- pointed at, so nothing filed today loses its heading. Service references
-- (blogs.related_service, case_studies.service_slug) were already slugs and
-- stay as they are.

-- 1. category_id -> category (slug), for each type that had categories.

ALTER TABLE blogs ADD COLUMN category VARCHAR(160) NULL AFTER category_id;
UPDATE blogs b JOIN categories c ON c.id = b.category_id SET b.category = c.slug;
ALTER TABLE blogs DROP FOREIGN KEY fk_blogs_category;
ALTER TABLE blogs DROP INDEX idx_blogs_category;
ALTER TABLE blogs DROP COLUMN category_id;
ALTER TABLE blogs ADD KEY idx_blogs_category (category);

ALTER TABLE case_studies ADD COLUMN category VARCHAR(160) NULL AFTER category_id;
UPDATE case_studies cs JOIN categories c ON c.id = cs.category_id SET cs.category = c.slug;
ALTER TABLE case_studies DROP FOREIGN KEY fk_case_studies_category;
ALTER TABLE case_studies DROP INDEX idx_case_studies_category;
ALTER TABLE case_studies DROP COLUMN category_id;
ALTER TABLE case_studies ADD KEY idx_case_studies_category (category);

ALTER TABLE portfolio ADD COLUMN category VARCHAR(160) NULL AFTER category_id;
UPDATE portfolio p JOIN categories c ON c.id = p.category_id SET p.category = c.slug;
ALTER TABLE portfolio DROP FOREIGN KEY fk_portfolio_category;
ALTER TABLE portfolio DROP INDEX idx_portfolio_category;
ALTER TABLE portfolio DROP COLUMN category_id;
ALTER TABLE portfolio ADD KEY idx_portfolio_category (category);

DROP TABLE categories;

-- 2. Projects, services and pages. Dropping projects also drops its foreign
--    key to case_studies; page_sections goes before the pages it belongs to.

DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS page_sections;
DROP TABLE IF EXISTS pages;

-- 3. What pointed at them by id, with nothing left to point at.

-- Old service slugs: a fixed list has no renamed services to redirect.
DELETE FROM slug_redirects WHERE type = 'service';
ALTER TABLE slug_redirects
  MODIFY COLUMN type ENUM('blog','case_study','portfolio','job') NOT NULL;

-- History rows for records that no longer exist: the activity screens would
-- otherwise link to edit pages that are gone and count types nobody can edit.
DELETE FROM activity_log WHERE entity_type IN ('projects', 'services', 'pages', 'categories');
