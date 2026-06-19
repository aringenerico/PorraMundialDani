-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: 104 PARTIDOS · MUNDIAL 2026
-- Fuente: Fixture oficial FIFA World Cup 2026
-- Tiempos almacenados en hora local con offset UTC de cada sede
-- ─────────────────────────────────────────────────────────────────────────────
-- Deadlines por jornada (2h antes del primer partido):
--   Jornada 1 (Fase grupos, 1ª vuelta): 2026-06-11 14:00 UTC
--   Jornada 2 (Fase grupos, 2ª vuelta): 2026-06-18 14:00 UTC
--   Jornada 3 (Fase grupos, 3ª vuelta): 2026-06-24 20:00 UTC
--   Jornada 4 (Dieciseisavos / R32):    2026-06-28 16:00 UTC
--   Jornada 5 (Octavos / R16):          2026-07-04 16:00 UTC
--   Jornada 6 (Cuartos / QF):           2026-07-09 16:00 UTC
--   Jornada 7 (Semifinales):            2026-07-14 16:00 UTC
--   Jornada 8 (3er Puesto + Final):     2026-07-18 16:00 UTC
-- ─────────────────────────────────────────────────────────────────────────────

-- Limpiar partidos existentes antes de reinsertar
TRUNCATE matches RESTART IDENTITY CASCADE;

-- ─── JORNADA 1 · FASE DE GRUPOS · 1ª VUELTA (Partidos 1–24) ─────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Jueves 11 junio
(1,'group','A',1,'2026-06-11 14:00+00','Mexico','South Africa','2026-06-11 15:00:00-05','Estadio Ciudad de México'),
(2,'group','A',1,'2026-06-11 14:00+00','South Korea','Czech Republic','2026-06-11 22:00:00-05','Estadio Guadalajara'),

-- Viernes 12 junio
(3,'group','B',1,'2026-06-11 14:00+00','Canada','Bosnia and Herzegovina','2026-06-12 15:00:00-04','Estadio Toronto'),
(4,'group','D',1,'2026-06-11 14:00+00','USA','Paraguay','2026-06-12 21:00:00-07','Estadio Los Ángeles'),

-- Sábado 13 junio
(5,'group','D',1,'2026-06-11 14:00+00','Australia','Turkey','2026-06-14 00:00:00-07','BC Place Vancouver'),
(6,'group','B',1,'2026-06-11 14:00+00','Qatar','Switzerland','2026-06-13 15:00:00-07','Estadio Bahía de San Francisco'),
(7,'group','C',1,'2026-06-11 14:00+00','Brazil','Morocco','2026-06-13 18:00:00-04','Estadio Nueva York Nueva Jersey'),
(8,'group','C',1,'2026-06-11 14:00+00','Haiti','Scotland','2026-06-13 21:00:00-04','Estadio Boston'),

-- Domingo 14 junio
(9,'group','E',1,'2026-06-11 14:00+00','Germany','Curaçao','2026-06-14 13:00:00-05','Estadio Houston'),
(10,'group','F',1,'2026-06-11 14:00+00','Netherlands','Japan','2026-06-14 16:00:00-05','Estadio Dallas'),
(11,'group','E',1,'2026-06-11 14:00+00','Ivory Coast','Ecuador','2026-06-14 19:00:00-04','Estadio Filadelfia'),
(12,'group','F',1,'2026-06-11 14:00+00','Sweden','Tunisia','2026-06-14 22:00:00-05','Estadio Monterrey'),

-- Lunes 15 junio
(13,'group','H',1,'2026-06-11 14:00+00','Spain','Cabo Verde','2026-06-15 12:00:00-04','Estadio Atlanta'),
(14,'group','G',1,'2026-06-11 14:00+00','Belgium','Egypt','2026-06-15 15:00:00-07','Estadio Seattle'),
(15,'group','H',1,'2026-06-11 14:00+00','Saudi Arabia','Uruguay','2026-06-15 18:00:00-04','Estadio Miami'),
(16,'group','G',1,'2026-06-11 14:00+00','Iran','New Zealand','2026-06-15 21:00:00-07','Estadio Los Ángeles'),

-- Martes 16 junio
(17,'group','J',1,'2026-06-11 14:00+00','Austria','Jordan','2026-06-17 00:00:00-07','Estadio Bahía de San Francisco'),
(18,'group','I',1,'2026-06-11 14:00+00','France','Senegal','2026-06-16 15:00:00-04','Estadio Nueva York Nueva Jersey'),
(19,'group','I',1,'2026-06-11 14:00+00','Iraq','Norway','2026-06-16 18:00:00-04','Estadio Boston'),
(20,'group','J',1,'2026-06-11 14:00+00','Argentina','Algeria','2026-06-16 21:00:00-05','Estadio Kansas City'),

-- Miércoles 17 junio
(21,'group','K',1,'2026-06-11 14:00+00','Portugal','DR Congo','2026-06-17 13:00:00-05','Estadio Houston'),
(22,'group','L',1,'2026-06-11 14:00+00','England','Croatia','2026-06-17 16:00:00-05','Estadio Dallas'),
(23,'group','L',1,'2026-06-11 14:00+00','Ghana','Panama','2026-06-17 19:00:00-04','Estadio Toronto'),
(24,'group','K',1,'2026-06-11 14:00+00','Uzbekistan','Colombia','2026-06-17 22:00:00-05','Estadio Ciudad de México');

-- ─── JORNADA 2 · FASE DE GRUPOS · 2ª VUELTA (Partidos 25–48) ────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Jueves 18 junio
(25,'group','A',2,'2026-06-18 14:00+00','Czech Republic','South Africa','2026-06-18 12:00:00-04','Estadio Atlanta'),
(26,'group','B',2,'2026-06-18 14:00+00','Switzerland','Bosnia and Herzegovina','2026-06-18 15:00:00-07','Estadio Los Ángeles'),
(27,'group','B',2,'2026-06-18 14:00+00','Canada','Qatar','2026-06-18 18:00:00-07','BC Place Vancouver'),
(28,'group','A',2,'2026-06-18 14:00+00','Mexico','South Korea','2026-06-18 21:00:00-05','Estadio Guadalajara'),

-- Viernes 19 junio
(29,'group','D',2,'2026-06-18 14:00+00','USA','Australia','2026-06-19 15:00:00-07','Estadio Seattle'),
(30,'group','C',2,'2026-06-18 14:00+00','Scotland','Morocco','2026-06-19 18:00:00-04','Estadio Boston'),
(31,'group','C',2,'2026-06-18 14:00+00','Brazil','Haiti','2026-06-19 21:00:00-04','Estadio Filadelfia'),
(32,'group','D',2,'2026-06-18 14:00+00','Turkey','Paraguay','2026-06-20 00:00:00-07','Estadio Bahía de San Francisco'),

-- Sábado 20 junio
(33,'group','F',2,'2026-06-18 14:00+00','Netherlands','Sweden','2026-06-20 13:00:00-05','Estadio Houston'),
(34,'group','E',2,'2026-06-18 14:00+00','Germany','Ivory Coast','2026-06-20 16:00:00-04','Estadio Toronto'),
(35,'group','E',2,'2026-06-18 14:00+00','Ecuador','Curaçao','2026-06-20 22:00:00-05','Estadio Kansas City'),
(36,'group','F',2,'2026-06-18 14:00+00','Tunisia','Japan','2026-06-21 00:00:00-05','Estadio Monterrey'),

-- Domingo 21 junio
(37,'group','H',2,'2026-06-18 14:00+00','Spain','Saudi Arabia','2026-06-21 12:00:00-04','Estadio Atlanta'),
(38,'group','G',2,'2026-06-18 14:00+00','Belgium','Iran','2026-06-21 15:00:00-07','Estadio Los Ángeles'),
(39,'group','H',2,'2026-06-18 14:00+00','Uruguay','Cabo Verde','2026-06-21 18:00:00-04','Estadio Miami'),
(40,'group','G',2,'2026-06-18 14:00+00','New Zealand','Egypt','2026-06-21 21:00:00-07','BC Place Vancouver'),

-- Lunes 22 junio
(41,'group','J',2,'2026-06-18 14:00+00','Argentina','Austria','2026-06-22 13:00:00-05','Estadio Dallas'),
(42,'group','I',2,'2026-06-18 14:00+00','France','Iraq','2026-06-22 17:00:00-04','Estadio Filadelfia'),
(43,'group','I',2,'2026-06-18 14:00+00','Norway','Senegal','2026-06-22 20:00:00-04','Estadio Nueva York Nueva Jersey'),
(44,'group','J',2,'2026-06-18 14:00+00','Jordan','Algeria','2026-06-22 23:00:00-07','Estadio Bahía de San Francisco'),

-- Martes 23 junio
(45,'group','K',2,'2026-06-18 14:00+00','Portugal','Uzbekistan','2026-06-23 13:00:00-05','Estadio Houston'),
(46,'group','L',2,'2026-06-18 14:00+00','England','Ghana','2026-06-23 16:00:00-04','Estadio Boston'),
(47,'group','L',2,'2026-06-18 14:00+00','Panama','Croatia','2026-06-23 19:00:00-04','Estadio Toronto'),
(48,'group','K',2,'2026-06-18 14:00+00','Colombia','DR Congo','2026-06-23 22:00:00-05','Estadio Guadalajara');

-- ─── JORNADA 3 · FASE DE GRUPOS · 3ª VUELTA (Partidos 49–72) ────────────────
-- Todos los partidos de cada grupo simultáneos
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Miércoles 24 junio (Grupos A, B, C)
(49,'group','B',3,'2026-06-24 20:00+00','Switzerland','Canada','2026-06-24 15:00:00-07','BC Place Vancouver'),
(50,'group','B',3,'2026-06-24 20:00+00','Bosnia and Herzegovina','Qatar','2026-06-24 15:00:00-07','Estadio Seattle'),
(51,'group','C',3,'2026-06-24 20:00+00','Scotland','Brazil','2026-06-24 18:00:00-04','Estadio Miami'),
(52,'group','C',3,'2026-06-24 20:00+00','Morocco','Haiti','2026-06-24 18:00:00-04','Estadio Atlanta'),
(53,'group','A',3,'2026-06-24 20:00+00','Czech Republic','Mexico','2026-06-24 21:00:00-05','Estadio Ciudad de México'),
(54,'group','A',3,'2026-06-24 20:00+00','South Africa','South Korea','2026-06-24 21:00:00-05','Estadio Monterrey'),

-- Jueves 25 junio (Grupos D, E, F)
(55,'group','E',3,'2026-06-24 20:00+00','Curaçao','Ivory Coast','2026-06-25 16:00:00-04','Estadio Filadelfia'),
(56,'group','E',3,'2026-06-24 20:00+00','Ecuador','Germany','2026-06-25 16:00:00-04','Estadio Nueva York Nueva Jersey'),
(57,'group','F',3,'2026-06-24 20:00+00','Japan','Sweden','2026-06-25 19:00:00-05','Estadio Dallas'),
(58,'group','F',3,'2026-06-24 20:00+00','Tunisia','Netherlands','2026-06-25 19:00:00-05','Estadio Kansas City'),
(59,'group','D',3,'2026-06-24 20:00+00','Turkey','USA','2026-06-25 22:00:00-07','Estadio Los Ángeles'),
(60,'group','D',3,'2026-06-24 20:00+00','Paraguay','Australia','2026-06-25 22:00:00-07','Estadio Bahía de San Francisco'),

-- Viernes 26 junio (Grupos G, H, I)
(61,'group','I',3,'2026-06-24 20:00+00','Norway','France','2026-06-26 15:00:00-04','Estadio Boston'),
(62,'group','I',3,'2026-06-24 20:00+00','Senegal','Iraq','2026-06-26 15:00:00-04','Estadio Toronto'),
(63,'group','H',3,'2026-06-24 20:00+00','Cabo Verde','Saudi Arabia','2026-06-26 20:00:00-05','Estadio Houston'),
(64,'group','H',3,'2026-06-24 20:00+00','Uruguay','Spain','2026-06-26 20:00:00-05','Estadio Guadalajara'),
(65,'group','G',3,'2026-06-24 20:00+00','Egypt','Iran','2026-06-26 23:00:00-07','Estadio Seattle'),
(66,'group','G',3,'2026-06-24 20:00+00','New Zealand','Belgium','2026-06-26 23:00:00-07','BC Place Vancouver'),

-- Sábado 27 junio (Grupos J, K, L)
(67,'group','L',3,'2026-06-24 20:00+00','Panama','England','2026-06-27 17:00:00-04','Estadio Nueva York Nueva Jersey'),
(68,'group','L',3,'2026-06-24 20:00+00','Croatia','Ghana','2026-06-27 17:00:00-04','Estadio Filadelfia'),
(69,'group','K',3,'2026-06-24 20:00+00','Colombia','Portugal','2026-06-27 19:30:00-04','Estadio Miami'),
(70,'group','K',3,'2026-06-24 20:00+00','DR Congo','Uzbekistan','2026-06-27 19:30:00-04','Estadio Atlanta'),
(71,'group','J',3,'2026-06-24 20:00+00','Algeria','Austria','2026-06-27 22:00:00-05','Estadio Kansas City'),
(72,'group','J',3,'2026-06-24 20:00+00','Jordan','Argentina','2026-06-27 22:00:00-05','Estadio Dallas');

-- ─── JORNADA 4 · DIECISEISAVOS DE FINAL / R32 (Partidos 73–88) ──────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Domingo 28 junio
(73,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-28 18:00+00','Estadio Los Ángeles'),

-- Lunes 29 junio
(74,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-29 18:00+00','Estadio Boston'),
(75,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-29 21:00+00','Estadio Monterrey'),
(76,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-30 00:00+00','Estadio Houston'),

-- Martes 30 junio
(77,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-30 18:00+00','Estadio Nueva York Nueva Jersey'),
(78,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-06-30 21:00+00','Estadio Dallas'),
(79,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-01 00:00+00','Estadio Ciudad de México'),

-- Miércoles 1 julio
(80,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-01 18:00+00','Estadio Atlanta'),
(81,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-01 21:00+00','Estadio Bahía de San Francisco'),
(82,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-02 00:00+00','Estadio Seattle'),

-- Jueves 2 julio
(83,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-02 18:00+00','Estadio Toronto'),
(84,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-02 21:00+00','Estadio Los Ángeles'),
(85,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-03 00:00+00','BC Place Vancouver'),

-- Viernes 3 julio
(86,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-03 18:00+00','Estadio Miami'),
(87,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-03 21:00+00','Estadio Kansas City'),
(88,'r32',NULL,4,'2026-06-28 16:00+00',NULL,NULL,'2026-07-04 00:00+00','Estadio Dallas');

-- ─── JORNADA 5 · OCTAVOS DE FINAL / R16 (Partidos 89–96) ───────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Sábado 4 julio
(89,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-04 18:00+00','Estadio Filadelfia'),
(90,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-04 22:00+00','Estadio Houston'),

-- Domingo 5 julio
(91,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-05 18:00+00','Estadio Nueva York Nueva Jersey'),
(92,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-05 22:00+00','Estadio Ciudad de México'),

-- Lunes 6 julio
(93,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-06 18:00+00','Estadio Dallas'),
(94,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-06 22:00+00','Estadio Seattle'),

-- Martes 7 julio
(95,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-07 18:00+00','Estadio Atlanta'),
(96,'r16',NULL,5,'2026-07-04 16:00+00',NULL,NULL,'2026-07-07 22:00+00','BC Place Vancouver');

-- ─── JORNADA 6 · CUARTOS DE FINAL / QF (Partidos 97–100) ───────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Jueves 9 julio
(97,'qf',NULL,6,'2026-07-09 16:00+00',NULL,NULL,'2026-07-09 20:00+00','Estadio Boston'),

-- Viernes 10 julio
(98,'qf',NULL,6,'2026-07-09 16:00+00',NULL,NULL,'2026-07-10 20:00+00','Estadio Los Ángeles'),

-- Sábado 11 julio
(99,'qf',NULL,6,'2026-07-09 16:00+00',NULL,NULL,'2026-07-11 20:00+00','Estadio Miami'),
(100,'qf',NULL,6,'2026-07-09 16:00+00',NULL,NULL,'2026-07-12 00:00+00','Estadio Kansas City');

-- ─── JORNADA 7 · SEMIFINALES (Partidos 101–102) ────────────────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Martes 14 julio
(101,'sf',NULL,7,'2026-07-14 16:00+00',NULL,NULL,'2026-07-14 20:00+00','Estadio Dallas'),

-- Miércoles 15 julio
(102,'sf',NULL,7,'2026-07-14 16:00+00',NULL,NULL,'2026-07-15 20:00+00','Estadio Atlanta');

-- ─── JORNADA 8 · 3ER PUESTO + FINAL (Partidos 103–104) ─────────────────────
INSERT INTO matches (match_number,phase,group_name,matchday,deadline,home_team,away_team,match_date,stadium) VALUES

-- Sábado 18 julio
(103,'3rd',NULL,8,'2026-07-18 16:00+00',NULL,NULL,'2026-07-18 20:00+00','Estadio Miami'),

-- Domingo 19 julio
(104,'final',NULL,8,'2026-07-18 16:00+00',NULL,NULL,'2026-07-19 20:00+00','Estadio Nueva York Nueva Jersey');

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificación: debe devolver 104
-- SELECT COUNT(*) FROM matches;
-- ─────────────────────────────────────────────────────────────────────────────
