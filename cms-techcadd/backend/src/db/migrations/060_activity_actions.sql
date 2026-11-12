-- Two more things the history can say happened: a piece of content was
-- scheduled, or archived. Both are status changes people ask about ("who took
-- this down?"), and recording them as plain edits would hide them among every
-- typo fix. approved / hidden stay so existing rows remain valid.

ALTER TABLE activity_log
  MODIFY COLUMN action ENUM('created','updated','published','unpublished','deleted',
                            'approved','hidden','scheduled','archived') NOT NULL;
