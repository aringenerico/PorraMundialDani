-- ─────────────────────────────────────────────────────────────────────────────
-- ADMIN: guarda el resultado de un partido (bypasea RLS via SECURITY DEFINER)
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_save_result(
  p_match_id uuid,
  p_home     int,
  p_away     int
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE matches
  SET home_goals = p_home,
      away_goals = p_away,
      status     = 'finished'
  WHERE id = p_match_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_save_result(uuid, int, int) TO authenticated;
