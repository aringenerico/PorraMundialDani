-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY · PORRA MARCADORES
-- Ejecutar DESPUÉS de schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- MATCHES: lectura pública, escritura solo desde service_role (admin / seed)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_read_all"   ON matches FOR SELECT USING (true);
CREATE POLICY "matches_admin_only" ON matches FOR ALL
  USING (auth.role() = 'service_role');

-- PREDICTIONS: cada usuario ve y gestiona solo las suyas; el admin lo ve todo
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "predictions_own_read" ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "predictions_own_insert" ON predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    -- Solo se puede insertar antes del deadline de esa jornada
    AND (SELECT deadline FROM matches WHERE id = match_id) > NOW()
  );

CREATE POLICY "predictions_own_update" ON predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    (SELECT deadline FROM matches WHERE id = match_id) > NOW()
  );

CREATE POLICY "predictions_admin_all" ON predictions FOR ALL
  USING (auth.role() = 'service_role');

-- PROFILES: pública para el leaderboard, privada para edición
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write" ON profiles FOR ALL
  USING (auth.uid() = id);

-- LEADERBOARD VIEW: accesible para todos los usuarios autenticados
-- (la vista hereda los permisos de las tablas base)
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;
