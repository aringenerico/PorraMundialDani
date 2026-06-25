-- phase_third_overrides.sql
-- Admin override for "best 3rd-placed team" slot assignment in R32.
-- Greedy fallback assigns the 8 best thirds to the 8 slots in fixture order;
-- admin can override per-slot. auto_fill_bracket() uses this assignment to fill
-- the away_team of matches 74, 77, 79, 80, 81, 82, 85, 87.
-- Idempotent — safe to re-run.

-- ─── 1. Override table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS r32_third_overrides (
  slot    TEXT PRIMARY KEY,    -- '3_ABCDF', '3_CDFGH', '3_CEFHI', '3_EHIJK',
                               -- '3_BEFIJ', '3_AEHIJ', '3_EFGIJ', '3_DEIJL'
  team    TEXT NOT NULL,
  set_at  TIMESTAMPTZ DEFAULT NOW(),
  set_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE r32_third_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "r32o_select_all"    ON r32_third_overrides;
DROP POLICY IF EXISTS "r32o_upsert_auth"   ON r32_third_overrides;
DROP POLICY IF EXISTS "r32o_update_auth"   ON r32_third_overrides;
DROP POLICY IF EXISTS "r32o_delete_auth"   ON r32_third_overrides;

CREATE POLICY "r32o_select_all"  ON r32_third_overrides FOR SELECT USING (true);
CREATE POLICY "r32o_upsert_auth" ON r32_third_overrides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "r32o_update_auth" ON r32_third_overrides FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "r32o_delete_auth" ON r32_third_overrides FOR DELETE TO authenticated USING (true);

-- ─── 2. Helper: returns the team assigned to a given best-3rd slot ───────────
-- - Returns NULL if not all groups are finished.
-- - First checks override table.
-- - Falls back to greedy: walks slot order (M74, M77, M79, M80, M81, M82, M85, M87)
--   and picks for each the best-ranked 3rd from its eligible groups not yet used.
CREATE OR REPLACE FUNCTION _best_third_for_slot(p_slot TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_override TEXT;
  v_all_done BOOLEAN;
  v_slot_order TEXT[] := ARRAY['3_ABCDF','3_CDFGH','3_CEFHI','3_EHIJK',
                               '3_BEFIJ','3_AEHIJ','3_EFGIJ','3_DEIJL'];
  v_used TEXT[] := ARRAY[]::TEXT[];
  v_used_groups TEXT[] := ARRAY[]::TEXT[];
  v_slot TEXT;
  v_eligible TEXT[];
  v_pick RECORD;
  v_result TEXT;
BEGIN
  -- 1. Admin override wins
  SELECT team INTO v_override FROM r32_third_overrides WHERE slot = p_slot;
  IF v_override IS NOT NULL THEN RETURN v_override; END IF;

  -- 2. Only proceed if every group has 6 finished matches
  SELECT bool_and(c = 6) INTO v_all_done FROM (
    SELECT group_name, COUNT(*) AS c
    FROM matches
    WHERE phase = 'group' AND status = 'finished' AND home_goals IS NOT NULL
    GROUP BY group_name
  ) g WHERE group_name IS NOT NULL;
  IF NOT COALESCE(v_all_done, FALSE) THEN RETURN NULL; END IF;
  -- Need 12 finished groups
  IF (SELECT COUNT(DISTINCT group_name) FROM matches
      WHERE phase = 'group' AND group_name IS NOT NULL) <> 12 THEN
    RETURN NULL;
  END IF;

  -- 3. Walk slot order, picking the best-ranked eligible third for each slot
  FOREACH v_slot IN ARRAY v_slot_order LOOP
    -- eligible groups = substring after '3_'
    v_eligible := string_to_array(substring(v_slot FROM 3), NULL);
    -- get top-ranked 3rd whose group is eligible AND not yet used
    SELECT INTO v_pick t.team, t.grp
    FROM (
      SELECT g.group_name AS grp, s.team, s.pts, s.gd, s.gf
      FROM (
        SELECT DISTINCT group_name FROM matches WHERE phase = 'group' AND group_name IS NOT NULL
      ) g
      CROSS JOIN LATERAL (
        SELECT team, pts, gd, gf
        FROM _group_standings(g.group_name)
        ORDER BY pts DESC, gd DESC, gf DESC
        OFFSET 2 LIMIT 1
      ) s
    ) t
    WHERE t.grp = ANY(v_eligible)
      AND NOT (t.grp = ANY(v_used_groups))
    ORDER BY t.pts DESC, t.gd DESC, t.gf DESC
    LIMIT 1;

    IF v_pick.team IS NOT NULL THEN
      v_used_groups := v_used_groups || v_pick.grp;
      IF v_slot = p_slot THEN
        v_result := v_pick.team;
        -- continue walking so v_used_groups is consistent, but remember the answer
      END IF;
    ELSIF v_slot = p_slot THEN
      RETURN NULL;
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION _best_third_for_slot(TEXT) TO authenticated;

-- ─── 3. Helper: group standings (team, pts, gd, gf) for a group ──────────────
-- Needed by _best_third_for_slot. Encapsulates the same logic as _group_team
-- but exposes the full row so we can read pts/gd/gf for sorting.
CREATE OR REPLACE FUNCTION _group_standings(p_group TEXT)
RETURNS TABLE (team TEXT, pts INT, gd INT, gf INT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT team, SUM(pts)::INT AS pts, (SUM(gf)-SUM(ga))::INT AS gd, SUM(gf)::INT AS gf
  FROM (
    SELECT home_team AS team,
      CASE WHEN home_goals > away_goals THEN 3
           WHEN home_goals = away_goals THEN 1 ELSE 0 END AS pts,
      home_goals AS gf, away_goals AS ga
    FROM matches
    WHERE group_name = p_group AND phase = 'group'
      AND status = 'finished' AND home_goals IS NOT NULL
    UNION ALL
    SELECT away_team,
      CASE WHEN away_goals > home_goals THEN 3
           WHEN away_goals = home_goals THEN 1 ELSE 0 END,
      away_goals, home_goals
    FROM matches
    WHERE group_name = p_group AND phase = 'group'
      AND status = 'finished' AND away_goals IS NOT NULL
  ) x
  GROUP BY team;
$$;
GRANT EXECUTE ON FUNCTION _group_standings(TEXT) TO authenticated;

-- ─── 4. Patch auto_fill_bracket() so the 8 best-3rd slots auto-fill ─────────
-- We don't replace the whole function — we add 8 new UPDATE statements that
-- fill away_team for the third-dependent matches using _best_third_for_slot().
-- Existing M73/M75/M76/M78/M83/M84/M86/M88 logic is untouched.
CREATE OR REPLACE FUNCTION auto_fill_bracket_thirds()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- M74: 1E v mejor 3º (A/B/C/D/F)
  UPDATE matches SET away_team = _best_third_for_slot('3_ABCDF')
    WHERE match_number = 74
      AND _best_third_for_slot('3_ABCDF') IS NOT NULL;
  -- M77: 1I v mejor 3º (C/D/F/G/H)
  UPDATE matches SET away_team = _best_third_for_slot('3_CDFGH')
    WHERE match_number = 77
      AND _best_third_for_slot('3_CDFGH') IS NOT NULL;
  -- M79: 1A v mejor 3º (C/E/F/H/I)
  UPDATE matches SET away_team = _best_third_for_slot('3_CEFHI')
    WHERE match_number = 79
      AND _best_third_for_slot('3_CEFHI') IS NOT NULL;
  -- M80: 1L v mejor 3º (E/H/I/J/K)
  UPDATE matches SET away_team = _best_third_for_slot('3_EHIJK')
    WHERE match_number = 80
      AND _best_third_for_slot('3_EHIJK') IS NOT NULL;
  -- M81: 1D v mejor 3º (B/E/F/I/J)
  UPDATE matches SET away_team = _best_third_for_slot('3_BEFIJ')
    WHERE match_number = 81
      AND _best_third_for_slot('3_BEFIJ') IS NOT NULL;
  -- M82: 1G v mejor 3º (A/E/H/I/J)
  UPDATE matches SET away_team = _best_third_for_slot('3_AEHIJ')
    WHERE match_number = 82
      AND _best_third_for_slot('3_AEHIJ') IS NOT NULL;
  -- M85: 1B v mejor 3º (E/F/G/I/J)
  UPDATE matches SET away_team = _best_third_for_slot('3_EFGIJ')
    WHERE match_number = 85
      AND _best_third_for_slot('3_EFGIJ') IS NOT NULL;
  -- M87: 1K v mejor 3º (D/E/I/J/L)
  UPDATE matches SET away_team = _best_third_for_slot('3_DEIJL')
    WHERE match_number = 87
      AND _best_third_for_slot('3_DEIJL') IS NOT NULL;

  RETURN jsonb_build_object('status', 'ok');
END;
$$;
GRANT EXECUTE ON FUNCTION auto_fill_bracket_thirds() TO authenticated;

-- ─── 5. RPC the admin calls when changing an override ───────────────────────
-- Sets/clears the override, deletes the old R32 match team (so the next
-- auto_fill_bracket_thirds reassigns the correct away_team), and re-runs the
-- third assignment. Returns the new team or NULL.
CREATE OR REPLACE FUNCTION admin_set_third_override(p_slot TEXT, p_team TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_match_num INT;
BEGIN
  -- Map slot → match_number
  v_match_num := CASE p_slot
    WHEN '3_ABCDF' THEN 74
    WHEN '3_CDFGH' THEN 77
    WHEN '3_CEFHI' THEN 79
    WHEN '3_EHIJK' THEN 80
    WHEN '3_BEFIJ' THEN 81
    WHEN '3_AEHIJ' THEN 82
    WHEN '3_EFGIJ' THEN 85
    WHEN '3_DEIJL' THEN 87
    ELSE NULL
  END;
  IF v_match_num IS NULL THEN
    RAISE EXCEPTION 'Invalid slot %', p_slot;
  END IF;

  -- Wipe the existing away_team of this match so the next auto_fill replaces it
  UPDATE matches SET away_team = NULL WHERE match_number = v_match_num;

  -- Apply/clear override
  IF p_team IS NULL OR p_team = '' THEN
    DELETE FROM r32_third_overrides WHERE slot = p_slot;
  ELSE
    INSERT INTO r32_third_overrides (slot, team, set_by, set_at)
      VALUES (p_slot, p_team, auth.uid(), NOW())
      ON CONFLICT (slot) DO UPDATE
        SET team = EXCLUDED.team, set_by = EXCLUDED.set_by, set_at = EXCLUDED.set_at;
  END IF;

  -- Re-run greedy + override for all 8 slots
  PERFORM auto_fill_bracket_thirds();

  -- Return the resulting away_team
  RETURN (SELECT away_team FROM matches WHERE match_number = v_match_num);
END;
$$;
GRANT EXECUTE ON FUNCTION admin_set_third_override(TEXT, TEXT) TO authenticated;
