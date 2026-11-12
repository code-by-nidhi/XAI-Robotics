-- Backfill usernames for accounts created before migration 018.
-- An account with NULL username cannot log in because login matches on username.

UPDATE users
   SET username = 'techcadd'
 WHERE email = 'admin@techcaddjalandhar.com'
   AND (username IS NULL OR username = '');

UPDATE users
   SET username = LOWER(SUBSTRING_INDEX(email, '@', 1))
 WHERE username IS NULL OR username = '';
