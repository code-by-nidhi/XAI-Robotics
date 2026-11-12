-- Case studies (/case-studies/<slug> on the website).
--
-- The story is told in sections — overview, challenge, approach, solution,
-- implementation — each sanitised HTML, because the website lays them out as
-- separate blocks with their own headings rather than as one article body.
--
-- results and technologies are JSON: always read and written with the case
-- study, never queried on their own, and their order is the editor's.
--   results       [{ "value": "40%", "label": "faster onboarding" }]
--   technologies  ["Python", "Azure OpenAI"]

CREATE TABLE IF NOT EXISTS case_studies (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  slug             VARCHAR(200)  NOT NULL,
  client           VARCHAR(160)  NOT NULL DEFAULT '',
  industry         VARCHAR(120)  NOT NULL DEFAULT '',
  excerpt          VARCHAR(320)  NOT NULL DEFAULT '',
  overview         LONGTEXT      NULL,
  challenge        LONGTEXT      NULL,
  approach         LONGTEXT      NULL,
  solution         LONGTEXT      NULL,
  implementation   LONGTEXT      NULL,
  results          JSON          NULL,
  technologies     JSON          NULL,
  duration         VARCHAR(80)   NULL,
  testimonial_text VARCHAR(1000) NULL,
  testimonial_name VARCHAR(120)  NULL,
  testimonial_role VARCHAR(120)  NULL,
  -- A key into the website's icon set; unknown values fall back on the site.
  icon             VARCHAR(40)   NULL,
  cover_image_id   CHAR(36)      NULL,
  -- The service page this case study belongs to, by slug.
  service_slug     VARCHAR(160)  NULL,
  category_id      CHAR(36)      NULL,
  sort_order       INT           NOT NULL DEFAULT 0,
  views            INT UNSIGNED  NOT NULL DEFAULT 0,
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
  UNIQUE KEY uq_case_studies_slug (slug),
  KEY idx_case_studies_status_publish (status, publish_at),
  KEY idx_case_studies_order (sort_order),
  KEY idx_case_studies_industry (industry),
  KEY idx_case_studies_category (category_id),
  CONSTRAINT fk_case_studies_cover      FOREIGN KEY (cover_image_id) REFERENCES media(id)      ON DELETE SET NULL,
  CONSTRAINT fk_case_studies_og_image   FOREIGN KEY (og_image_id)    REFERENCES media(id)      ON DELETE SET NULL,
  CONSTRAINT fk_case_studies_category   FOREIGN KEY (category_id)    REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_case_studies_created_by FOREIGN KEY (created_by)     REFERENCES users(id)      ON DELETE SET NULL,
  CONSTRAINT fk_case_studies_updated_by FOREIGN KEY (updated_by)     REFERENCES users(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
