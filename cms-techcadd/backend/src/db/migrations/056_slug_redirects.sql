-- Old slugs of content that has been public, so existing links and search
-- results keep working after a rename.
--
-- The old slug points at the content's id, not at its new slug: rename a post
-- twice and both old addresses still land on the current one, with no chain to
-- follow and nothing to rewrite. A redirect is dropped as soon as other content
-- of the same type claims that slug, because the slug then has a real owner.
--
-- Distinct from `redirects` (path to path, managed by hand on the SEO page):
-- these are recorded automatically and are per content type.

CREATE TABLE IF NOT EXISTS slug_redirects (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  type       ENUM('blog','case_study','portfolio','service','job') NOT NULL,
  from_slug  VARCHAR(200) NOT NULL,
  target_id  CHAR(36)     NOT NULL,
  created_at DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_slug_redirects_type_from (type, from_slug),
  KEY idx_slug_redirects_target (type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
