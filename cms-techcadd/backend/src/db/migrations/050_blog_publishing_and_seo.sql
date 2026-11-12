-- Blog posts take the Zaavi publishing model and SEO fields.
--
-- Status: draft | published | scheduled | archived. "review" had no reviewer
-- workflow behind it and Zaavi has none, so those posts become drafts. A
-- scheduled post is public once its publish_at has passed — the public queries
-- check the time themselves, so nothing has to run at that moment.
--
-- publish_date (a DATE) becomes two timestamps: publish_at, when a post is (or
-- was) due to go live, and published_at, when it first actually went live. The
-- second is kept across unpublish / republish so a post does not jump to the
-- top of the blog for being re-saved.

ALTER TABLE blogs
  MODIFY COLUMN status ENUM('published','draft','review','scheduled','archived') NOT NULL DEFAULT 'draft';
UPDATE blogs SET status = 'draft' WHERE status = 'review';
ALTER TABLE blogs
  MODIFY COLUMN status ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft';

ALTER TABLE blogs
  ADD COLUMN publish_at   DATETIME(3) NULL AFTER status,
  ADD COLUMN published_at DATETIME(3) NULL AFTER publish_at;

UPDATE blogs
   SET published_at = COALESCE(CAST(publish_date AS DATETIME(3)), created_at),
       publish_at   = COALESCE(CAST(publish_date AS DATETIME(3)), created_at)
 WHERE status = 'published';

ALTER TABLE blogs DROP COLUMN publish_date;
ALTER TABLE blogs ADD KEY idx_blogs_status_publish (status, publish_at);

-- Zaavi allows a longer summary than the old 300 characters, and a draft may be
-- saved before the excerpt is written.
ALTER TABLE blogs MODIFY COLUMN excerpt VARCHAR(320) NOT NULL DEFAULT '';

ALTER TABLE blogs
  -- The service page promoted in the article's sidebar, by slug: services are
  -- addressed by slug on the site, and a dangling one is simply not shown.
  ADD COLUMN related_service VARCHAR(160) NULL AFTER category_id,
  -- Derived from the body on every save; stored so lists need not re-count.
  ADD COLUMN read_minutes    INT UNSIGNED NOT NULL DEFAULT 1 AFTER body,
  -- All-time total, incremented by /api/public/track (see 058).
  ADD COLUMN views           INT UNSIGNED NOT NULL DEFAULT 0 AFTER read_minutes,
  ADD COLUMN og_title        VARCHAR(200) NULL AFTER og_image_id,
  ADD COLUMN og_description  VARCHAR(320) NULL AFTER og_title,
  ADD COLUMN no_index        TINYINT(1)   NOT NULL DEFAULT 0 AFTER canonical_url;

-- The author byline: a post shows its writer's name and job title.
ALTER TABLE users
  ADD COLUMN title VARCHAR(120) NULL AFTER name,
  ADD COLUMN bio   TEXT         NULL AFTER title;
