-- Categories become per content type, as the website files them.
--
-- Blog posts, case studies, portfolio items, projects and services each have
-- their own set of categories: "Healthcare" as a portfolio filter and
-- "Healthcare" as a blog topic are two different things an editor manages
-- separately, and a single shared list made every picker offer the other
-- types' entries too.
--
-- The slug is unique per type rather than globally, for the same reason — both
-- lists may well want a /healthcare.

ALTER TABLE categories
  ADD COLUMN type ENUM('blog','case_study','portfolio','project','service')
      NOT NULL DEFAULT 'blog' AFTER id;

ALTER TABLE categories DROP INDEX uq_categories_slug;
ALTER TABLE categories ADD UNIQUE KEY uq_categories_type_slug (type, slug);
ALTER TABLE categories ADD KEY idx_categories_type_order (type, sort_order);
