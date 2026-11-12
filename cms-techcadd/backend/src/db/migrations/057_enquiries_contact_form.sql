-- Enquiries become the Zaavi contact form's inbox.
--
-- The form asks for a name, an email, and optionally a phone, company and the
-- service someone is interested in, then a message. Email is the one way back
-- to them, so it becomes required and phone optional — the reverse of the
-- institute's walk-in desk, where a phone number was the lead.
--
-- Status follows Zaavi's inquiry pipeline: new → read (opened in the CMS) →
-- in_progress → resolved, with archived to clear the inbox. The old statuses
-- map onto it by meaning rather than by name.

ALTER TABLE enquiries DROP INDEX ft_enquiries;

ALTER TABLE enquiries
  CHANGE COLUMN student_name name VARCHAR(120) NOT NULL,
  MODIFY COLUMN phone VARCHAR(40) NULL;

UPDATE enquiries SET email = '' WHERE email IS NULL;
ALTER TABLE enquiries MODIFY COLUMN email VARCHAR(190) NOT NULL;

ALTER TABLE enquiries
  ADD COLUMN company VARCHAR(160) NULL AFTER phone,
  ADD COLUMN service VARCHAR(160) NULL AFTER company,
  ADD COLUMN subject VARCHAR(200) NULL AFTER service;

-- What the student asked about is the nearest thing the old rows have to a
-- service, so it is carried over rather than lost.
UPDATE enquiries SET service = NULLIF(course_name, '');

ALTER TABLE enquiries
  MODIFY COLUMN status ENUM('new','contacted','follow-up','converted','closed',
                            'read','in_progress','resolved','archived') NOT NULL DEFAULT 'new';
UPDATE enquiries SET status = 'in_progress' WHERE status IN ('contacted', 'follow-up');
UPDATE enquiries SET status = 'resolved'    WHERE status = 'converted';
UPDATE enquiries SET status = 'archived'    WHERE status = 'closed';
ALTER TABLE enquiries
  MODIFY COLUMN status ENUM('new','read','in_progress','resolved','archived') NOT NULL DEFAULT 'new';

-- The institute's classification and follow-up scheduling have no place on a
-- contact form. ip and user_agent stay: the duplicate and rate checks use them.
ALTER TABLE enquiries
  DROP COLUMN course_name,
  DROP COLUMN source,
  DROP COLUMN form_type,
  DROP COLUMN source_url,
  DROP COLUMN follow_up_date;

-- The double-submit guard looks up the same email and message in a short
-- window; message is TEXT, so the index covers the email and time.
ALTER TABLE enquiries ADD KEY idx_enquiries_email_created (email, created_at);
ALTER TABLE enquiries ADD KEY idx_enquiries_service (service);
