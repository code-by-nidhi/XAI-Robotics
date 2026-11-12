-- The education modules go: this CMS now runs a company website,
-- which has no courses, events, gallery, testimonials, reviews, AI knowledge
-- base or blog comments.
--
-- Dropped rather than left unused. A table nothing reads still shows up in the
-- media-usage count (which is derived from foreign keys), still holds personal
-- data (comment authors' emails), and still invites someone to wire it back up.
--
-- Columns on tables that stay are removed first, while their foreign keys can
-- still be dropped by name; the tables themselves go with checks off, because
-- the course tables reference each other in a web no single order untangles.

-- Enquiries pointed at the course a student asked about. The contact form has
-- no such field; the rest of the enquiry reshaping happens in 057.
ALTER TABLE enquiries DROP FOREIGN KEY fk_enquiries_course;
ALTER TABLE enquiries DROP INDEX idx_enquiries_course;
ALTER TABLE enquiries DROP COLUMN course_id;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS course_audience;
DROP TABLE IF EXISTS course_benefits;
DROP TABLE IF EXISTS course_careers;
DROP TABLE IF EXISTS course_comparison;
DROP TABLE IF EXISTS course_facts;
DROP TABLE IF EXISTS course_faqs;
DROP TABLE IF EXISTS course_highlights;
DROP TABLE IF EXISTS course_plans;
DROP TABLE IF EXISTS course_points;
DROP TABLE IF EXISTS course_projects;
DROP TABLE IF EXISTS course_related;
DROP TABLE IF EXISTS course_reviews;
DROP TABLE IF EXISTS course_sections;
DROP TABLE IF EXISTS course_syllabus;
DROP TABLE IF EXISTS course_tools;
DROP TABLE IF EXISTS courses;

DROP TABLE IF EXISTS event_agenda;
DROP TABLE IF EXISTS event_highlights;
DROP TABLE IF EXISTS event_images;
DROP TABLE IF EXISTS event_speakers;
DROP TABLE IF EXISTS event_tags;
DROP TABLE IF EXISTS events;

DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS gallery_albums;

DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS ai_knowledge;
DROP TABLE IF EXISTS blog_comments;

SET FOREIGN_KEY_CHECKS = 1;

-- The FAQ tabs 047 seeded were the institute's course categories. Removed only
-- where nothing is filed under them, so no question loses its heading; General
-- stays as the catch-all.
DELETE FROM faq_categories
 WHERE slug IN ('digital-marketing', 'ai-data', 'development', 'cyber-cloud',
                'cad-design', 'programming')
   AND NOT EXISTS (SELECT 1 FROM faqs f WHERE f.category_id = faq_categories.id);

-- History rows about records that no longer exist would only confuse the
-- contribution figures, which count by entity type.
DELETE FROM activity_log
 WHERE entity_type IN ('courses', 'events', 'gallery', 'testimonials', 'reviews',
                       'ai-knowledge', 'comments');
