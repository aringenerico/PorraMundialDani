-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: auto-asignación de mejores terceros en la Ronda de 32
--
-- El WC 2026 tiene 12 grupos (A-L). Los 8 mejores terceros de esos 12 grupos
-- avanzan. Cada uno va a un partido de R32 específico según su grupo de origen.
--
-- Tabla de elegibilidad oficial (qué grupos pueden ir a cada partido):
--   M74 ← 3º de A/B/C/D/F
--   M77 ← 3º de C/D/F/G/H
--   M79 ← 3º de C/E/F/H/I
--   M80 ← 3º de E/H/I/J/K
--   M81 ← 3º de B/E/F/I/J
--   M82 ← 3º de A/E/H/I/J
--   M85 ← 3º de E/F/G/I/J
--   M87 ← 3º de D/E/I/J/L
--
-- Algoritmo: bipartite greedy — procesa primero el tercero con menos slots
-- disponibles (más restringido), asignándolo siempre al slot también más
-- restringido para minimizar conflictos.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper 1: todos los terceros de grupo, ordenados mejor→peor ─────────────
CREATE OR REPLACE FUNCTION _thirds_ranked()
RETURNS TABLE(grp TEXT, team TEXT, pts BIGINT, gd BIGINT, gf BIGINT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH raw AS (
    SELECT group_name AS grp, home_team AS team,
      CASE WHEN home_goals > away_goals THEN 3
           WHEN home_goals = away_goals THEN 1 ELSE 0 END AS pts,
      home_goals - away_goals AS gd,
      home_goals              AS gf
    FROM matches
    WHERE phase = 'group' AND status = 'finished' AND home_goals IS NOT NULL
    UNION ALL
    SELECT group_name, away_team,
      CASE WHEN away_goals > home_goals THEN 3
           WHEN away_goals = home_goals THEN 1 ELSE 0 END,
      away_goals - home_goals, away_goals
    FROM matches
    WHERE phase = 'group' AND status = 'finished' AND away_goals IS NOT NULL
  ),
  summed AS (
    SELECT grp, team,
      SUM(pts) AS pts,
      SUM(gd)  AS gd,
      SUM(gf)  AS gf
    FROM raw
    GROUP BY grp, team
  ),
  ranked AS (
    SELECT grp, team, pts, gd, gf,
      ROW_NUMBER() OVER (
        PARTITION BY grp
        ORDER BY pts DESC, gd DESC, gf DESC
      ) AS rn
    FROM summed
  )
  SELECT grp, team, pts, gd, gf
  FROM ranked
  WHERE rn = 3
  ORDER BY pts DESC, gd DESC, gf DESC;
$$;

-- ── Helper 2: ¿puede el grupo ir a ese slot? ─────────────────────────────────
CREATE OR REPLACE FUNCTION _slot_eligible(p_slot INT, p_grp TEXT)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT p_grp = ANY(
    CASE p_slot
      WHEN 74 THEN ARRAY['A','B','C','D','F']
      WHEN 77 THEN ARRAY['C','D','F','G','H']
      WHEN 79 THEN ARRAY['C','E','F','H','I']
      WHEN 80 THEN ARRAY['E','H','I','J','K']
      WHEN 81 THEN ARRAY['B','E','F','I','J']
      WHEN 82 THEN ARRAY['A','E','H','I','J']
      WHEN 85 THEN ARRAY['E','F','G','I','J']
      WHEN 87 THEN ARRAY['D','E','I','J','L']
      ELSE         ARRAY[]::TEXT[]
    END
  );
$$;

-- ── Función principal: rellena el cuadro eliminatorio ────────────────────────
CREATE OR REPLACE FUNCTION auto_fill_bracket()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  -- control del loop de mejores terceros
  v_used_grps  TEXT[] := '{}';
  v_used_slots INT[]  := ARRAY[]::INT[];
  v_all_slots  CONSTANT INT[] := ARRAY[74,77,79,80,81,82,85,87];
  v_grp        TEXT;
  v_team       TEXT;
  v_slot       INT;
  v_iter       INT := 0;
BEGIN

  -- ── R32: cruces fijos (1º vs 2º de grupo conocidos) ───────────────────────
  UPDATE matches SET home_team = _group_team('A',2), away_team = _group_team('B',2)
    WHERE match_number = 73
      AND _group_team('A',2) IS NOT NULL AND _group_team('B',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('F',1), away_team = _group_team('C',2)
    WHERE match_number = 75
      AND _group_team('F',1) IS NOT NULL AND _group_team('C',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('C',1), away_team = _group_team('F',2)
    WHERE match_number = 76
      AND _group_team('C',1) IS NOT NULL AND _group_team('F',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('E',2), away_team = _group_team('I',2)
    WHERE match_number = 78
      AND _group_team('E',2) IS NOT NULL AND _group_team('I',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('K',2), away_team = _group_team('L',2)
    WHERE match_number = 83
      AND _group_team('K',2) IS NOT NULL AND _group_team('L',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('H',1), away_team = _group_team('J',2)
    WHERE match_number = 84
      AND _group_team('H',1) IS NOT NULL AND _group_team('J',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('J',1), away_team = _group_team('H',2)
    WHERE match_number = 86
      AND _group_team('J',1) IS NOT NULL AND _group_team('H',2) IS NOT NULL;

  UPDATE matches SET home_team = _group_team('D',2), away_team = _group_team('G',2)
    WHERE match_number = 88
      AND _group_team('D',2) IS NOT NULL AND _group_team('G',2) IS NOT NULL;

  -- ── R32: homes de los partidos con mejor-3º (1º de grupo) ─────────────────
  UPDATE matches SET home_team = _group_team('E',1)
    WHERE match_number = 74 AND _group_team('E',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('I',1)
    WHERE match_number = 77 AND _group_team('I',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('A',1)
    WHERE match_number = 79 AND _group_team('A',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('L',1)
    WHERE match_number = 80 AND _group_team('L',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('D',1)
    WHERE match_number = 81 AND _group_team('D',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('G',1)
    WHERE match_number = 82 AND _group_team('G',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('B',1)
    WHERE match_number = 85 AND _group_team('B',1) IS NOT NULL;
  UPDATE matches SET home_team = _group_team('K',1)
    WHERE match_number = 87 AND _group_team('K',1) IS NOT NULL;

  -- ── R32: ASIGNACIÓN AUTOMÁTICA DE MEJORES TERCEROS ────────────────────────
  -- Greedy bipartite: procesa el tercero con menos slots disponibles primero.
  -- Cada iteración asigna exactamente un tercero a un slot.
  -- Máximo 8 iteraciones (8 terceros a asignar).

  LOOP
    v_iter := v_iter + 1;
    EXIT WHEN v_iter > 8;

    -- Selecciona el tercero no asignado con MENOS slots disponibles (más restringido)
    -- Desempate: mejor pts/gd/gf
    SELECT t.grp, t.team
    INTO   v_grp, v_team
    FROM   _thirds_ranked() t
    WHERE  NOT (t.grp = ANY(v_used_grps))
      AND  EXISTS (
             SELECT 1 FROM unnest(v_all_slots) s(n)
             WHERE  NOT (n = ANY(v_used_slots))
               AND  _slot_eligible(n, t.grp)
           )
    ORDER BY (
               SELECT COUNT(*) FROM unnest(v_all_slots) s(n)
               WHERE  NOT (n = ANY(v_used_slots))
                 AND  _slot_eligible(n, t.grp)
             ) ASC,
             t.pts DESC, t.gd DESC, t.gf DESC
    LIMIT 1;

    EXIT WHEN v_grp IS NULL;

    -- Entre los slots elegibles para ese grupo, elige el más restringido
    -- (el que tiene menos terceros elegibles aún disponibles)
    SELECT n
    INTO   v_slot
    FROM   unnest(v_all_slots) s(n)
    WHERE  NOT (n = ANY(v_used_slots))
      AND  _slot_eligible(n, v_grp)
    ORDER BY (
               -- cuántos otros terceros disponibles pueden ir a este slot
               SELECT COUNT(*) FROM _thirds_ranked() t2
               WHERE  NOT (t2.grp = ANY(v_used_grps))
                 AND  t2.grp <> v_grp
                 AND  _slot_eligible(n, t2.grp)
             ) ASC
    LIMIT 1;

    EXIT WHEN v_slot IS NULL;

    -- Asigna el equipo al partido (solo si away_team aún no está fijado)
    UPDATE matches
    SET    away_team = v_team
    WHERE  match_number = v_slot
      AND  (away_team IS NULL OR away_team = '' OR away_team = '?');

    v_used_grps  := v_used_grps  || v_grp;
    v_used_slots := v_used_slots || v_slot;
  END LOOP;

  -- ── R16 (Octavos): ganadores de R32 ───────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(74), away_team = _match_winner(77)
    WHERE match_number = 89
      AND _match_winner(74) IS NOT NULL AND _match_winner(77) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(73), away_team = _match_winner(75)
    WHERE match_number = 90
      AND _match_winner(73) IS NOT NULL AND _match_winner(75) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(76), away_team = _match_winner(78)
    WHERE match_number = 91
      AND _match_winner(76) IS NOT NULL AND _match_winner(78) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(79), away_team = _match_winner(80)
    WHERE match_number = 92
      AND _match_winner(79) IS NOT NULL AND _match_winner(80) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(83), away_team = _match_winner(84)
    WHERE match_number = 93
      AND _match_winner(83) IS NOT NULL AND _match_winner(84) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(81), away_team = _match_winner(82)
    WHERE match_number = 94
      AND _match_winner(81) IS NOT NULL AND _match_winner(82) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(86), away_team = _match_winner(88)
    WHERE match_number = 95
      AND _match_winner(86) IS NOT NULL AND _match_winner(88) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(85), away_team = _match_winner(87)
    WHERE match_number = 96
      AND _match_winner(85) IS NOT NULL AND _match_winner(87) IS NOT NULL;

  -- ── QF (Cuartos): ganadores de R16 ────────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(89), away_team = _match_winner(90)
    WHERE match_number = 97
      AND _match_winner(89) IS NOT NULL AND _match_winner(90) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(93), away_team = _match_winner(94)
    WHERE match_number = 98
      AND _match_winner(93) IS NOT NULL AND _match_winner(94) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(91), away_team = _match_winner(92)
    WHERE match_number = 99
      AND _match_winner(91) IS NOT NULL AND _match_winner(92) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(95), away_team = _match_winner(96)
    WHERE match_number = 100
      AND _match_winner(95) IS NOT NULL AND _match_winner(96) IS NOT NULL;

  -- ── SF (Semifinales): ganadores de QF ─────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(97), away_team = _match_winner(98)
    WHERE match_number = 101
      AND _match_winner(97) IS NOT NULL AND _match_winner(98) IS NOT NULL;

  UPDATE matches SET home_team = _match_winner(99), away_team = _match_winner(100)
    WHERE match_number = 102
      AND _match_winner(99) IS NOT NULL AND _match_winner(100) IS NOT NULL;

  -- ── 3er Puesto ─────────────────────────────────────────────────────────────
  UPDATE matches SET home_team = _match_loser(101), away_team = _match_loser(102)
    WHERE match_number = 103
      AND _match_loser(101) IS NOT NULL AND _match_loser(102) IS NOT NULL;

  -- ── Final ──────────────────────────────────────────────────────────────────
  UPDATE matches SET home_team = _match_winner(101), away_team = _match_winner(102)
    WHERE match_number = 104
      AND _match_winner(101) IS NOT NULL AND _match_winner(102) IS NOT NULL;

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION _thirds_ranked()               TO authenticated;
GRANT EXECUTE ON FUNCTION _slot_eligible(INT, TEXT)      TO authenticated;
GRANT EXECUTE ON FUNCTION auto_fill_bracket()            TO authenticated;
GRANT EXECUTE ON FUNCTION _group_team(TEXT, INT)         TO authenticated;
GRANT EXECUTE ON FUNCTION _match_winner(INT)             TO authenticated;
GRANT EXECUTE ON FUNCTION _match_loser(INT)              TO authenticated;
