-- Portfolio items (/portfolio and /portfolio/<slug>).
--
-- `state` is separate from `status` on purpose, as in Zaavi: status is the
-- publishing lifecycle, state is whether the piece is still shown at all. An
-- old project can be taken off the portfolio without unpublishing it — which
-- would also break any link to it — and put back later unchanged.
--
-- case_study_id links to the full write-up. SET NULL: deleting a case study
-- must not take the portfolio entry with it, only the link.

CREATE TABLE IF NOT EXISTS portfolio (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  slug             VARCHAR(200)  NOT NULL,
  client           VARCHAR(160)  NULL,
  industry         VARCHAR(120)  NULL,
  summary          VARCHAR(320)  NOT NULL DEFAULT '',
  description      LONGTEXT      NULL,
  technologies     JSON          NULL,
  results          JSON          NULL,
  team             JSON          NULL,
  project_url      VARCHAR(500)  NULL,
  github_url       VARCHAR(500)  NULL,
  duration         VARCHAR(80)   NULL,
  icon             VARCHAR(40)   NULL,
  cover_image_id   CHAR(36)      NULL,
  featured         TINYINT(1)    NOT NULL DEFAULT 0,
  state            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  case_study_id    CHAR(36)      NULL,
  category_id      CHAR(36)      NULL,
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
  UNIQUE KEY uq_portfolio_slug (slug),
  KEY idx_portfolio_status_publish (status, publish_at),
  KEY idx_portfolio_order (sort_order),
  KEY idx_portfolio_category (category_id),
  KEY idx_portfolio_case_study (case_study_id),
  CONSTRAINT fk_portfolio_cover      FOREIGN KEY (cover_image_id) REFERENCES media(id)        ON DELETE SET NULL,
  CONSTRAINT fk_portfolio_og_image   FOREIGN KEY (og_image_id)    REFERENCES media(id)        ON DELETE SET NULL,
  CONSTRAINT fk_portfolio_case_study FOREIGN KEY (case_study_id)  REFERENCES case_studies(id) ON DELETE SET NULL,
  CONSTRAINT fk_portfolio_category   FOREIGN KEY (category_id)    REFERENCES categories(id)   ON DELETE RESTRICT,
  CONSTRAINT fk_portfolio_created_by FOREIGN KEY (created_by)     REFERENCES users(id)        ON DELETE SET NULL,
  CONSTRAINT fk_portfolio_updated_by FOREIGN KEY (updated_by)     REFERENCES users(id)        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
