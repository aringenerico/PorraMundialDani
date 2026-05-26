-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: 104 PARTIDOS · MUNDIAL 2026
-- Fuente: Excel fixture proporcionado por el usuario
-- Deadlines: 2h antes del primer partido de cada jornada
-- ─────────────────────────────────────────────────────────────────────────────
-- INSTRUCCIONES:
--   1. Completa las fechas/equipos exactos del Excel en cada INSERT.
--   2. Ajusta los DEADLINES (2h antes de kickoff de cada jornada).
--   3. Para las fases eliminatorias, home_team/away_team son NULL hasta
--      que se calculen los clasificados. El admin los actualizará manualmente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── JORNADA 1 (Grupos A-D, Partido 1) ────────────────────────────────────────
-- deadline: 2026-06-11 15:00 UTC  (2h antes del primer KO)
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
-- Grupo A
(1,  'group','A', 1, '2026-06-11 15:00+00', 'Mexico',        'Team A2', '2026-06-11 17:00+00', 'Estadio Azteca'),
(2,  'group','A', 1, '2026-06-11 15:00+00', 'Team A3',       'Team A4', '2026-06-11 20:00+00', 'Estadio Azteca'),
-- Grupo B
(3,  'group','B', 1, '2026-06-11 15:00+00', 'USA',           'Team B2', '2026-06-12 17:00+00', 'MetLife Stadium'),
(4,  'group','B', 1, '2026-06-11 15:00+00', 'Team B3',       'Team B4', '2026-06-12 20:00+00', 'MetLife Stadium'),
-- Grupo C
(5,  'group','C', 1, '2026-06-11 15:00+00', 'Canada',        'Team C2', '2026-06-13 17:00+00', 'BMO Field'),
(6,  'group','C', 1, '2026-06-11 15:00+00', 'Team C3',       'Team C4', '2026-06-13 20:00+00', 'BMO Field'),
-- Grupo D
(7,  'group','D', 1, '2026-06-11 15:00+00', 'Spain',         'Team D2', '2026-06-14 17:00+00', 'SoFi Stadium'),
(8,  'group','D', 1, '2026-06-11 15:00+00', 'Team D3',       'Team D4', '2026-06-14 20:00+00', 'SoFi Stadium'),

-- ── JORNADA 2 (Grupos E-H, Partido 1) ────────────────────────────────────────
-- deadline: 2026-06-15 15:00 UTC
(9,  'group','E', 2, '2026-06-15 15:00+00', 'Brazil',        'Team E2', '2026-06-15 17:00+00', 'AT&T Stadium'),
(10, 'group','E', 2, '2026-06-15 15:00+00', 'Team E3',       'Team E4', '2026-06-15 20:00+00', 'AT&T Stadium'),
(11, 'group','F', 2, '2026-06-15 15:00+00', 'Germany',       'Team F2', '2026-06-16 17:00+00', 'Mercedes-Benz Stadium'),
(12, 'group','F', 2, '2026-06-15 15:00+00', 'Team F3',       'Team F4', '2026-06-16 20:00+00', 'Mercedes-Benz Stadium'),
(13, 'group','G', 2, '2026-06-15 15:00+00', 'Argentina',     'Team G2', '2026-06-17 17:00+00', 'Rose Bowl'),
(14, 'group','G', 2, '2026-06-15 15:00+00', 'Team G3',       'Team G4', '2026-06-17 20:00+00', 'Rose Bowl'),
(15, 'group','H', 2, '2026-06-15 15:00+00', 'France',        'Team H2', '2026-06-18 17:00+00', 'Levi''s Stadium'),
(16, 'group','H', 2, '2026-06-15 15:00+00', 'Team H3',       'Team H4', '2026-06-18 20:00+00', 'Levi''s Stadium'),

-- ── JORNADA 3 (Grupos I-L, Partido 1) ────────────────────────────────────────
-- deadline: 2026-06-19 15:00 UTC
(17, 'group','I', 3, '2026-06-19 15:00+00', 'Portugal',      'Team I2', '2026-06-19 17:00+00', 'Lincoln Financial'),
(18, 'group','I', 3, '2026-06-19 15:00+00', 'Team I3',       'Team I4', '2026-06-19 20:00+00', 'Lincoln Financial'),
(19, 'group','J', 3, '2026-06-19 15:00+00', 'Netherlands',   'Team J2', '2026-06-20 17:00+00', 'Gillette Stadium'),
(20, 'group','J', 3, '2026-06-19 15:00+00', 'Team J3',       'Team J4', '2026-06-20 20:00+00', 'Gillette Stadium'),
(21, 'group','K', 3, '2026-06-19 15:00+00', 'England',       'Team K2', '2026-06-21 17:00+00', 'Arrowhead Stadium'),
(22, 'group','K', 3, '2026-06-19 15:00+00', 'Team K3',       'Team K4', '2026-06-21 20:00+00', 'Arrowhead Stadium'),
(23, 'group','L', 3, '2026-06-19 15:00+00', 'Morocco',       'Team L2', '2026-06-22 17:00+00', 'NRG Stadium'),
(24, 'group','L', 3, '2026-06-19 15:00+00', 'Team L3',       'Team L4', '2026-06-22 20:00+00', 'NRG Stadium');

-- ── CONTINÚA: Jornadas 4-6 (2ª y 3ª vuelta de grupos) ────────────────────────
-- NOTA: Copia el patrón anterior para match_number 25-72
-- Recuerda actualizar deadlines y fechas reales del Excel.

-- ── RONDA DE 32 (match_number 73-88) ─────────────────────────────────────────
-- home_team / away_team = NULL hasta clasificar grupos
-- deadline: 2h antes del primer R32 de esa jornada
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
(73, 'r32', NULL, 10, '2026-07-01 12:00+00', NULL, NULL, '2026-07-01 14:00+00', 'TBD'),
(74, 'r32', NULL, 10, '2026-07-01 12:00+00', NULL, NULL, '2026-07-01 18:00+00', 'TBD'),
(75, 'r32', NULL, 10, '2026-07-01 12:00+00', NULL, NULL, '2026-07-02 14:00+00', 'TBD'),
(76, 'r32', NULL, 10, '2026-07-01 12:00+00', NULL, NULL, '2026-07-02 18:00+00', 'TBD'),
(77, 'r32', NULL, 11, '2026-07-03 12:00+00', NULL, NULL, '2026-07-03 14:00+00', 'TBD'),
(78, 'r32', NULL, 11, '2026-07-03 12:00+00', NULL, NULL, '2026-07-03 18:00+00', 'TBD'),
(79, 'r32', NULL, 11, '2026-07-03 12:00+00', NULL, NULL, '2026-07-04 14:00+00', 'TBD'),
(80, 'r32', NULL, 11, '2026-07-03 12:00+00', NULL, NULL, '2026-07-04 18:00+00', 'TBD'),
(81, 'r32', NULL, 12, '2026-07-05 12:00+00', NULL, NULL, '2026-07-05 14:00+00', 'TBD'),
(82, 'r32', NULL, 12, '2026-07-05 12:00+00', NULL, NULL, '2026-07-05 18:00+00', 'TBD'),
(83, 'r32', NULL, 12, '2026-07-05 12:00+00', NULL, NULL, '2026-07-06 14:00+00', 'TBD'),
(84, 'r32', NULL, 12, '2026-07-05 12:00+00', NULL, NULL, '2026-07-06 18:00+00', 'TBD'),
(85, 'r32', NULL, 13, '2026-07-07 12:00+00', NULL, NULL, '2026-07-07 14:00+00', 'TBD'),
(86, 'r32', NULL, 13, '2026-07-07 12:00+00', NULL, NULL, '2026-07-07 18:00+00', 'TBD'),
(87, 'r32', NULL, 13, '2026-07-07 12:00+00', NULL, NULL, '2026-07-08 14:00+00', 'TBD'),
(88, 'r32', NULL, 13, '2026-07-07 12:00+00', NULL, NULL, '2026-07-08 18:00+00', 'TBD');

-- ── OCTAVOS (match_number 89-96) ──────────────────────────────────────────────
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
(89, 'r16', NULL, 14, '2026-07-10 12:00+00', NULL, NULL, '2026-07-10 18:00+00', 'TBD'),
(90, 'r16', NULL, 14, '2026-07-10 12:00+00', NULL, NULL, '2026-07-11 18:00+00', 'TBD'),
(91, 'r16', NULL, 14, '2026-07-10 12:00+00', NULL, NULL, '2026-07-12 18:00+00', 'TBD'),
(92, 'r16', NULL, 14, '2026-07-10 12:00+00', NULL, NULL, '2026-07-13 18:00+00', 'TBD'),
(93, 'r16', NULL, 15, '2026-07-14 12:00+00', NULL, NULL, '2026-07-14 18:00+00', 'TBD'),
(94, 'r16', NULL, 15, '2026-07-14 12:00+00', NULL, NULL, '2026-07-15 18:00+00', 'TBD'),
(95, 'r16', NULL, 15, '2026-07-14 12:00+00', NULL, NULL, '2026-07-16 18:00+00', 'TBD'),
(96, 'r16', NULL, 15, '2026-07-14 12:00+00', NULL, NULL, '2026-07-17 18:00+00', 'TBD');

-- ── CUARTOS (match_number 97-100) ────────────────────────────────────────────
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
(97,  'qf', NULL, 16, '2026-07-19 12:00+00', NULL, NULL, '2026-07-19 18:00+00', 'TBD'),
(98,  'qf', NULL, 16, '2026-07-19 12:00+00', NULL, NULL, '2026-07-20 18:00+00', 'TBD'),
(99,  'qf', NULL, 16, '2026-07-19 12:00+00', NULL, NULL, '2026-07-21 18:00+00', 'TBD'),
(100, 'qf', NULL, 16, '2026-07-19 12:00+00', NULL, NULL, '2026-07-22 18:00+00', 'TBD');

-- ── SEMIFINALES (match_number 101-102) ───────────────────────────────────────
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
(101, 'sf',    NULL, 17, '2026-07-24 12:00+00', NULL, NULL, '2026-07-24 18:00+00', 'MetLife Stadium'),
(102, 'sf',    NULL, 17, '2026-07-24 12:00+00', NULL, NULL, '2026-07-25 18:00+00', 'Rose Bowl');

-- ── 3er PUESTO + FINAL ────────────────────────────────────────────────────────
INSERT INTO matches (match_number, phase, group_name, matchday, deadline, home_team, away_team, match_date, stadium)
VALUES
(103, '3rd',   NULL, 18, '2026-07-28 12:00+00', NULL, NULL, '2026-07-28 18:00+00', 'MetLife Stadium'),
(104, 'final', NULL, 18, '2026-07-28 12:00+00', NULL, NULL, '2026-07-29 18:00+00', 'MetLife Stadium');
