-- ─────────────────────────────────────────────────────────────────────────────
-- PORRA MARCADORES · MUNDIAL 2026 · SUPABASE SCHEMA
-- Ejecutar en: supabase.com > SQL Editor > New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. MATCHES ─────────────────────────────────────────────────────────────────
--    Catálogo de los 104 partidos. Lo rellena seed-matches.sql.
CREATE TABLE IF NOT EXISTS matches (
  id            SERIAL PRIMARY KEY,
  match_number  INT NOT NULL UNIQUE,          -- nº oficial (1-104)
  phase         TEXT NOT NULL,                -- 'group'|'r32'|'r16'|'qf'|'sf'|'3rd'|'final'
  group_name    TEXT,                         -- 'A'..'L'  (null en fases eliminatorias)
  matchday      INT NOT NULL,                 -- jornada: 1..n (define el deadline)
  deadline      TIMESTAMPTZ NOT NULL,         -- cierre de predicciones para esta jornada
  home_team     TEXT,                         -- null hasta que se determinen los cruces
  away_team     TEXT,
  match_date    TIMESTAMPTZ,
  stadium       TEXT,
  -- Resultados (los rellena el admin manualmente; Phase 2: sync automático)
  home_goals    INT,
  away_goals    INT,
  status        TEXT NOT NULL DEFAULT 'scheduled'  -- 'scheduled'|'finished'
);

-- 2. PREDICTIONS ──────────────────────────────────────────────────────────────
--    Una fila por (usuario, partido). Se inserta al guardar la jornada.
CREATE TABLE IF NOT EXISTS predictions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id      INT  NOT NULL REFERENCES matches(id)   ON DELETE CASCADE,
  home_goals    INT  NOT NULL CHECK (home_goals >= 0),
  away_goals    INT  NOT NULL CHECK (away_goals >= 0),
  -- Puntuación calculada cuando el partido termina (null hasta entonces)
  pts_goals_h   NUMERIC(4,1),   -- +0.5 si acertaste goles del local
  pts_goals_a   NUMERIC(4,1),   -- +0.5 si acertaste goles del visitante
  pts_result    NUMERIC(4,1),   -- +1  si acertaste resultado (G/E/P)
  pts_exact     NUMERIC(4,1),   -- +1  si marcador exacto (bonus sobre +0.5+0.5+1)
  pts_total     NUMERIC(4,1),   -- suma de los cuatro campos
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

-- 3. LEADERBOARD VIEW ─────────────────────────────────────────────────────────
--    Vista calculada en tiempo real. El admin también puede materializar.
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.user_id,
  u.raw_user_meta_data->>'full_name'   AS display_name,
  u.raw_user_meta_data->>'avatar_url'  AS avatar_url,
  u.email,
  COUNT(p.id)                          AS predictions_made,
  COALESCE(SUM(p.pts_total), 0)        AS total_pts,
  COALESCE(SUM(p.pts_exact),  0)       AS pts_exact,
  COALESCE(SUM(p.pts_result), 0)       AS pts_result,
  COALESCE(SUM(p.pts_goals_h + p.pts_goals_a), 0) AS pts_goals
FROM predictions p
JOIN auth.users u ON u.id = p.user_id
GROUP BY p.user_id, u.raw_user_meta_data, u.email
ORDER BY total_pts DESC, pts_exact DESC, pts_result DESC;

-- 4. USER PROFILES (opcional — extiende auth.users) ──────────────────────────
--    Se crea automáticamente vía trigger cuando alguien hace OAuth.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crea perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 5. INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_predictions_user    ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match   ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_matchday    ON matches(matchday);
CREATE INDEX IF NOT EXISTS idx_matches_phase       ON matches(phase);
