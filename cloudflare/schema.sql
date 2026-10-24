CREATE TABLE IF NOT EXISTS administrators (
  user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tourism_entries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('stay', 'guide', 'food', 'nature', 'destination')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  data TEXT NOT NULL CHECK (json_valid(data)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tourism_entries_status_updated ON tourism_entries(status, updated_at);

-- A deletion marker prevents original static listings from reappearing.
CREATE TABLE IF NOT EXISTS tourism_entry_deletions (
  id TEXT PRIMARY KEY,
  deleted_at TEXT NOT NULL
);
