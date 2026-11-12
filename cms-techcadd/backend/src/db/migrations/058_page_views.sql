-- Page-view counters for Analytics.
--
-- One row per path per day, incremented in place, rather than a row per view:
-- the questions asked of it are "how many, when, where", never "who", and a
-- per-view log would be personal data (an IP and a time) kept for no purpose.
-- Days are UTC dates, so the count does not shift with the server's timezone.
--
-- content_type / content_id tie an article or case study's path to the record,
-- so the content-performance table survives a slug change.

CREATE TABLE IF NOT EXISTS page_views (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  path         VARCHAR(200) NOT NULL,
  day          DATE         NOT NULL,
  count        INT UNSIGNED NOT NULL DEFAULT 0,
  content_type VARCHAR(40)  NULL,
  content_id   CHAR(36)     NULL,
  UNIQUE KEY uq_page_views_path_day (path, day),
  KEY idx_page_views_day (day),
  KEY idx_page_views_content (content_type, content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
