-- ─────────────────────────────────────────────────────────────────────────────
-- leaderboard_filtered(p_matchday, p_phase)
--
-- Devuelve el leaderboard filtrado por jornada o fase.
-- Usa SECURITY DEFINER para bypasear RLS y leer predictions de todos los users.
--
-- Uso:
--   supabase.rpc('leaderboard_filtered', { p_matchday: 3, p_phase: null })
--   supabase.rpc('leaderboard_filtered', { p_matchday: null, p_phase: 'group' })
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION leaderboard_filtered(
  p_matchday INT  DEFAULT NULL,
  p_phase    TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id          UUID,
  display_name     TEXT,
  avatar_url       TEXT,
  email            TEXT,
  predictions_made BIGINT,
  total_pts        NUMERIC,
  pts_exact        NUMERIC,
  pts_result       NUMERIC,
  pts_goals        NUMERIC
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    p.user_id,
    u.raw_user_meta_data->>'full_name'                       AS display_name,
    u.raw_user_meta_data->>'avatar_url'                      AS avatar_url,
    u.email,
    COUNT(p.id)                                              AS predictions_made,
    COALESCE(SUM(p.pts_total), 0)                            AS total_pts,
    COALESCE(SUM(p.pts_exact),  0)                           AS pts_exact,
    COALESCE(SUM(p.pts_result), 0)                           AS pts_result,
    COALESCE(SUM(p.pts_goals_h + p.pts_goals_a), 0)          AS pts_goals
  FROM predictions p
  JOIN matches m ON m.id = p.match_id
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.pts_total IS NOT NULL
    AND (p_matchday IS NULL OR m.matchday = p_matchday)
    AND (p_phase    IS NULL OR m.phase    = p_phase)
  GROUP BY p.user_id, u.raw_user_meta_data, u.email
  ORDER BY total_pts DESC, pts_exact DESC, pts_result DESC;
$$;

GRANT EXECUTE ON FUNCTION leaderboard_filtered(INT, TEXT) TO authenticated;
