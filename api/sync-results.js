// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2: Sync match results from football-data.org
// Vercel Serverless Function — llamar manualmente o via cron
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sync-results
// Headers: Authorization: Bearer <ADMIN_SECRET>
// Body: { matchday: 1 }  (opcional — sin él sincroniza todos los finalizados)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service_role para bypass RLS
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Autenticación básica admin
  const secret = req.headers['authorization']?.replace('Bearer ', '');
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Proxy a football-data.org
    const fdRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED',
      { headers: { 'X-Auth-Token': process.env.FD_KEY } }
    );
    const fdData = await fdRes.json();
    if (!fdRes.ok) return res.status(fdRes.status).json({ error: fdData?.message });

    const finished = fdData.matches || [];
    let updated = 0;

    for (const m of finished) {
      const home = m.score?.fullTime?.home;
      const away = m.score?.fullTime?.away;
      if (home === null || away === null) continue;

      // Busca el partido por número de partido (match_number = m.id)
      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('match_number', m.id)
        .single();
      if (!match) continue;

      // Actualiza resultado
      await supabase.from('matches').update({
        home_goals: home,
        away_goals: away,
        status: 'finished'
      }).eq('id', match.id);

      // Recalcula puntuaciones de ese partido
      await recalcPredictions(match.id, home, away);
      updated++;
    }

    return res.status(200).json({ ok: true, updated });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ─── Recalcula pts de todas las predicciones de un partido ───────────────────
async function recalcPredictions(matchId, realHome, realAway) {
  const { data: preds } = await supabase
    .from('predictions')
    .select('id, home_goals, away_goals')
    .eq('match_id', matchId);

  for (const p of preds || []) {
    const pts_goals_h = p.home_goals === realHome ? 0.5 : 0;
    const pts_goals_a = p.away_goals === realAway ? 0.5 : 0;

    const realResult = realHome > realAway ? 'H' : realHome < realAway ? 'A' : 'D';
    const predResult = p.home_goals > p.away_goals ? 'H' : p.home_goals < p.away_goals ? 'A' : 'D';
    const pts_result = realResult === predResult ? 1 : 0;

    const isExact = p.home_goals === realHome && p.away_goals === realAway;
    const pts_exact = isExact ? 1 : 0;  // +1 bonus (acumula sobre los anteriores)

    const pts_total = pts_goals_h + pts_goals_a + pts_result + pts_exact;

    await supabase.from('predictions').update({
      pts_goals_h, pts_goals_a, pts_result, pts_exact, pts_total
    }).eq('id', p.id);
  }
}
