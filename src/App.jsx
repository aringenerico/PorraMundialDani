import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PIN = 'Arin2026!';   // PIN local para panel admin
const PHASES = ['group','r32','r16','qf','sf','3rd','final'];
const PHASE_LABELS = {
  group:'Fase de Grupos', r32:'Ronda de 32', r16:'Octavos',
  qf:'Cuartos de Final', sf:'Semifinales', '3rd':'3er Puesto', final:'Final'
};

// ─── FLAGS ────────────────────────────────────────────────────────────────────
const FLAGS = {
  "Argentina":"🇦🇷","Australia":"🇦🇺","Belgium":"🇧🇪","Brazil":"🇧🇷",
  "Canada":"🇨🇦","Colombia":"🇨🇴","Croatia":"🇭🇷","Ecuador":"🇪🇨",
  "Egypt":"🇪🇬","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","France":"🇫🇷","Germany":"🇩🇪",
  "Ghana":"🇬🇭","Iran":"🇮🇷","Japan":"🇯🇵","Mexico":"🇲🇽",
  "Morocco":"🇲🇦","Netherlands":"🇳🇱","Norway":"🇳🇴","Panama":"🇵🇦",
  "Paraguay":"🇵🇾","Portugal":"🇵🇹","Qatar":"🇶🇦","Saudi Arabia":"🇸🇦",
  "Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Senegal":"🇸🇳","South Korea":"🇰🇷","Spain":"🇪🇸",
  "Sweden":"🇸🇪","Switzerland":"🇨🇭","Tunisia":"🇹🇳","Turkey":"🇹🇷",
  "USA":"🇺🇸","United States":"🇺🇸","Uruguay":"🇺🇾",
};
const flag = t => FLAGS[t] || '🏳️';

// ─── SCORING ──────────────────────────────────────────────────────────────────
// +0.5 por cada equipo con goles acertados
// +1  por resultado correcto (G/E/P)
// +1  bonus si marcador exacto (acumula)
// Total máximo por partido: 0.5 + 0.5 + 1 + 1 = 3
const calcScore = (predH, predA, realH, realA) => {
  if (realH === null || realA === null) return null;
  const gh = predH === realH ? 0.5 : 0;
  const ga = predA === realA ? 0.5 : 0;
  const rp = (predH > predA ? 'H' : predH < predA ? 'A' : 'D');
  const rr = (realH > realA ? 'H' : realH < realA ? 'A' : 'D');
  const res = rp === rr ? 1 : 0;
  const exact = predH === realH && predA === realA ? 1 : 0;
  return gh + ga + res + exact;
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const LANGS = {
  es: {
    nav_home:'Inicio', nav_predict:'Mis Pronósticos', nav_results:'Resultados',
    nav_ranking:'Clasificación', nav_bracket:'Cuadro',
    login_btn:'Entrar con Google', logout_btn:'Cerrar sesión',
    welcome:'¡Bienvenido al Mundial 2026! 🏆',
    predict_title:'Mis Pronósticos', results_title:'Resultados',
    ranking_title:'Clasificación Global', bracket_title:'Cuadro Eliminatorio',
    save_btn:'Guardar', saving:'Guardando…', saved:'✅ Guardado',
    deadline_passed:'Plazo cerrado', no_predictions:'Sin predicciones aún',
    match_vs:'vs', pts:'pts', phase:'Fase',
    admin_panel:'Panel Admin', admin_results:'Actualizar Resultados',
    admin_save:'Guardar resultado', admin_saved:'Guardado ✓',
    login_required:'Inicia sesión con Google para hacer tus pronósticos',
    matchday:'Jornada', all_phases:'Todas las fases',
    your_score:'Tu puntuación', global_rank:'Puesto',
    open_until:'Plazo hasta',
  },
  en: {
    nav_home:'Home', nav_predict:'My Predictions', nav_results:'Results',
    nav_ranking:'Leaderboard', nav_bracket:'Bracket',
    login_btn:'Sign in with Google', logout_btn:'Sign out',
    welcome:'Welcome to World Cup 2026! 🏆',
    predict_title:'My Predictions', results_title:'Results',
    ranking_title:'Global Leaderboard', bracket_title:'Knockout Bracket',
    save_btn:'Save', saving:'Saving…', saved:'✅ Saved',
    deadline_passed:'Deadline passed', no_predictions:'No predictions yet',
    match_vs:'vs', pts:'pts', phase:'Phase',
    admin_panel:'Admin Panel', admin_results:'Update Results',
    admin_save:'Save result', admin_saved:'Saved ✓',
    login_required:'Sign in with Google to submit your predictions',
    matchday:'Matchday', all_phases:'All phases',
    your_score:'Your score', global_rank:'Rank',
    open_until:'Open until',
  },
  pt: {
    nav_home:'Início', nav_predict:'Meus Palpites', nav_results:'Resultados',
    nav_ranking:'Classificação', nav_bracket:'Chaveamento',
    login_btn:'Entrar com Google', logout_btn:'Sair',
    welcome:'Bem-vindo à Copa 2026! 🏆',
    predict_title:'Meus Palpites', results_title:'Resultados',
    ranking_title:'Classificação Geral', bracket_title:'Mata-Mata',
    save_btn:'Salvar', saving:'Salvando…', saved:'✅ Salvo',
    deadline_passed:'Prazo encerrado', no_predictions:'Sem palpites ainda',
    match_vs:'vs', pts:'pts', phase:'Fase',
    admin_panel:'Painel Admin', admin_results:'Atualizar Resultados',
    admin_save:'Salvar resultado', admin_saved:'Salvo ✓',
    login_required:'Entre com o Google para enviar seus palpites',
    matchday:'Rodada', all_phases:'Todas as fases',
    your_score:'Sua pontuação', global_rank:'Posição',
    open_until:'Aberto até',
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  :root {
    --bg:   #0a1628; --card: #132040; --card2: #1a2d52;
    --acc:  #F5B731; --acc2: #e0a520;
    --txt:  #e8f0fe; --mut:  #7a8ba0;
    --ok:   #40D490; --err:  #FF6B8A; --info: #60AAFF;
    --rad:  14px; --tr: .18s ease;
  }
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--txt); font-family:'Inter',system-ui,sans-serif;
         min-height:100vh; }

  /* ── HEADER ── */
  .hdr { background:linear-gradient(135deg,#0e1e3d,#1a2d52);
         border-bottom:2px solid rgba(245,183,49,.25); padding:0 16px; position:sticky;
         top:0; z-index:100; }
  .hdr-top { display:flex; align-items:center; gap:12px; padding:10px 0 6px;
             flex-wrap:wrap; }
  .hdr-icon { font-size:28px; }
  .hdr-name { font-size:18px; font-weight:700; color:var(--acc); letter-spacing:.5px; }
  .hdr-sub  { font-size:12px; color:var(--mut); }
  .hdr-user { margin-left:auto; display:flex; align-items:center; gap:8px; }
  .hdr-avatar { width:32px; height:32px; border-radius:50%;
                border:2px solid var(--acc); object-fit:cover; }
  .hdr-name-u { font-size:13px; color:var(--txt); max-width:140px;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* ── NAV ── */
  .nav { display:flex; gap:4px; overflow-x:auto; padding:0 0 8px;
         scrollbar-width:none; }
  .nav::-webkit-scrollbar { display:none; }
  .nav-btn { background:transparent; border:none; color:var(--mut); cursor:pointer;
             padding:8px 14px; border-radius:8px; font-size:14px; font-weight:500;
             white-space:nowrap; transition:all var(--tr); min-height:36px; }
  .nav-btn:hover { color:var(--txt); background:rgba(255,255,255,.06); }
  .nav-btn.on   { color:var(--acc); background:rgba(245,183,49,.12);
                  border-bottom:2px solid var(--acc); }

  /* ── LANG SELECTOR ── */
  .lang-sel { display:flex; gap:4px; }
  .lang-btn { background:rgba(255,255,255,.06); border:1px solid transparent;
              border-radius:6px; color:var(--mut); cursor:pointer; font-size:12px;
              padding:4px 8px; transition:all var(--tr); min-height:30px; }
  .lang-btn:hover  { color:var(--txt); border-color:rgba(255,255,255,.15); }
  .lang-btn.active { color:var(--acc); border-color:var(--acc);
                     background:rgba(245,183,49,.1); }

  /* ── PAGE ── */
  .page { max-width:900px; margin:0 auto; padding:16px; }
  .page-title { font-size:22px; font-weight:700; margin-bottom:16px;
                display:flex; align-items:center; gap:8px; }

  /* ── CARD ── */
  .card { background:var(--card); border-radius:var(--rad); padding:16px;
          border:1px solid rgba(255,255,255,.07); margin-bottom:12px; }
  .card2 { background:var(--card2); }

  /* ── BUTTON ── */
  .btn-acc { background:var(--acc); color:#0a1628; border:none; border-radius:10px;
             font-size:14px; font-weight:700; cursor:pointer; padding:10px 20px;
             transition:all var(--tr); min-height:44px; }
  .btn-acc:hover { background:var(--acc2); transform:translateY(-1px); }
  .btn-acc:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; border:1px solid rgba(255,255,255,.15);
               color:var(--txt); border-radius:10px; font-size:14px; cursor:pointer;
               padding:10px 20px; transition:all var(--tr); min-height:44px; }
  .btn-ghost:hover { border-color:rgba(255,255,255,.35); background:rgba(255,255,255,.05); }
  .btn-sm { padding:6px 14px; font-size:13px; min-height:36px; }

  /* ── MATCH CARD ── */
  .match-card { background:var(--card); border:1px solid rgba(255,255,255,.07);
                border-radius:var(--rad); padding:14px 16px; margin-bottom:10px;
                transition:border-color var(--tr); }
  .match-card.has-result { border-left:3px solid var(--ok); }
  .match-card.deadline-passed { opacity:.75; }
  .match-teams { display:flex; align-items:center; gap:8px; justify-content:space-between; }
  .team-name { font-size:14px; font-weight:600; display:flex; align-items:center; gap:6px; }
  .team-flag { font-size:20px; }
  .score-vs { color:var(--mut); font-size:13px; flex-shrink:0; }
  .score-result { font-size:18px; font-weight:700; color:var(--acc);
                  text-align:center; min-width:60px; }
  .match-meta { font-size:11px; color:var(--mut); margin-top:6px;
                display:flex; gap:12px; flex-wrap:wrap; }

  /* ── PREDICTION INPUTS ── */
  .pred-row { display:flex; align-items:center; gap:8px; margin-top:10px; }
  .score-input { width:52px; height:40px; background:var(--card2);
                 border:1px solid rgba(255,255,255,.15); border-radius:8px;
                 color:var(--txt); font-size:18px; font-weight:700;
                 text-align:center; outline:none; transition:border-color var(--tr); }
  .score-input:focus { border-color:var(--acc); }
  .pred-dash { color:var(--mut); font-size:18px; font-weight:700; }
  .pred-pts { margin-left:auto; font-size:13px; font-weight:600; }
  .pred-pts.exact  { color:var(--acc); }
  .pred-pts.result { color:var(--ok); }
  .pred-pts.goals  { color:var(--info); }
  .pred-pts.zero   { color:var(--mut); }

  /* ── MATCHDAY SECTION ── */
  .matchday-hdr { display:flex; align-items:center; justify-content:space-between;
                  margin:20px 0 10px; }
  .matchday-title { font-size:16px; font-weight:700; color:var(--acc); }
  .deadline-badge { font-size:11px; padding:3px 8px; border-radius:20px;
                    font-weight:600; }
  .deadline-badge.open   { background:rgba(64,212,144,.15); color:var(--ok); }
  .deadline-badge.closed { background:rgba(255,107,138,.15); color:var(--err); }
  .save-matchday { display:flex; justify-content:flex-end; margin-top:8px; }

  /* ── LEADERBOARD ── */
  .lb-row { display:flex; align-items:center; gap:12px; padding:12px 0;
            border-bottom:1px solid rgba(255,255,255,.07); }
  .lb-rank { font-size:18px; font-weight:700; color:var(--mut);
             min-width:32px; text-align:center; }
  .lb-rank.top1 { color:var(--acc); }
  .lb-rank.top2 { color:#c0c0c0; }
  .lb-rank.top3 { color:#cd7f32; }
  .lb-avatar { width:36px; height:36px; border-radius:50%; background:var(--card2);
               object-fit:cover; flex-shrink:0; }
  .lb-name  { font-size:14px; font-weight:600; flex:1; }
  .lb-pts   { font-size:16px; font-weight:700; color:var(--acc); }
  .lb-sub   { font-size:11px; color:var(--mut); }

  /* ── BRACKET (placeholder) ── */
  .bracket-phase { margin-bottom:24px; }
  .bracket-phase-title { font-size:14px; font-weight:700; color:var(--acc);
                         margin-bottom:8px; text-transform:uppercase;
                         letter-spacing:.5px; }
  .bracket-match { background:var(--card); border-radius:10px; padding:10px 14px;
                   margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .bracket-team { flex:1; font-size:13px; font-weight:600; }
  .bracket-score { font-size:15px; font-weight:700; color:var(--acc);
                   min-width:36px; text-align:center; }

  /* ── LOGIN SCREEN ── */
  .login-screen { max-width:400px; margin:60px auto; padding:32px;
                  background:var(--card); border-radius:20px; text-align:center;
                  border:1px solid rgba(245,183,49,.2); }
  .login-icon  { font-size:56px; margin-bottom:12px; }
  .login-title { font-size:22px; font-weight:700; color:var(--acc); margin-bottom:8px; }
  .login-sub   { font-size:14px; color:var(--mut); margin-bottom:24px; line-height:1.5; }
  .google-btn  { display:flex; align-items:center; justify-content:center; gap:10px;
                 background:#fff; color:#3c4043; border:none; border-radius:10px;
                 font-size:15px; font-weight:600; cursor:pointer; padding:12px 24px;
                 width:100%; transition:all var(--tr); min-height:48px; }
  .google-btn:hover { background:#f5f5f5; transform:translateY(-1px);
                      box-shadow:0 4px 20px rgba(0,0,0,.3); }

  /* ── ADMIN ── */
  .admin-match { display:grid; grid-template-columns:1fr auto 1fr; align-items:center;
                 gap:8px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.07); }
  .admin-score-inp { width:48px; height:36px; background:var(--card2);
                     border:1px solid rgba(255,255,255,.15); border-radius:8px;
                     color:var(--txt); font-size:16px; text-align:center; outline:none; }
  .admin-save-btn { font-size:12px; padding:5px 10px; border-radius:7px; }

  /* ── PHASE FILTER ── */
  .phase-filter { display:flex; gap:6px; overflow-x:auto; margin-bottom:16px;
                  padding-bottom:4px; scrollbar-width:none; }
  .phase-filter::-webkit-scrollbar { display:none; }
  .phase-chip { background:rgba(255,255,255,.07); border:1px solid transparent;
                border-radius:20px; color:var(--mut); cursor:pointer; font-size:12px;
                font-weight:600; padding:5px 12px; white-space:nowrap;
                transition:all var(--tr); }
  .phase-chip:hover  { color:var(--txt); border-color:rgba(255,255,255,.2); }
  .phase-chip.active { background:rgba(245,183,49,.15); color:var(--acc);
                       border-color:var(--acc); }

  /* ── UTILS ── */
  .spinner { width:24px; height:24px; border:3px solid rgba(255,255,255,.1);
             border-top-color:var(--acc); border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .center { display:flex; align-items:center; justify-content:center; }
  .mt16 { margin-top:16px; }
  .txt-mut { color:var(--mut); font-size:13px; }
  .txt-acc { color:var(--acc); font-weight:700; }
  .badge-ok  { background:rgba(64,212,144,.15); color:var(--ok);
               border-radius:6px; padding:2px 8px; font-size:12px; }
  .badge-err { background:rgba(255,107,138,.15); color:var(--err);
               border-radius:6px; padding:2px 8px; font-size:12px; }
  .home-hero { text-align:center; padding:40px 16px 24px; }
  .home-hero h1 { font-size:28px; font-weight:800; color:var(--acc); margin-bottom:6px; }
  .home-hero p  { font-size:15px; color:var(--mut); }
  .rules-grid { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }
  .rule-card { background:var(--card); border-radius:12px; padding:16px;
               border:1px solid rgba(255,255,255,.07); }
  .rule-pts { font-size:28px; font-weight:800; color:var(--acc); }
  .rule-lbl { font-size:13px; color:var(--mut); margin-top:4px; }
  @media(max-width:600px){
    .hdr-name-u { display:none; }
    .match-teams { flex-wrap:wrap; gap:4px; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('es-ES', { weekday:'short', month:'short', day:'numeric',
      hour:'2-digit', minute:'2-digit' })
  : '—';

const isBeforeDeadline = deadline => new Date() < new Date(deadline);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function LangSelector({ lang, setLang }) {
  return (
    <div className="lang-sel" role="group" aria-label="Language selector">
      {[{code:'es',flag:'🇪🇸'},{code:'en',flag:'🇬🇧'},{code:'pt',flag:'🇧🇷'}].map(l => (
        <button key={l.code}
          className={`lang-btn ${lang === l.code ? 'active' : ''}`}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}>
          {l.flag} {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return <div className="center" style={{padding:'40px'}}><div className="spinner"/></div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME / RULES
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ t }) {
  return (
    <div className="page">
      <div className="home-hero">
        <h1>⚽ Mundial 2026 · Porra de Marcadores</h1>
        <p>USA · México · Canadá · 104 partidos</p>
      </div>
      <div className="card">
        <div style={{fontSize:18,fontWeight:700,marginBottom:12}}>🎯 Sistema de puntuación</div>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-pts">+0.5</div>
            <div className="rule-lbl">Goles de un equipo acertados</div>
          </div>
          <div className="rule-card">
            <div className="rule-pts">+1</div>
            <div className="rule-lbl">Resultado correcto (V/E/D)</div>
          </div>
          <div className="rule-card">
            <div className="rule-pts">+3</div>
            <div className="rule-lbl">Marcador exacto (acumula todo)</div>
          </div>
        </div>
      </div>
      <div className="card mt16">
        <div style={{fontSize:16,fontWeight:700,marginBottom:10}}>📅 Deadlines por jornada</div>
        <p className="txt-mut">Las predicciones de cada jornada cierran automáticamente
          antes del primer partido de esa jornada. Una vez cerrado el plazo, no se pueden
          modificar los pronósticos.</p>
      </div>
      <div className="card mt16">
        <div style={{fontSize:16,fontWeight:700,marginBottom:10}}>📊 Desempate</div>
        <ol style={{paddingLeft:18,lineHeight:2,color:'var(--mut)',fontSize:14}}>
          <li>Mayor número de clasificaciones de grupo correctas</li>
          <li>Mayor puntuación en partidos del equipo español</li>
          <li>Predicción en directo (si aplica)</li>
        </ol>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: PREDICTIONS (user must be logged in)
// ─────────────────────────────────────────────────────────────────────────────
function PredictionsPage({ t, user, matches, predictions, onSave }) {
  const [localPreds, setLocalPreds] = useState({});
  const [saving, setSaving]         = useState(null);   // matchday being saved
  const [savedMd, setSavedMd]       = useState(null);
  const [phase, setPhase]           = useState('all');

  // Inicializa inputs locales con predicciones existentes
  useEffect(() => {
    const init = {};
    predictions.forEach(p => {
      init[p.match_id] = { h: String(p.home_goals), a: String(p.away_goals) };
    });
    setLocalPreds(init);
  }, [predictions]);

  if (!user) return (
    <div className="page">
      <div className="login-screen">
        <div className="login-icon">🔐</div>
        <div className="login-title">Inicia sesión</div>
        <div className="login-sub">{t.login_required}</div>
      </div>
    </div>
  );

  // Agrupar partidos por jornada
  const matchdayGroups = {};
  matches.forEach(m => {
    if (phase !== 'all' && m.phase !== phase) return;
    if (!matchdayGroups[m.matchday]) matchdayGroups[m.matchday] = [];
    matchdayGroups[m.matchday].push(m);
  });

  const setPred = (matchId, side, val) => {
    const n = val.replace(/\D/g, '').slice(0,2);
    setLocalPreds(p => ({ ...p, [matchId]: { ...p[matchId], [side]: n } }));
  };

  const handleSaveMatchday = async (matchday, mdMatches) => {
    setSaving(matchday);
    const rows = mdMatches
      .filter(m => {
        const p = localPreds[m.id];
        return p && p.h !== '' && p.a !== '';
      })
      .map(m => ({
        user_id:    user.id,
        match_id:   m.id,
        home_goals: parseInt(localPreds[m.id].h),
        away_goals: parseInt(localPreds[m.id].a),
      }));

    const { error } = await supabase
      .from('predictions')
      .upsert(rows, { onConflict: 'user_id,match_id' });

    setSaving(null);
    if (!error) {
      setSavedMd(matchday);
      onSave();
      setTimeout(() => setSavedMd(null), 3000);
    }
  };

  const phasesInView = [...new Set(matches.map(m => m.phase))];

  return (
    <div className="page">
      <div className="page-title">🎯 {t.predict_title}</div>

      {/* Phase filter */}
      <div className="phase-filter">
        <button className={`phase-chip ${phase === 'all' ? 'active' : ''}`}
          onClick={() => setPhase('all')}>{t.all_phases}</button>
        {PHASES.filter(p => phasesInView.includes(p)).map(p => (
          <button key={p} className={`phase-chip ${phase === p ? 'active' : ''}`}
            onClick={() => setPhase(p)}>{PHASE_LABELS[p]}</button>
        ))}
      </div>

      {Object.entries(matchdayGroups).map(([md, mdMatches]) => {
        const deadline = mdMatches[0]?.deadline;
        const open     = isBeforeDeadline(deadline);
        return (
          <div key={md}>
            <div className="matchday-hdr">
              <span className="matchday-title">{t.matchday} {md}</span>
              <span className={`deadline-badge ${open ? 'open' : 'closed'}`}>
                {open ? `${t.open_until}: ${fmtDate(deadline)}` : t.deadline_passed}
              </span>
            </div>

            {mdMatches.map(m => {
              const pred    = localPreds[m.id] || { h:'', a:'' };
              const hasPred = pred.h !== '' && pred.a !== '';
              const pts     = m.status === 'finished' && hasPred
                ? calcScore(parseInt(pred.h), parseInt(pred.a), m.home_goals, m.away_goals)
                : null;
              const ptsClass = pts === 3 ? 'exact' : pts >= 1 ? 'result' : pts > 0 ? 'goals' : 'zero';

              return (
                <div key={m.id}
                  className={`match-card ${m.status === 'finished' ? 'has-result' : ''} ${!open ? 'deadline-passed' : ''}`}>
                  <div className="match-teams">
                    <div className="team-name">
                      <span className="team-flag">{flag(m.home_team)}</span>
                      {m.home_team || '?'}
                    </div>
                    {m.status === 'finished'
                      ? <div className="score-result">{m.home_goals}–{m.away_goals}</div>
                      : <div className="score-vs">{t.match_vs}</div>
                    }
                    <div className="team-name" style={{flexDirection:'row-reverse'}}>
                      {m.away_team || '?'}
                      <span className="team-flag">{flag(m.away_team)}</span>
                    </div>
                  </div>

                  {/* Prediction inputs */}
                  <div className="pred-row">
                    <input className="score-input" type="text" inputMode="numeric"
                      value={pred.h} disabled={!open}
                      onChange={e => setPred(m.id, 'h', e.target.value)}
                      placeholder="0" aria-label={`Goles ${m.home_team}`} />
                    <span className="pred-dash">–</span>
                    <input className="score-input" type="text" inputMode="numeric"
                      value={pred.a} disabled={!open}
                      onChange={e => setPred(m.id, 'a', e.target.value)}
                      placeholder="0" aria-label={`Goles ${m.away_team}`} />
                    {pts !== null && (
                      <span className={`pred-pts ${ptsClass}`}>
                        +{pts} {t.pts}
                      </span>
                    )}
                  </div>

                  <div className="match-meta">
                    <span>📅 {fmtDate(m.match_date)}</span>
                    <span>🏟️ {m.stadium}</span>
                    <span className="txt-mut">{PHASE_LABELS[m.phase]}{m.group_name ? ` · Grupo ${m.group_name}` : ''}</span>
                  </div>
                </div>
              );
            })}

            {open && (
              <div className="save-matchday">
                <button className="btn-acc"
                  disabled={saving === parseInt(md)}
                  onClick={() => handleSaveMatchday(parseInt(md), mdMatches)}>
                  {saving === parseInt(md)
                    ? t.saving
                    : savedMd === parseInt(md)
                      ? t.saved
                      : `💾 ${t.save_btn} Jornada ${md}`}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: RESULTS (public — shows all matches + official scores)
// ─────────────────────────────────────────────────────────────────────────────
function ResultsPage({ t, matches }) {
  const [phase, setPhase] = useState('all');
  const filtered = phase === 'all' ? matches : matches.filter(m => m.phase === phase);

  return (
    <div className="page">
      <div className="page-title">📊 {t.results_title}</div>
      <div className="phase-filter">
        <button className={`phase-chip ${phase === 'all' ? 'active' : ''}`}
          onClick={() => setPhase('all')}>{t.all_phases}</button>
        {PHASES.map(p => (
          <button key={p} className={`phase-chip ${phase === p ? 'active' : ''}`}
            onClick={() => setPhase(p)}>{PHASE_LABELS[p]}</button>
        ))}
      </div>
      {filtered.map(m => (
        <div key={m.id} className={`match-card ${m.status === 'finished' ? 'has-result' : ''}`}>
          <div className="match-teams">
            <div className="team-name">
              <span className="team-flag">{flag(m.home_team)}</span>
              {m.home_team || '?'}
            </div>
            {m.status === 'finished'
              ? <div className="score-result">{m.home_goals}–{m.away_goals}</div>
              : <div className="score-vs">{t.match_vs}</div>
            }
            <div className="team-name" style={{flexDirection:'row-reverse'}}>
              {m.away_team || '?'}
              <span className="team-flag">{flag(m.away_team)}</span>
            </div>
          </div>
          <div className="match-meta">
            <span>📅 {fmtDate(m.match_date)}</span>
            <span>🏟️ {m.stadium}</span>
            {m.status === 'finished'
              ? <span className="badge-ok">Finalizado</span>
              : <span className="badge-err">Pendiente</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────
function LeaderboardPage({ t, user }) {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('leaderboard').select('*').then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const rankClass = r => r === 1 ? 'top1' : r === 2 ? 'top2' : r === 3 ? 'top3' : '';
  const medal     = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r;

  return (
    <div className="page">
      <div className="page-title">🏆 {t.ranking_title}</div>
      <div className="card">
        {rows.map((row, i) => {
          const rank = i + 1;
          const isMe = user?.id === row.user_id;
          return (
            <div key={row.user_id}
              className="lb-row"
              style={isMe ? { background:'rgba(245,183,49,.07)', borderRadius:8, padding:'12px 8px' } : {}}>
              <div className={`lb-rank ${rankClass(rank)}`}>{medal(rank)}</div>
              {row.avatar_url
                ? <img className="lb-avatar" src={row.avatar_url} alt={row.display_name} />
                : <div className="lb-avatar center" style={{fontSize:18}}>👤</div>
              }
              <div style={{flex:1}}>
                <div className="lb-name">{row.display_name || row.email?.split('@')[0]}</div>
                <div className="lb-sub">
                  ⚽ {row.pts_goals} · ✅ {row.pts_result} · 🎯 {row.pts_exact} · {row.predictions_made} predicciones
                </div>
              </div>
              <div>
                <div className="lb-pts">{row.total_pts} {t.pts}</div>
                {isMe && <div style={{fontSize:11,color:'var(--info)',textAlign:'right'}}>← tú</div>}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="txt-mut">{t.no_predictions}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: BRACKET (knockout phases visual)
// ─────────────────────────────────────────────────────────────────────────────
function BracketPage({ t, matches }) {
  const knockoutPhases = ['r32','r16','qf','sf','3rd','final'];
  return (
    <div className="page">
      <div className="page-title">🪄 {t.bracket_title}</div>
      {knockoutPhases.map(ph => {
        const phMatches = matches.filter(m => m.phase === ph);
        if (!phMatches.length) return null;
        return (
          <div key={ph} className="bracket-phase">
            <div className="bracket-phase-title">{PHASE_LABELS[ph]}</div>
            {phMatches.map(m => (
              <div key={m.id} className="bracket-match">
                <span className="bracket-team">
                  {flag(m.home_team)} {m.home_team || '?'}
                </span>
                <span className="bracket-score">
                  {m.status === 'finished' ? `${m.home_goals}–${m.away_goals}` : '– : –'}
                </span>
                <span className="bracket-team" style={{textAlign:'right'}}>
                  {m.away_team || '?'} {flag(m.away_team)}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: ADMIN
// ─────────────────────────────────────────────────────────────────────────────
function AdminPage({ t, matches, onMatchUpdated }) {
  const [results, setResults] = useState({});
  const [saved, setSaved]     = useState({});
  const [phase, setPhase]     = useState('all');

  const setGoals = (matchId, side, val) => {
    const n = val.replace(/\D/g,'').slice(0,2);
    setResults(r => ({ ...r, [matchId]: { ...r[matchId], [side]: n } }));
  };

  const saveResult = async (match) => {
    const r = results[match.id] || {};
    if (r.h === undefined || r.a === undefined) return;
    const { error } = await supabase.from('matches').update({
      home_goals: parseInt(r.h),
      away_goals: parseInt(r.a),
      status: 'finished'
    }).eq('id', match.id);
    if (!error) {
      setSaved(s => ({ ...s, [match.id]: true }));
      onMatchUpdated();
      setTimeout(() => setSaved(s => ({ ...s, [match.id]: false })), 2500);
    }
  };

  const filtered = phase === 'all' ? matches : matches.filter(m => m.phase === phase);

  return (
    <div className="page">
      <div className="page-title">⚙️ {t.admin_panel}</div>
      <div className="phase-filter">
        <button className={`phase-chip ${phase === 'all' ? 'active' : ''}`}
          onClick={() => setPhase('all')}>{t.all_phases}</button>
        {PHASES.map(p => (
          <button key={p} className={`phase-chip ${phase === p ? 'active' : ''}`}
            onClick={() => setPhase(p)}>{PHASE_LABELS[p]}</button>
        ))}
      </div>
      <div className="card">
        {filtered.map(m => (
          <div key={m.id} className="admin-match">
            <div style={{fontSize:13}}>
              <div style={{fontWeight:600}}>{flag(m.home_team)} {m.home_team || '?'}</div>
              <div style={{fontWeight:600}}>{flag(m.away_team)} {m.away_team || '?'}</div>
              <div className="txt-mut" style={{fontSize:11}}>P{m.match_number} · {PHASE_LABELS[m.phase]}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <input className="admin-score-inp"
                value={results[m.id]?.h ?? (m.home_goals ?? '')}
                onChange={e => setGoals(m.id,'h',e.target.value)} placeholder="0" />
              <span style={{color:'var(--mut)'}}>–</span>
              <input className="admin-score-inp"
                value={results[m.id]?.a ?? (m.away_goals ?? '')}
                onChange={e => setGoals(m.id,'a',e.target.value)} placeholder="0" />
            </div>
            <button className="btn-acc btn-sm admin-save-btn"
              onClick={() => saveResult(m)}>
              {saved[m.id] ? t.admin_saved : t.admin_save}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [lang, setLang]         = useState(() => localStorage.getItem('pml') || 'es');
  const [tab, setTab]           = useState('home');
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [matches, setMatches]   = useState([]);
  const [predictions, setPreds] = useState([]);
  const [adminMode, setAdmin]   = useState(false);
  const [adminBuf, setAdminBuf] = useState('');

  const t = LANGS[lang];

  // Persist lang
  useEffect(() => { localStorage.setItem('pml', lang); }, [lang]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load matches
  const loadMatches = useCallback(async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('match_number', { ascending: true });
    setMatches(data || []);
  }, []);

  // Load user predictions
  const loadPredictions = useCallback(async () => {
    if (!user) { setPreds([]); return; }
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);
    setPreds(data || []);
  }, [user]);

  useEffect(() => { loadMatches(); }, [loadMatches]);
  useEffect(() => { loadPredictions(); }, [loadPredictions]);

  // Google OAuth
  const signIn = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  const signOut = () => supabase.auth.signOut();

  // Admin unlock (footer triple-click)
  const handleAdminKey = (char) => {
    const next = (adminBuf + char).slice(-ADMIN_PIN.length);
    setAdminBuf(next);
    if (next === ADMIN_PIN) { setAdmin(true); setTab('admin'); }
  };

  const navTabs = [
    { id:'home',     l:t.nav_home },
    { id:'predict',  l:t.nav_predict },
    { id:'results',  l:t.nav_results },
    { id:'ranking',  l:t.nav_ranking },
    { id:'bracket',  l:t.nav_bracket },
    ...(adminMode ? [{ id:'admin', l:'⚙️ Admin' }] : []),
  ];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <Spinner />
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {/* ── HEADER ── */}
      <header className="hdr">
        <div className="hdr-top">
          <LangSelector lang={lang} setLang={setLang} />
          <span className="hdr-icon">⚽</span>
          <div>
            <div className="hdr-name">Mundial 2026 · Marcadores</div>
            <div className="hdr-sub">USA · México · Canadá</div>
          </div>
          <div className="hdr-user">
            {user ? (
              <>
                {user.user_metadata?.avatar_url
                  ? <img className="hdr-avatar" src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name} />
                  : <span style={{fontSize:22}}>👤</span>
                }
                <span className="hdr-name-u">{user.user_metadata?.full_name || user.email}</span>
                <button className="btn-ghost btn-sm" onClick={signOut}>{t.logout_btn}</button>
              </>
            ) : (
              <button className="google-btn" onClick={signIn} style={{width:'auto',padding:'8px 16px',fontSize:13}}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                {t.login_btn}
              </button>
            )}
          </div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {navTabs.map(nt => (
            <button key={nt.id}
              className={`nav-btn ${tab === nt.id ? 'on' : ''}`}
              onClick={() => setTab(nt.id)}>
              {nt.l}
            </button>
          ))}
        </nav>
      </header>

      {/* ── PAGES ── */}
      {tab === 'home'    && <HomePage    t={t} />}
      {tab === 'predict' && <PredictionsPage t={t} user={user} matches={matches}
                              predictions={predictions} onSave={loadPredictions} />}
      {tab === 'results' && <ResultsPage t={t} matches={matches} />}
      {tab === 'ranking' && <LeaderboardPage t={t} user={user} />}
      {tab === 'bracket' && <BracketPage t={t} matches={matches} />}
      {tab === 'admin'   && <AdminPage   t={t} matches={matches}
                              onMatchUpdated={() => { loadMatches(); loadPredictions(); }} />}

      {/* ── FOOTER (admin unlock) ── */}
      <footer style={{textAlign:'center',padding:'24px 16px',color:'var(--mut)',fontSize:12}}>
        {'Porra Marcadores · Mundial 2026'.split('').map((c, i) => (
          <span key={i} onClick={() => handleAdminKey(c)} style={{cursor:'default'}}>{c}</span>
        ))}
        {' '}
        <span onClick={() => handleAdminKey('🔐')} style={{cursor:'pointer',opacity:.3}}>🔐</span>
      </footer>
    </>
  );
}

// ─── ENTRY ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

export default App;
