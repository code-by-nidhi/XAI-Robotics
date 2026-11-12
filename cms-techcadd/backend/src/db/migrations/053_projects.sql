-- Projects: the delivery log on /projects and the homepage.
--
-- Lighter than a portfolio item — a line in a list, not a page of its own — so
-- there are no SEO fields. delivery_status is where the work stands
-- (live, pilot, …), which is independent of whether the entry is published.

CREATE TABLE IF NOT EXISTS projects (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  name            VARCHAR(200)  NOT NULL,
  slug            VARCHAR(200)  NOT NULL,
  summary         VARCHAR(320)  NOT NULL DEFAULT '',
  description     LONGTEXT      NULL,
  client          VARCHAR(160)  NULL,
  industry        VARCHAR(120)  NULL,
  technologies    JSON          NULL,
  delivery_status ENUM('planning','in_progress','pilot','live','on_hold','completed') NOT NULL DEFAULT 'in_progress',
  year            CHAR(4)       NULL,
  project_url     VARCHAR(500)  NULL,
  icon            VARCHAR(40)   NULL,
  cover_image_id  CHAR(36)      NULL,
  featured        TINYINT(1)    NOT NULL DEFAULT 0,
  -- By slug; only shown on the site while that service is itself public.
  service_slug    VARCHAR(160)  NULL,
  case_study_id   CHAR(36)      NULL,
  sort_order      INT           NOT NULL DEFAULT 0,
  status          ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  publish_at      DATETIME(3)   NULL,
  published_at    DATETIME(3)   NULL,
  created_by      CHAR(36)      NULL,
  updated_by      CHAR(36)      NULL,
  created_at      DATETIME(3)   NOT NULL,
  updated_at      DATETIME(3)   NOT NULL,
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_status_publish (status, publish_at),
  KEY idx_projects_order (sort_order),
  KEY idx_projects_delivery (delivery_status),
  CONSTRAINT fk_projects_cover      FOREIGN KEY (cover_image_id) REFERENCES media(id)        ON DELETE SET NULL,
  CONSTRAINT fk_projects_case_study FOREIGN KEY (case_study_id)  REFERENCES case_studies(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by)     REFERENCES users(id)        ON DELETE SET NULL,
  CONSTRAINT fk_projects_updated_by FOREIGN KEY (updated_by)     REFERENCES users(id)        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
