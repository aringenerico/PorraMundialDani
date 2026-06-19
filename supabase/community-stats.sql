-- ─────────────────────────────────────────────────────────────────────────────
-- match_community_stats(p_match_id)
--
-- Devuelve estadísticas agregadas de pronósticos para un partido:
--   total     → nº de jugadores que han pronosticado
--   hw        → % victoria local
--   dr        → % empate
--   aw        → % victoria visitante
--   top_score → marcador exacto más votado (ej: "2–1")
--   top_count → cuántos jugadores eligieron ese marcador
--
-- Usa SECURITY DEFINER para bypassear RLS y devolver solo datos agregados
-- (no expone predicciones individuales).
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_community_stats(p_match_id UUID)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total     INT;
  v_hw        INT;
  v_dr        INT;
  v_aw        INT;
  v_top_score TEXT;
  v_top_count INT;
BEGIN
  SELECT COUNT(*)
    INTO v_total
    FROM predictions
   WHERE match_id   = p_match_id
     AND home_goals IS NOT NULL
     AND away_goals IS NOT NULL;

  IF v_total < 2 THEN
    RETURN NULL;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE home_goals > away_goals),
    COUNT(*) FILTER (WHERE home_goals = away_goals),
    COUNT(*) FILTER (WHERE home_goals < away_goals)
  INTO v_hw, v_dr, v_aw
  FROM predictions
  WHERE match_id   = p_match_id
    AND home_goals IS NOT NULL
    AND away_goals IS NOT NULL;

  SELECT
    home_goals || '–' || away_goals,
    COUNT(*)
  INTO v_top_score, v_top_count
  FROM predictions
  WHERE match_id   = p_match_id
    AND home_goals IS NOT NULL
    AND away_goals IS NOT NULL
  GROUP BY home_goals, away_goals
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'total',     v_total,
    'hw',        ROUND(v_hw::numeric / v_total * 100),
    'dr',        ROUND(v_dr::numeric / v_total * 100),
    'aw',        ROUND(v_aw::numeric / v_total * 100),
    'top_score', v_top_score,
    'top_count', v_top_count
  );
END;
$$;

-- Accesible tanto para usuarios anónimos como autenticados
GRANT EXECUTE ON FUNCTION match_community_stats(UUID) TO anon, authenticated;
