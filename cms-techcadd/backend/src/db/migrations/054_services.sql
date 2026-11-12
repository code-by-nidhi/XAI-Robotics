-- Service pages: /<slug> on the website, plus its menus, footer and the
-- "related service" links on articles and case studies.
--
-- `title` is the page heading; `nav_label` the short name menus and cards use.
-- The list fields are JSON, in the editor's order:
--   features      "What we deliver"
--   use_cases     "Where it helps"
--   flow          exactly three steps for the how-it-works diagram

CREATE TABLE IF NOT EXISTS services (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  nav_label        VARCHAR(120)  NOT NULL,
  slug             VARCHAR(160)  NOT NULL,
  -- `group` is a reserved word, hence the prefix.
  service_group    ENUM('ai','enterprise') NOT NULL DEFAULT 'ai',
  description      TEXT          NULL,
  icon             VARCHAR(40)   NULL,
  cover_image_id   CHAR(36)      NULL,
  features         JSON          NULL,
  use_cases        JSON          NULL,
  benefits         JSON          NULL,
  technologies     JSON          NULL,
  flow             JSON          NULL,
  closing          VARCHAR(300)  NULL,
  cta_label        VARCHAR(120)  NULL,
  cta_href         VARCHAR(255)  NULL,
  sort_order       INT           NOT NULL DEFAULT 0,
  status           ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  publish_at       DATETIME(3)   NULL,
  published_at     DATETIME(3)   NULL,
  meta_title       VARCHAR(120)  NULL,
  meta_description VARCHAR(255)  NULL,
  canonical_url    VARCHAR(500)  NULL,
  og_title         VARCHAR(200)  NULL,
  og_description   VARCHAR(320)  NULL,
  og_image_id      CHAR(36)      NULL,
  no_index         TINYINT(1)    NOT NULL DEFAULT 0,
  created_by       CHAR(36)      NULL,
  updated_by       CHAR(36)      NULL,
  created_at       DATETIME(3)   NOT NULL,
  updated_at       DATETIME(3)   NOT NULL,
  UNIQUE KEY uq_services_slug (slug),
  KEY idx_services_status_order (status, sort_order),
  CONSTRAINT fk_services_cover      FOREIGN KEY (cover_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_services_og_image   FOREIGN KEY (og_image_id)    REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_services_created_by FOREIGN KEY (created_by)     REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_services_updated_by FOREIGN KEY (updated_by)     REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
