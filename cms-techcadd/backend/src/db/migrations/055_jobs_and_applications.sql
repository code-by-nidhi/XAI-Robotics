-- Careers: openings on /careers, and the applications sent to them.
--
-- An opening is public while it is published (or scheduled and due) *and* its
-- closing date has not passed; the date is inclusive, so a job closing today
-- still takes applications today.

CREATE TABLE IF NOT EXISTS jobs (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  slug             VARCHAR(200)  NOT NULL,
  department       VARCHAR(120)  NULL,
  location         VARCHAR(160)  NULL,
  employment_type  ENUM('full_time','part_time','contract','internship') NOT NULL DEFAULT 'full_time',
  work_mode        ENUM('onsite','hybrid','remote') NOT NULL DEFAULT 'onsite',
  experience       VARCHAR(120)  NULL,
  -- Free text ("₹12–18 LPA"); empty hides it on the site.
  salary           VARCHAR(120)  NULL,
  summary          VARCHAR(320)  NOT NULL DEFAULT '',
  description      LONGTEXT      NULL,
  responsibilities JSON          NULL,
  requirements     JSON          NULL,
  benefits         JSON          NULL,
  closing_date     DATE          NULL,
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
  UNIQUE KEY uq_jobs_slug (slug),
  KEY idx_jobs_status_publish (status, publish_at),
  KEY idx_jobs_order (sort_order),
  CONSTRAINT fk_jobs_og_image   FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_jobs_updated_by FOREIGN KEY (updated_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- An application keeps a snapshot of the job title: the opening may be renamed
-- or deleted later, and the record of what someone applied for must not change
-- with it. SET NULL on the job for the same reason.
--
-- The CV is never at a public URL. cv_key is a path relative to the private
-- storage root (PRIVATE_DIR), and the file is only served through an
-- authenticated admin route. The name the applicant uploaded is kept for the
-- download, cleaned; the stored name is random.

CREATE TABLE IF NOT EXISTS job_applications (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  job_id        CHAR(36)      NULL,
  job_title     VARCHAR(200)  NOT NULL,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(190)  NOT NULL,
  phone         VARCHAR(40)   NULL,
  location      VARCHAR(160)  NULL,
  linkedin_url  VARCHAR(300)  NULL,
  portfolio_url VARCHAR(300)  NULL,
  cover_letter  TEXT          NULL,
  cv_key        VARCHAR(255)  NOT NULL,
  cv_filename   VARCHAR(255)  NOT NULL,
  cv_mime       VARCHAR(120)  NOT NULL,
  cv_size       INT UNSIGNED  NOT NULL,
  status        ENUM('new','reviewing','shortlisted','interview','offered','hired','rejected','archived') NOT NULL DEFAULT 'new',
  notes         TEXT          NULL,
  ip            VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    DATETIME(3)   NOT NULL,
  updated_at    DATETIME(3)   NOT NULL,
  KEY idx_job_applications_status_created (status, created_at),
  -- The one-application-per-person-per-opening check reads this.
  KEY idx_job_applications_job_email (job_id, email),
  CONSTRAINT fk_job_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
