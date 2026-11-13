-- Testimonials, back for XAI Robotics.
--
-- 048 dropped the institute's student testimonials along with the courses
-- they pointed at. This is a new table, not that one restored: a quote now
-- comes from a graduate, a parent, a partner school or a franchise partner, so
-- it carries a free-text role and company instead of a course and a batch.
--
-- rating is optional — a principal's quote does not need stars — but when it
-- is set it must be one the star display can render, so it is checked here as
-- well as in the API's schema. A NULL passes the CHECK.
--
-- avatar_id is SET NULL: deleting a photo from the media library must not take
-- the quote with it. created_by / updated_by follow 037: the audit middleware
-- stamps them by table name.

CREATE TABLE IF NOT EXISTS testimonials (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  role        VARCHAR(120) NULL,
  company     VARCHAR(120) NULL,
  quote       VARCHAR(600) NOT NULL,
  rating      TINYINT      NULL,
  avatar_id   CHAR(36)     NULL,
  featured    TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order  INT          NOT NULL DEFAULT 0,
  status      ENUM('published','draft') NOT NULL DEFAULT 'draft',
  created_by  CHAR(36)     NULL,
  updated_by  CHAR(36)     NULL,
  created_at  DATETIME(3)  NOT NULL,
  updated_at  DATETIME(3)  NOT NULL,
  KEY idx_testimonials_status_order (status, sort_order),
  KEY idx_testimonials_featured (featured),
  CONSTRAINT ck_testimonials_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  CONSTRAINT fk_testimonials_avatar     FOREIGN KEY (avatar_id)  REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_testimonials_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_testimonials_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
