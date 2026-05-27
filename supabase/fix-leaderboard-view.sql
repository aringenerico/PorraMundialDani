-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: Leaderboard view — calcula puntos en tiempo real desde matches
--
-- Problema anterior: la vista leía predictions.pts_total, pero ese campo nunca
-- se actualizaba al guardar resultados con admin_save_result.
--
-- Solución: calcular los puntos directamente al unir predictions + matches,
-- con la misma fórmula que calcScore() en el cliente:
--   +0.5 por gol local acertado
--   +0.5 por gol visitante acertado
--   +1   por resultado correcto (V/E/D)
--   +1   por marcador exacto (bonus)
-- Total exacto = 3 pts  |  Solo resultado = 1 pts  |  Solo goles = 0.5–1 pts
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.user_id,
  u.raw_user_meta_data->>'full_name'   AS display_name,
  u.raw_user_meta_data->>'avatar_url'  AS avatar_url,
  u.email,
  COUNT(p.id)                          AS predictions_made,

  -- TOTAL PTS
  COALESCE(SUM(
    CASE WHEN m.status = 'finished' AND m.home_goals IS NOT NULL AND m.away_goals IS NOT NULL THEN
      -- +0.5 gol local
      (CASE WHEN p.home_goals = m.home_goals THEN 0.5 ELSE 0 END) +
      -- +0.5 gol visitante
      (CASE WHEN p.away_goals = m.away_goals THEN 0.5 ELSE 0 END) +
      -- +1 resultado correcto (V/E/D)
      (CASE WHEN SIGN(p.home_goals::int - p.away_goals::int)
                 = SIGN(m.home_goals - m.away_goals) THEN 1 ELSE 0 END) +
      -- +1 bonus marcador exacto
      (CASE WHEN p.home_goals = m.home_goals AND p.away_goals = m.away_goals THEN 1 ELSE 0 END)
    ELSE 0 END
  ), 0)                                AS total_pts,

  -- PTS_EXACT (nº de marcadores exactos × 1 bonus)
  COALESCE(SUM(
    CASE WHEN m.status = 'finished'
              AND p.home_goals = m.home_goals
              AND p.away_goals = m.away_goals
         THEN 1 ELSE 0 END
  ), 0)                                AS pts_exact,

  -- PTS_RESULT (nº de resultados V/E/D correctos × 1)
  COALESCE(SUM(
    CASE WHEN m.status = 'finished' AND m.home_goals IS NOT NULL THEN
      (CASE WHEN SIGN(p.home_goals::int - p.away_goals::int)
                 = SIGN(m.home_goals - m.away_goals) THEN 1 ELSE 0 END)
    ELSE 0 END
  ), 0)                                AS pts_result,

  -- PTS_GOALS (goles individuales acertados × 0.5)
  COALESCE(SUM(
    CASE WHEN m.status = 'finished' AND m.home_goals IS NOT NULL THEN
      (CASE WHEN p.home_goals = m.home_goals THEN 0.5 ELSE 0 END) +
      (CASE WHEN p.away_goals = m.away_goals THEN 0.5 ELSE 0 END)
    ELSE 0 END
  ), 0)                                AS pts_goals

FROM predictions p
JOIN auth.users u  ON u.id  = p.user_id
JOIN matches    m  ON m.id  = p.match_id
GROUP BY p.user_id, u.raw_user_meta_data, u.email
ORDER BY total_pts DESC, pts_exact DESC, pts_result DESC;
