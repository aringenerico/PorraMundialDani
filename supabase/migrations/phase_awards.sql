-- phase_awards.sql
-- Run in Supabase SQL editor for project kvdtuogpkpklnqmbcjvo

CREATE TABLE IF NOT EXISTS award_predictions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN ('champion','top_scorer','mvp','best_goalkeeper','best_player')),
  value       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);
ALTER TABLE award_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ap_select_all"  ON award_predictions FOR SELECT USING (true);
CREATE POLICY "ap_insert_own"  ON award_predictions FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ap_update_own"  ON award_predictions FOR UPDATE  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS award_winners (
  id          BIGSERIAL PRIMARY KEY,
  category    TEXT NOT NULL UNIQUE CHECK (category IN ('champion','top_scorer','mvp','best_goalkeeper','best_player')),
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE award_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aw_select_all"  ON award_winners FOR SELECT USING (true);
CREATE POLICY "aw_upsert_auth" ON award_winners FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "aw_update_auth" ON award_winners FOR UPDATE  TO authenticated USING (true);
