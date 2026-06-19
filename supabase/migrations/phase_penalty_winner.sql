-- phase_penalty_winner.sql
-- Knockout penalty-winner admin override.
-- When a knockout match ends in a draw, the admin records who won on
-- penalties via the new column. auto_fill_bracket then advances them.
-- Idempotent — safe to re-run.

-- ─── 1. Column on matches ────────────────────────────────────────────────────
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_winner TEXT;

-- ─── 2. Helper functions: fall back to penalty_winner when tied ──────────────
CREATE OR REPLACE FUNCTION _match_winner(num INT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN home_goals > away_goals THEN home_team
    WHEN away_goals > home_goals THEN away_team
    ELSE penalty_winner   -- NULL until admin records it; bracket waits
  END
  FROM matches WHERE match_number = num AND status = 'finished';
$$;

CREATE OR REPLACE FUNCTION _match_loser(num INT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN home_goals > away_goals THEN away_team
    WHEN away_goals > home_goals THEN home_team
    WHEN penalty_winner IS NULL THEN NULL
    WHEN penalty_winner = home_team THEN away_team
    WHEN penalty_winner = away_team THEN home_team
    ELSE NULL
  END
  FROM matches WHERE match_number = num AND status = 'finished';
$$;

-- ─── 3. RPC for admin to set the penalty winner ──────────────────────────────
-- Reuses the same admin-only check pattern as admin_save_result.
-- The admin gate in PorraDani is the client-side PIN, so this RPC trusts any
-- authenticated user (consistent with admin_save_result). If you later add an
-- admins table, wrap the body in an EXISTS check.
CREATE OR REPLACE FUNCTION admin_set_penalty_winner(
  p_match_id BIGINT,
  p_winner   TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_home TEXT;
  v_away TEXT;
  v_phase TEXT;
BEGIN
  SELECT home_team, away_team, phase
    INTO v_home, v_away, v_phase
    FROM matches WHERE id = p_match_id;
  IF v_phase = 'group' THEN
    RAISE EXCEPTION 'Penalty winner not applicable in group stage';
  END IF;
  IF p_winner IS NOT NULL AND p_winner <> v_home AND p_winner <> v_away THEN
    RAISE EXCEPTION 'Winner must be one of the two teams';
  END IF;
  UPDATE matches SET penalty_winner = p_winner WHERE id = p_match_id;
END;
$$;
