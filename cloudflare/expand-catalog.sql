CREATE TABLE tourism_entries_expanded (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('stay', 'guide', 'food', 'nature', 'destination')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  data TEXT NOT NULL CHECK (json_valid(data)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO tourism_entries_expanded (id,slug,kind,status,data,created_at,updated_at)
SELECT id,slug,kind,status,data,created_at,updated_at FROM tourism_entries;
DROP TABLE tourism_entries;
ALTER TABLE tourism_entries_expanded RENAME TO tourism_entries;
CREATE INDEX tourism_entries_status_updated ON tourism_entries(status, updated_at);
