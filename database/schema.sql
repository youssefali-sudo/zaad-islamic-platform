CREATE TABLE IF NOT EXISTS content_items (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('quran_note','hadith','tafsir','lesson','dhikr')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_reference TEXT NOT NULL,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_key TEXT NOT NULL,
  progress_date DATE NOT NULL,
  pages_completed SMALLINT NOT NULL DEFAULT 0 CHECK (pages_completed BETWEEN 0 AND 6),
  habits JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_key, progress_date)
);
-- Keep user_key pseudonymous; do not store sensitive habit details.
