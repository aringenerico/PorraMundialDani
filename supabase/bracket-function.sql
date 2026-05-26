-- ─────────────────────────────────────────────────────────────────────────────
-- BRACKET AUTO-FILL FUNCTIONS · PORRA MARCADORES
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper: devuelve el equipo en posición N de un grupo ─────────────────────
CREATE OR REPLACE FUNCTION _group_team(grp TEXT, pos INT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH stats AS (
    SELECT team, SUM(pts) p, SUM(gf)-SUM(ga) gd, SUM(gf) gf
    FROM (
      SELECT home_team AS team,
        CASE WHEN home_goals > away_goals THEN 3
             WHEN home_goals = away_goals THEN 1 ELSE 0 END AS pts,
        home_goals AS gf, away_goals AS ga
      FROM matches
      WHERE group_name = grp AND phase = 'group'
        AND status = 'finished' AND home_goals IS NOT NULL
      UNION ALL
      SELECT away_team,
        CASE WHEN away_goals > home_goals THEN 3
             WHEN away_goals = home_goals THEN 1 ELSE 0 END,
        away_goals, home_goals
      FROM matches
      WHERE group_name = grp AND phase = 'group'
        AND status = 'finished' AND away_goals IS NOT NULL
    ) x
    GROUP BY team
  )
  SELECT team FROM stats ORDER BY p DESC, gd DESC, gf DESC
  LIMIT 1 OFFSET pos - 1;
$$;

-- ── Helper: devuelve el ganador de un partido eliminatorio ───────────────────
CREATE OR REPLACE FUNCTION _match_winner(num INT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN home_goals >= away_goals THEN home_team ELSE away_team END
  FROM matches WHERE match_number = num AND status = 'finished';
$$;

-- ── Helper: devuelve el perdedor de un partido (semifinal → 3er puesto) ──────
CREATE OR REPLACE FUNCTION _match_loser(num INT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN home_goals <= away_goals THEN home_team ELSE away_team END
  FROM matches WHERE match_number = num AND status = 'finished';
$$;

-- ── Función principal: rellena el cuadro eliminatorio ────────────────────────
-- Llamar desde el panel Admin con: SELECT auto_fill_bracket();
-- O desde Supabase JS: supabase.rpc('auto_fill_bracket')
--
-- Lógica de cruces R32 según fixture oficial:
--   M73: 2ºA v 2ºB          M75: 1ºF v 2ºC
--   M76: 1ºC v 2ºF          M78: 2ºE v 2ºI
--   M83: 2ºK v 2ºL          M84: 1ºH v 2ºJ
--   M86: 1ºJ v 2ºH          M88: 2ºD v 2ºG
--   M74: 1ºE v mejor 3º(A/B/C/D/F)   ← away lo rellena admin
--   M77: 1ºI v mejor 3º(C/D/F/G/H)   ← away lo rellena admin
--   M79: 1ºA v mejor 3º(C/E/F/H/I)   ← away lo rellena admin
--   M80: 1ºL v mejor 3º(E/H/I/J/K)   ← away lo rellena admin
--   M81: 1ºD v mejor 3º(B/E/F/I/J)   ← away lo rellena admin
--   M82: 1ºG v mejor 3º(A/E/H/I/J)   ← away lo rellena admin
--   M85: 1ºB v mejor 3º(E/F/G/I/J)   ← away lo rellena admin
--   M87: 1ºK v mejor 3º(D/E/I/J/L)   ← away lo rellena admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_fill_bracket()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN

  -- ── R32: cruces con dos equipos determinados por grupo ───────────────────
  UPDATE matches SET home_team = _group_team('A',2), away_team = _group_team('B',2)
    WHERE match_number = 73 AND _group_team('A',2) IS NOT NULL AND _group_team('B',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('F',1), away_team = _group_team('C',2)
    WHERE match_number = 75 AND _group_team('F',1) IS NOT NULL AND _group_team('C',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('C',1), away_team = _group_team('F',2)
    WHERE match_number = 76 AND _group_team('C',1) IS NOT NULL AND _group_team('F',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('E',2), away_team = _group_team('I',2)
    WHERE match_number = 78 AND _group_team('E',2) IS NOT NULL AND _group_team('I',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('K',2), away_team = _group_team('L',2)
    WHERE match_number = 83 AND _group_team('K',2) IS NOT NULL AND _group_team('L',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('H',1), away_team = _group_team('J',2)
    WHERE match_number = 84 AND _group_team('H',1) IS NOT NULL AND _group_team('J',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('J',1), away_team = _group_team('H',2)
    WHERE match_number = 86 AND _group_team('J',1) IS NOT NULL AND _group_team('H',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('D',2), away_team = _group_team('G',2)
    WHERE match_number = 88 AND _group_team('D',2) IS NOT NULL AND _group_team('G',2) IS NOT NULL;

  -- ── R32: solo home conocido (1º de grupo) — away = mejor 3º, admin lo rellena
  UPDATE matches SET home_team = _group_team('E',1)
    WHERE match_number = 74 AND _group_team('E',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('I',1)
    WHERE match_number = 77 AND _group_team('I',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('A',1)
    WHERE match_number = 79 AND _group_team('A',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('L',1)
    WHERE match_number = 80 AND _group_team('L',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('D',1)
    WHERE match_number = 81 AND _group_team('D',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('G',1)
    WHERE match_number = 82 AND _group_team('G',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('B',1)
    WHERE match_number = 85 AND _group_team('B',1) IS NOT NULL AND home_team IS NULL;

  UPDATE matches SET home_team = _group_team('K',1)
    WHERE match_number = 87 AND _group_team('K',1) IS NOT NULL AND home_team IS NULL;

  -- ── R16 (Octavos): ganadores de R32 ────────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(74), away_team = _match_winner(77)
    WHERE match_number = 89 AND _match_winner(74) IS NOT NULL AND _match_winner(77) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(73), away_team = _match_winner(75)
    WHERE match_number = 90 AND _match_winner(73) IS NOT NULL AND _match_winner(75) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(76), away_team = _match_winner(78)
    WHERE match_number = 91 AND _match_winner(76) IS NOT NULL AND _match_winner(78) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(79), away_team = _match_winner(80)
    WHERE match_number = 92 AND _match_winner(79) IS NOT NULL AND _match_winner(80) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(83), away_team = _match_winner(84)
    WHERE match_number = 93 AND _match_winner(83) IS NOT NULL AND _match_winner(84) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(81), away_team = _match_winner(82)
    WHERE match_number = 94 AND _match_winner(81) IS NOT NULL AND _match_winner(82) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(86), away_team = _match_winner(88)
    WHERE match_number = 95 AND _match_winner(86) IS NOT NULL AND _match_winner(88) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(85), away_team = _match_winner(87)
    WHERE match_number = 96 AND _match_winner(85) IS NOT NULL AND _match_winner(87) IS NOT NULL;

  -- ── QF (Cuartos): ganadores de R16 ─────────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(89), away_team = _match_winner(90)
    WHERE match_number = 97 AND _match_winner(89) IS NOT NULL AND _match_winner(90) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(93), away_team = _match_winner(94)
    WHERE match_number = 98 AND _match_winner(93) IS NOT NULL AND _match_winner(94) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(91), away_team = _match_winner(92)
    WHERE match_number = 99 AND _match_winner(91) IS NOT NULL AND _match_winner(92) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(95), away_team = _match_winner(96)
    WHERE match_number = 100 AND _match_winner(95) IS NOT NULL AND _match_winner(96) IS NOT NULL;

  -- ── SF (Semifinales): ganadores de QF ──────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(97), away_team = _match_winner(98)
    WHERE match_number = 101 AND _match_winner(97) IS NOT NULL AND _match_winner(98) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(99), away_team = _match_winner(100)
    WHERE match_number = 102 AND _match_winner(99) IS NOT NULL AND _match_winner(100) IS NOT NULL;

  -- ── 3er Puesto: perdedores de semifinales ───────────────────────────────────
  UPDATE matches SET home_team = _match_loser(101), away_team = _match_loser(102)
    WHERE match_number = 103 AND _match_loser(101) IS NOT NULL AND _match_loser(102) IS NOT NULL;

  -- ── Final: ganadores de semifinales ────────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(101), away_team = _match_winner(102)
    WHERE match_number = 104 AND _match_winner(101) IS NOT NULL AND _match_winner(102) IS NOT NULL;

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Permitir llamada desde el cliente autenticado
GRANT EXECUTE ON FUNCTION auto_fill_bracket() TO authenticated;
GRANT EXECUTE ON FUNCTION _group_team(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION _match_winner(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION _match_loser(INT) TO authenticated;
