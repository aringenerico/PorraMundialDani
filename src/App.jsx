import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PIN = 'Arin2026!';
const PHASES = ['group','r32','r16','qf','sf','3rd','final'];
const PHASE_LABELS = {
  group:'Fase de Grupos', r32:'Ronda de 32', r16:'Octavos',
  qf:'Cuartos de Final', sf:'Semifinales', '3rd':'3er Puesto', final:'Final'
};

// ─── FLAGS ────────────────────────────────────────────────────────────────────
const FLAGS = {
  "Algeria":"🇩🇿","Argentina":"🇦🇷","Australia":"🇦🇺","Austria":"🇦🇹",
  "Belgium":"🇧🇪","Bosnia and Herzegovina":"🇧🇦","Brazil":"🇧🇷",
  "Cabo Verde":"🇨🇻","Canada":"🇨🇦","Colombia":"🇨🇴","Croatia":"🇭🇷",
  "Curaçao":"🇨🇼","Czech Republic":"🇨🇿",
  "DR Congo":"🇨🇩","Ecuador":"🇪🇨","Egypt":"🇪🇬","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "France":"🇫🇷","Germany":"🇩🇪","Ghana":"🇬🇭","Haiti":"🇭🇹",
  "Iran":"🇮🇷","Iraq":"🇮🇶","Ivory Coast":"🇨🇮",
  "Japan":"🇯🇵","Jordan":"🇯🇴",
  "Mexico":"🇲🇽","Morocco":"🇲🇦",
  "Netherlands":"🇳🇱","New Zealand":"🇳🇿","Norway":"🇳🇴",
  "Panama":"🇵🇦","Paraguay":"🇵🇾","Portugal":"🇵🇹",
  "Qatar":"🇶🇦","Saudi Arabia":"🇸🇦","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Senegal":"🇸🇳",
  "South Africa":"🇿🇦","South Korea":"🇰🇷","Spain":"🇪🇸","Sweden":"🇸🇪",
  "Switzerland":"🇨🇭","Tunisia":"🇹🇳","Turkey":"🇹🇷",
  "Uruguay":"🇺🇾","USA":"🇺🇸","Uzbekistan":"🇺🇿",
};
const flag = t => FLAGS[t] || '🏳️';

// ─── SCORING ──────────────────────────────────────────────────────────────────
const calcScore = (predH, predA, realH, realA) => {
  if (realH === null || realA === null) return null;
  const gh   = predH === realH ? 0.5 : 0;
  const ga   = predA === realA ? 0.5 : 0;
  const rp   = predH > predA ? 'H' : predH < predA ? 'A' : 'D';
  const rr   = realH > realA ? 'H' : realH < realA ? 'A' : 'D';
  const res  = rp === rr ? 1 : 0;
  const exact = predH === realH && predA === realA ? 1 : 0;
  return gh + ga + res + exact;
};

// ─── GROUP STANDINGS ─────────────────────────────────────────────────────────
function computeAllStandings(matches) {
  // Collect all teams per group from the fixture (not just finished matches)
  const groups = {};
  matches.filter(m => m.phase === 'group' && m.home_team && m.away_team).forEach(m => {
    const g = m.group_name;
    if (!groups[g]) groups[g] = {};
    const mk = t => groups[g][t] || (groups[g][t] = {pj:0,w:0,d:0,l:0,gf:0,ga:0});
    mk(m.home_team); mk(m.away_team);
    if (m.status === 'finished' && m.home_goals !== null && m.away_goals !== null) {
      const h = groups[g][m.home_team], a = groups[g][m.away_team];
      h.pj++; h.gf += m.home_goals; h.ga += m.away_goals;
      a.pj++; a.gf += m.away_goals; a.ga += m.home_goals;
      if      (m.home_goals > m.away_goals) { h.w++; a.l++; }
      else if (m.home_goals < m.away_goals) { a.w++; h.l++; }
      else                                  { h.d++; a.d++; }
    }
  });
  const result = {};
  Object.entries(groups).sort(([a],[b]) => a.localeCompare(b)).forEach(([g, teams]) => {
    result[g] = Object.entries(teams)
      .map(([team, s]) => ({
        team, pj:s.pj, w:s.w, d:s.d, l:s.l,
        gf:s.gf, ga:s.ga, gd:s.gf-s.ga, pts:s.w*3+s.d
      }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  });
  return result;
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const LANGS = {
  es: {
    nav_home:'Inicio', nav_predict:'Mis Pronósticos', nav_results:'Resultados',
    nav_ranking:'Clasificación', nav_groups:'Grupos', nav_bracket:'Cuadro',
    logout_btn:'Cerrar sesión',
    predict_title:'Mis Pronósticos', results_title:'Resultados',
    ranking_title:'Clasificación Global', bracket_title:'Cuadro Eliminatorio',
    save_btn:'Guardar', saving:'Guardando…', saved:'✅ Guardado',
    deadline_passed:'Plazo cerrado', no_predictions:'Sin predicciones aún',
    match_vs:'vs', pts:'pts',
    admin_panel:'Panel Admin', admin_save:'Guardar resultado', admin_saved:'Guardado ✓',
    login_required:'Inicia sesión para hacer tus pronósticos',
    matchday:'Jornada', all_phases:'Todas las fases',
    open_until:'Plazo hasta',
    // Auth
    auth_login:'Iniciar sesión', auth_register:'Crear cuenta',
    auth_email:'Email', auth_password:'Contraseña',
    auth_password2:'Repite la contraseña', auth_name:'Tu nombre',
    auth_name_hint:'Cómo aparecerás en la clasificación',
    btn_login:'Entrar', btn_register:'Crear cuenta',
    btn_sending:'Enviando…',
    auth_no_account:'¿No tienes cuenta?', auth_have_account:'¿Ya tienes cuenta?',
    auth_forgot:'¿Olvidaste la contraseña?',
    auth_reset_sent:'✅ Email enviado. Revisa tu bandeja de entrada.',
    auth_reset_title:'Recuperar contraseña',
    auth_reset_btn:'Enviar enlace',
    auth_back:'← Volver',
    err_email_taken:'Este email ya está registrado.',
    err_wrong_pass:'Email o contraseña incorrectos.',
    err_weak_pass:'La contraseña debe tener al least 6 caracteres.',
    err_pass_match:'Las contraseñas no coinciden.',
    err_general:'Algo ha ido mal. Inténtalo de nuevo.',
    verify_title:'¡Cuenta creada! 🎉',
    verify_msg:'Te hemos enviado un email de verificación a',
    verify_hint:'Haz clic en el enlace del email para activar tu cuenta y luego vuelve aquí.',
    verify_resend:'Reenviar email',
    verify_resent:'✅ Email reenviado',
    groups_title:'Clasificaciones de Grupo',
    update_bracket:'🔄 Actualizar Cuadro',
    updating_bracket:'Actualizando…',
    bracket_updated:'✅ Cuadro actualizado',
  },
  en: {
    nav_home:'Home', nav_predict:'My Predictions', nav_results:'Results',
    nav_ranking:'Leaderboard', nav_groups:'Groups', nav_bracket:'Bracket',
    logout_btn:'Sign out',
    predict_title:'My Predictions', results_title:'Results',
    ranking_title:'Global Leaderboard', bracket_title:'Knockout Bracket',
    save_btn:'Save', saving:'Saving…', saved:'✅ Saved',
    deadline_passed:'Deadline passed', no_predictions:'No predictions yet',
    match_vs:'vs', pts:'pts',
    admin_panel:'Admin Panel', admin_save:'Save result', admin_saved:'Saved ✓',
    login_required:'Sign in to submit your predictions',
    matchday:'Matchday', all_phases:'All phases',
    open_until:'Open until',
    auth_login:'Sign in', auth_register:'Create account',
    auth_email:'Email', auth_password:'Password',
    auth_password2:'Repeat password', auth_name:'Your name',
    auth_name_hint:'How you\'ll appear in the leaderboard',
    btn_login:'Sign in', btn_register:'Create account',
    btn_sending:'Sending…',
    auth_no_account:'Don\'t have an account?', auth_have_account:'Already have an account?',
    auth_forgot:'Forgot your password?',
    auth_reset_sent:'✅ Email sent. Check your inbox.',
    auth_reset_title:'Reset password',
    auth_reset_btn:'Send link',
    auth_back:'← Back',
    err_email_taken:'This email is already registered.',
    err_wrong_pass:'Wrong email or password.',
    err_weak_pass:'Password must be at least 6 characters.',
    err_pass_match:'Passwords do not match.',
    err_general:'Something went wrong. Please try again.',
    verify_title:'Account created! 🎉',
    verify_msg:'We sent a verification email to',
    verify_hint:'Click the link in the email to activate your account, then come back here.',
    verify_resend:'Resend email',
    verify_resent:'✅ Email resent',
    groups_title:'Group Standings',
    update_bracket:'🔄 Update Bracket',
    updating_bracket:'Updating…',
    bracket_updated:'✅ Bracket updated',
  },
  pt: {
    nav_home:'Início', nav_predict:'Meus Palpites', nav_results:'Resultados',
    nav_ranking:'Classificação', nav_groups:'Grupos', nav_bracket:'Chaveamento',
    logout_btn:'Sair',
    predict_title:'Meus Palpites', results_title:'Resultados',
    ranking_title:'Classificação Geral', bracket_title:'Mata-Mata',
    save_btn:'Salvar', saving:'Salvando…', saved:'✅ Salvo',
    deadline_passed:'Prazo encerrado', no_predictions:'Sem palpites ainda',
    match_vs:'vs', pts:'pts',
    admin_panel:'Painel Admin', admin_save:'Salvar resultado', admin_saved:'Salvo ✓',
    login_required:'Entre para enviar seus palpites',
    matchday:'Rodada', all_phases:'Todas as fases',
    open_until:'Aberto até',
    auth_login:'Entrar', auth_register:'Criar conta',
    auth_email:'Email', auth_password:'Senha',
    auth_password2:'Repita a senha', auth_name:'Seu nome',
    auth_name_hint:'Como aparecerá na classificação',
    btn_login:'Entrar', btn_register:'Criar conta',
    btn_sending:'Enviando…',
    auth_no_account:'Não tem conta?', auth_have_account:'Já tem conta?',
    auth_forgot:'Esqueceu a senha?',
    auth_reset_sent:'✅ Email enviado. Verifique sua caixa de entrada.',
    auth_reset_title:'Recuperar senha',
    auth_reset_btn:'Enviar link',
    auth_back:'← Voltar',
    err_email_taken:'Este email já está registrado.',
    err_wrong_pass:'Email ou senha incorretos.',
    err_weak_pass:'A senha deve ter pelo menos 6 caracteres.',
    err_pass_match:'As senhas não coincidem.',
    err_general:'Algo deu errado. Tente novamente.',
    verify_title:'Conta criada! 🎉',
    verify_msg:'Enviamos um email de verificação para',
    verify_hint:'Clique no link do email para ativar sua conta e volte aqui.',
    verify_resend:'Reenviar email',
    verify_resent:'✅ Email reenviado',
    groups_title:'Classificações dos Grupos',
    update_bracket:'🔄 Atualizar Chaveamento',
    updating_bracket:'Atualizando…',
    bracket_updated:'✅ Chaveamento atualizado',
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
  .hdr-top { display:flex; align-items:center; gap:12px; padding:10px 0 6px; flex-wrap:wrap; }
  .hdr-icon { font-size:28px; }
  .hdr-name { font-size:18px; font-weight:700; color:var(--acc); letter-spacing:.5px; }
  .hdr-sub  { font-size:12px; color:var(--mut); }
  .hdr-user { margin-left:auto; display:flex; align-items:center; gap:8px; }
  .hdr-name-u { font-size:13px; color:var(--txt); max-width:160px;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* ── NAV ── */
  .nav { display:flex; gap:4px; overflow-x:auto; padding:0 0 8px; scrollbar-width:none; }
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
  .lang-btn.active { color:var(--acc); border-color:var(--acc); background:rgba(245,183,49,.1); }

  /* ── PAGE ── */
  .page { max-width:900px; margin:0 auto; padding:16px; }
  .page-title { font-size:22px; font-weight:700; margin-bottom:16px;
                display:flex; align-items:center; gap:8px; }

  /* ── CARD ── */
  .card { background:var(--card); border-radius:var(--rad); padding:16px;
          border:1px solid rgba(255,255,255,.07); margin-bottom:12px; }

  /* ── BUTTONS ── */
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
  .btn-link { background:none; border:none; color:var(--info); cursor:pointer;
              font-size:13px; padding:0; text-decoration:underline; }
  .btn-link:hover { color:var(--txt); }

  /* ── AUTH FORM ── */
  .auth-wrap { max-width:420px; margin:40px auto; padding:16px; }
  .auth-card { background:var(--card); border-radius:20px; padding:32px;
               border:1px solid rgba(245,183,49,.2); }
  .auth-icon  { font-size:48px; text-align:center; margin-bottom:12px; }
  .auth-title { font-size:22px; font-weight:700; color:var(--acc);
                text-align:center; margin-bottom:6px; }
  .auth-sub   { font-size:14px; color:var(--mut); text-align:center; margin-bottom:24px; }
  .auth-tabs  { display:flex; gap:0; margin-bottom:24px; border-radius:10px;
                overflow:hidden; border:1px solid rgba(255,255,255,.1); }
  .auth-tab   { flex:1; padding:10px; background:transparent; border:none;
                color:var(--mut); cursor:pointer; font-size:14px; font-weight:600;
                transition:all var(--tr); }
  .auth-tab.active { background:var(--acc); color:#0a1628; }
  .field      { margin-bottom:16px; }
  .field label { display:block; font-size:13px; color:var(--mut); margin-bottom:6px; }
  .field input { width:100%; padding:12px 14px; background:var(--card2);
                 border:1px solid rgba(255,255,255,.12); border-radius:10px;
                 color:var(--txt); font-size:15px; outline:none;
                 transition:border-color var(--tr); }
  .field input:focus { border-color:var(--acc); }
  .field input::placeholder { color:var(--mut); }
  .field-hint { font-size:11px; color:var(--mut); margin-top:4px; }
  .auth-err   { background:rgba(255,107,138,.12); border:1px solid rgba(255,107,138,.3);
                border-radius:8px; color:var(--err); font-size:13px;
                padding:10px 14px; margin-bottom:16px; }
  .auth-ok    { background:rgba(64,212,144,.12); border:1px solid rgba(64,212,144,.3);
                border-radius:8px; color:var(--ok); font-size:13px;
                padding:10px 14px; margin-bottom:16px; }
  .auth-footer { text-align:center; margin-top:16px; font-size:13px; color:var(--mut); }

  /* ── VERIFY SCREEN ── */
  .verify-card { background:var(--card); border-radius:20px; padding:32px;
                 border:1px solid rgba(64,212,144,.3); text-align:center; }
  .verify-icon  { font-size:56px; margin-bottom:12px; }
  .verify-title { font-size:22px; font-weight:700; color:var(--ok); margin-bottom:8px; }
  .verify-email { font-weight:700; color:var(--acc); display:block; margin:8px 0; }
  .verify-hint  { font-size:14px; color:var(--mut); line-height:1.6; }

  /* ── MATCH CARD ── */
  .match-card { background:var(--card); border:1px solid rgba(255,255,255,.07);
                border-radius:var(--rad); padding:14px 16px; margin-bottom:10px;
                transition:border-color var(--tr); }
  .match-card.has-result { border-left:3px solid var(--ok); }
  .match-card.deadline-passed { opacity:.75; }
  .match-teams { display:flex; align-items:center; gap:8px; justify-content:space-between; }
  .team-name { font-size:14px; font-weight:600; display:flex; align-items:center; gap:6px; }
  .team-flag { font-size:20px; }
  .score-vs     { color:var(--mut); font-size:13px; flex-shrink:0; }
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

  /* ── MATCHDAY ── */
  .matchday-hdr { display:flex; align-items:center; justify-content:space-between;
                  margin:20px 0 10px; }
  .matchday-title { font-size:16px; font-weight:700; color:var(--acc); }
  .deadline-badge { font-size:11px; padding:3px 8px; border-radius:20px; font-weight:600; }
  .deadline-badge.open   { background:rgba(64,212,144,.15); color:var(--ok); }
  .deadline-badge.closed { background:rgba(255,107,138,.15); color:var(--err); }
  .save-matchday { display:flex; justify-content:flex-end; margin-top:8px; }

  /* ── LEADERBOARD ── */
  .lb-row { display:flex; align-items:center; gap:12px; padding:12px 0;
            border-bottom:1px solid rgba(255,255,255,.07); }
  .lb-rank { font-size:18px; font-weight:700; color:var(--mut); min-width:32px; text-align:center; }
  .lb-rank.top1 { color:var(--acc); }
  .lb-rank.top2 { color:#c0c0c0; }
  .lb-rank.top3 { color:#cd7f32; }
  .lb-avatar { width:36px; height:36px; border-radius:50%; background:var(--card2);
               display:flex; align-items:center; justify-content:center;
               font-size:18px; flex-shrink:0; }
  .lb-name { font-size:14px; font-weight:600; flex:1; }
  .lb-pts  { font-size:16px; font-weight:700; color:var(--acc); }
  .lb-sub  { font-size:11px; color:var(--mut); }

  /* ── BRACKET ── */
  .bracket-phase { margin-bottom:24px; }
  .bracket-phase-title { font-size:14px; font-weight:700; color:var(--acc);
                         margin-bottom:8px; text-transform:uppercase; letter-spacing:.5px; }
  .bracket-match { background:var(--card); border-radius:10px; padding:10px 14px;
                   margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .bracket-team  { flex:1; font-size:13px; font-weight:600; }
  .bracket-score { font-size:15px; font-weight:700; color:var(--acc);
                   min-width:36px; text-align:center; }

  /* ── PHASE FILTER ── */
  .phase-filter { display:flex; gap:6px; overflow-x:auto; margin-bottom:16px;
                  padding-bottom:4px; scrollbar-width:none; }
  .phase-filter::-webkit-scrollbar { display:none; }
  .phase-chip { background:rgba(255,255,255,.07); border:1px solid transparent;
                border-radius:20px; color:var(--mut); cursor:pointer; font-size:12px;
                font-weight:600; padding:5px 12px; white-space:nowrap; transition:all var(--tr); }
  .phase-chip:hover  { color:var(--txt); border-color:rgba(255,255,255,.2); }
  .phase-chip.active { background:rgba(245,183,49,.15); color:var(--acc); border-color:var(--acc); }

  /* ── GROUPS ── */
  .groups-grid { display:grid; gap:12px;
                 grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); }
  .group-card  { background:var(--card); border-radius:var(--rad); padding:12px;
                 border:1px solid rgba(255,255,255,.07); }
  .group-title { font-size:13px; font-weight:700; color:var(--acc);
                 margin-bottom:8px; text-transform:uppercase; letter-spacing:.5px; }
  .grp-tbl     { width:100%; border-collapse:collapse; font-size:12px; }
  .grp-tbl th  { color:var(--mut); font-weight:600; text-align:center;
                 padding:2px 3px; }
  .grp-tbl th:first-child { text-align:left; padding-left:2px; }
  .grp-tbl td  { padding:5px 3px; text-align:center;
                 border-top:1px solid rgba(255,255,255,.05); }
  .grp-tbl td:first-child { text-align:left; font-weight:600; padding-left:2px; }
  .grp-tbl .classified   { background:rgba(64,212,144,.07); }
  .grp-tbl .third-place  { background:rgba(96,170,255,.06); }
  .grp-tbl .pos-badge    { display:inline-block; width:16px; height:16px; border-radius:50%;
                            font-size:10px; font-weight:700; line-height:16px; text-align:center;
                            margin-right:4px; }
  .grp-tbl .p1 { background:var(--acc); color:#0a1628; }
  .grp-tbl .p2 { background:rgba(64,212,144,.6); color:#0a1628; }
  .grp-tbl .p3 { background:rgba(96,170,255,.5); color:#0a1628; }

  /* ── ADMIN ── */
  .admin-match { display:grid; grid-template-columns:1fr auto 1fr; align-items:center;
                 gap:8px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.07); }
  .admin-score-inp { width:48px; height:36px; background:var(--card2);
                     border:1px solid rgba(255,255,255,.15); border-radius:8px;
                     color:var(--txt); font-size:16px; text-align:center; outline:none; }

  /* ── UTILS ── */
  .spinner { width:24px; height:24px; border:3px solid rgba(255,255,255,.1);
             border-top-color:var(--acc); border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .center { display:flex; align-items:center; justify-content:center; }
  .mt16 { margin-top:16px; }
  .txt-mut { color:var(--mut); font-size:13px; }
  .badge-ok  { background:rgba(64,212,144,.15); color:var(--ok); border-radius:6px; padding:2px 8px; font-size:12px; }
  .badge-err { background:rgba(255,107,138,.15); color:var(--err); border-radius:6px; padding:2px 8px; font-size:12px; }
  .home-hero { text-align:center; padding:40px 16px 24px; }
  .home-hero h1 { font-size:28px; font-weight:800; color:var(--acc); margin-bottom:6px; }
  .home-hero p  { font-size:15px; color:var(--mut); }
  .rules-grid { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }
  .rule-card  { background:var(--card2); border-radius:12px; padding:16px; }
  .rule-pts   { font-size:28px; font-weight:800; color:var(--acc); }
  .rule-lbl   { font-size:13px; color:var(--mut); margin-top:4px; }
  @media(max-width:600px) {
    .hdr-name-u { display:none; }
    .match-teams { flex-wrap:wrap; gap:4px; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('es-ES', {
      weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
    })
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
// AUTH PAGE — Login / Register / Reset password
// ─────────────────────────────────────────────────────────────────────────────
function AuthPage({ t, onVerifying }) {
  const [mode, setMode]       = useState('login');  // 'login' | 'register' | 'reset'
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [pass2, setPass2]     = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [ok, setOk]           = useState('');

  const clear = () => { setErr(''); setOk(''); };

  const handleLogin = async e => {
    e.preventDefault(); clear(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) setErr(error.message.includes('Invalid') ? t.err_wrong_pass : t.err_general);
  };

  const handleRegister = async e => {
    e.preventDefault(); clear();
    if (pass.length < 6) return setErr(t.err_weak_pass);
    if (pass !== pass2)  return setErr(t.err_pass_match);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name.trim() || email.split('@')[0] } }
    });
    setLoading(false);
    if (error) {
      setErr(error.message.includes('already') ? t.err_email_taken : error.message);
    } else {
      onVerifying(email);
    }
  };

  const handleReset = async e => {
    e.preventDefault(); clear(); setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    setLoading(false);
    setOk(t.auth_reset_sent);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-icon">⚽</div>
        <div className="auth-title">Mundial 2026 · Marcadores</div>
        <div className="auth-sub">USA · México · Canadá</div>

        {mode !== 'reset' && (
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); clear(); }}>
              {t.auth_login}
            </button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); clear(); }}>
              {t.auth_register}
            </button>
          </div>
        )}

        {err && <div className="auth-err">{err}</div>}
        {ok  && <div className="auth-ok">{ok}</div>}

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>{t.auth_email}</label>
              <input type="email" required autoComplete="email"
                placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>{t.auth_password}</label>
              <input type="password" required autoComplete="current-password"
                placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <button className="btn-acc" type="submit" disabled={loading}
              style={{width:'100%',marginTop:4}}>
              {loading ? t.btn_sending : t.btn_login}
            </button>
            <div className="auth-footer">
              <button type="button" className="btn-link"
                onClick={() => { setMode('reset'); clear(); }}>
                {t.auth_forgot}
              </button>
            </div>
          </form>
        )}

        {/* ── REGISTER ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label>{t.auth_name}</label>
              <input type="text" required placeholder="Pedro Sánchez"
                value={name} onChange={e => setName(e.target.value)} />
              <div className="field-hint">{t.auth_name_hint}</div>
            </div>
            <div className="field">
              <label>{t.auth_email}</label>
              <input type="email" required autoComplete="email"
                placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>{t.auth_password}</label>
              <input type="password" required autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <div className="field">
              <label>{t.auth_password2}</label>
              <input type="password" required autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={pass2} onChange={e => setPass2(e.target.value)} />
            </div>
            <button className="btn-acc" type="submit" disabled={loading}
              style={{width:'100%',marginTop:4}}>
              {loading ? t.btn_sending : t.btn_register}
            </button>
          </form>
        )}

        {/* ── RESET PASSWORD ── */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div style={{marginBottom:16,fontSize:14,color:'var(--mut)'}}>
              {t.auth_reset_title}
            </div>
            <div className="field">
              <label>{t.auth_email}</label>
              <input type="email" required placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn-acc" type="submit" disabled={loading}
              style={{width:'100%'}}>
              {loading ? t.btn_sending : t.auth_reset_btn}
            </button>
            <div className="auth-footer">
              <button type="button" className="btn-link"
                onClick={() => { setMode('login'); clear(); }}>
                {t.auth_back}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY SCREEN — después de registrarse, antes de verificar email
// ─────────────────────────────────────────────────────────────────────────────
function VerifyScreen({ t, email }) {
  const [resent, setResent] = useState(false);

  const resend = async () => {
    await supabase.auth.resend({ type:'signup', email });
    setResent(true);
  };

  return (
    <div className="auth-wrap">
      <div className="verify-card">
        <div className="verify-icon">📧</div>
        <div className="verify-title">{t.verify_title}</div>
        <p style={{fontSize:14,color:'var(--mut)'}}>
          {t.verify_msg} <span className="verify-email">{email}</span>
        </p>
        <p className="verify-hint" style={{marginTop:12}}>{t.verify_hint}</p>
        <div style={{marginTop:20}}>
          {resent
            ? <span style={{color:'var(--ok)',fontSize:14}}>{t.verify_resent}</span>
            : <button className="btn-ghost btn-sm" onClick={resend}>{t.verify_resend}</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────────────────────
function HomePage() {
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
          antes del primer partido. Una vez cerrado el plazo no se pueden modificar.</p>
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
// PAGE: PREDICTIONS
// ─────────────────────────────────────────────────────────────────────────────
function PredictionsPage({ t, user, matches, predictions, onSave, onGoAuth }) {
  const [localPreds, setLocalPreds] = useState({});
  const [saving, setSaving]         = useState(null);
  const [savedMd, setSavedMd]       = useState(null);
  const [phase, setPhase]           = useState('all');

  useEffect(() => {
    const init = {};
    predictions.forEach(p => {
      init[p.match_id] = { h: String(p.home_goals), a: String(p.away_goals) };
    });
    setLocalPreds(init);
  }, [predictions]);

  if (!user) return (
    <div className="page">
      <div className="card" style={{textAlign:'center',padding:'40px 24px'}}>
        <div style={{fontSize:40,marginBottom:12}}>🔐</div>
        <p style={{marginBottom:16,color:'var(--mut)'}}>{t.login_required}</p>
        <button className="btn-acc" onClick={onGoAuth}>{t.auth_login} / {t.auth_register}</button>
      </div>
    </div>
  );

  const matchdayGroups = {};
  matches.forEach(m => {
    if (phase !== 'all' && m.phase !== phase) return;
    if (!matchdayGroups[m.matchday]) matchdayGroups[m.matchday] = [];
    matchdayGroups[m.matchday].push(m);
  });

  const setPred = (matchId, side, val) => {
    const n = val.replace(/\D/g,'').slice(0,2);
    setLocalPreds(p => ({ ...p, [matchId]: { ...p[matchId], [side]: n } }));
  };

  const handleSaveMatchday = async (matchday, mdMatches) => {
    setSaving(matchday);
    const rows = mdMatches
      .filter(m => { const p = localPreds[m.id]; return p && p.h !== '' && p.a !== ''; })
      .map(m => ({
        user_id: user.id, match_id: m.id,
        home_goals: parseInt(localPreds[m.id].h),
        away_goals: parseInt(localPreds[m.id].a),
      }));
    const { error } = await supabase
      .from('predictions')
      .upsert(rows, { onConflict: 'user_id,match_id' });
    setSaving(null);
    if (!error) { setSavedMd(matchday); onSave(); setTimeout(() => setSavedMd(null), 3000); }
  };

  const phasesInView = [...new Set(matches.map(m => m.phase))];

  return (
    <div className="page">
      <div className="page-title">🎯 {t.predict_title}</div>
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
              const pred     = localPreds[m.id] || { h:'', a:'' };
              const hasPred  = pred.h !== '' && pred.a !== '';
              const pts      = m.status === 'finished' && hasPred
                ? calcScore(parseInt(pred.h), parseInt(pred.a), m.home_goals, m.away_goals)
                : null;
              const ptsClass = pts === 3 ? 'exact' : pts >= 1 ? 'result' : pts > 0 ? 'goals' : 'zero';
              return (
                <div key={m.id}
                  className={`match-card ${m.status==='finished'?'has-result':''} ${!open?'deadline-passed':''}`}>
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
                  <div className="pred-row">
                    <input className="score-input" type="text" inputMode="numeric"
                      value={pred.h} disabled={!open}
                      onChange={e => setPred(m.id,'h',e.target.value)}
                      placeholder="0" />
                    <span className="pred-dash">–</span>
                    <input className="score-input" type="text" inputMode="numeric"
                      value={pred.a} disabled={!open}
                      onChange={e => setPred(m.id,'a',e.target.value)}
                      placeholder="0" />
                    {pts !== null && (
                      <span className={`pred-pts ${ptsClass}`}>+{pts} {t.pts}</span>
                    )}
                  </div>
                  <div className="match-meta">
                    <span>📅 {fmtDate(m.match_date)}</span>
                    <span>🏟️ {m.stadium}</span>
                    <span className="txt-mut">
                      {PHASE_LABELS[m.phase]}{m.group_name ? ` · Grupo ${m.group_name}` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
            {open && (
              <div className="save-matchday">
                <button className="btn-acc" disabled={saving === parseInt(md)}
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
// PAGE: RESULTS
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
        <div key={m.id} className={`match-card ${m.status==='finished'?'has-result':''}`}>
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
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('leaderboard').select('*').then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  const rankClass = r => r===1?'top1':r===2?'top2':r===3?'top3':'';
  const medal     = r => r===1?'🥇':r===2?'🥈':r===3?'🥉':r;

  return (
    <div className="page">
      <div className="page-title">🏆 {t.ranking_title}</div>
      <div className="card">
        {rows.map((row, i) => {
          const rank = i + 1;
          const isMe = user?.id === row.user_id;
          return (
            <div key={row.user_id} className="lb-row"
              style={isMe ? {background:'rgba(245,183,49,.07)',borderRadius:8,padding:'12px 8px'} : {}}>
              <div className={`lb-rank ${rankClass(rank)}`}>{medal(rank)}</div>
              <div className="lb-avatar">👤</div>
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
// PAGE: GROUPS
// ─────────────────────────────────────────────────────────────────────────────
function GroupsPage({ t, matches }) {
  const standings = computeAllStandings(matches);
  const groups    = Object.keys(standings);

  if (!groups.length) return (
    <div className="page">
      <div className="page-title">📋 {t.groups_title}</div>
      <div className="card"><p className="txt-mut">No hay datos de grupo aún.</p></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-title">📋 {t.groups_title}</div>
      <div className="groups-grid">
        {groups.map(grp => {
          const rows = standings[grp];
          return (
            <div key={grp} className="group-card">
              <div className="group-title">Grupo {grp}</div>
              <table className="grp-tbl">
                <thead>
                  <tr>
                    <th style={{width:'40%'}}></th>
                    <th>PJ</th><th>G</th><th>E</th><th>P</th>
                    <th>GF</th><th>GC</th><th>DG</th>
                    <th style={{color:'var(--acc)'}}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const rowClass = i === 0 ? 'classified' : i === 1 ? 'classified' : i === 2 ? 'third-place' : '';
                    const posClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : '';
                    return (
                      <tr key={r.team} className={rowClass}>
                        <td>
                          {posClass && <span className={`pos-badge ${posClass}`}>{i+1}</span>}
                          {!posClass && <span style={{marginRight:20}}></span>}
                          {flag(r.team)} {r.team}
                        </td>
                        <td>{r.pj}</td>
                        <td>{r.w}</td>
                        <td>{r.d}</td>
                        <td>{r.l}</td>
                        <td>{r.gf}</td>
                        <td>{r.ga}</td>
                        <td style={{color: r.gd > 0 ? 'var(--ok)' : r.gd < 0 ? 'var(--err)' : 'var(--mut)'}}>
                          {r.gd > 0 ? `+${r.gd}` : r.gd}
                        </td>
                        <td style={{fontWeight:700,color:'var(--acc)'}}>{r.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:12,padding:'10px 14px',background:'rgba(255,255,255,.04)',
                   borderRadius:10,fontSize:12,color:'var(--mut)'}}>
        <span style={{marginRight:16}}>
          <span style={{display:'inline-block',width:10,height:10,borderRadius:50,
                        background:'rgba(64,212,144,.6)',marginRight:4}}></span>
          Clasificado (1º / 2º)
        </span>
        <span>
          <span style={{display:'inline-block',width:10,height:10,borderRadius:50,
                        background:'rgba(96,170,255,.5)',marginRight:4}}></span>
          Mejor 3º (posible)
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: BRACKET
// ─────────────────────────────────────────────────────────────────────────────
function BracketPage({ t, matches }) {
  return (
    <div className="page">
      <div className="page-title">🪄 {t.bracket_title}</div>
      {['r32','r16','qf','sf','3rd','final'].map(ph => {
        const phMatches = matches.filter(m => m.phase === ph);
        if (!phMatches.length) return null;
        return (
          <div key={ph} className="bracket-phase">
            <div className="bracket-phase-title">{PHASE_LABELS[ph]}</div>
            {phMatches.map(m => (
              <div key={m.id} className="bracket-match">
                <span className="bracket-team">{flag(m.home_team)} {m.home_team || '?'}</span>
                <span className="bracket-score">
                  {m.status==='finished' ? `${m.home_goals}–${m.away_goals}` : '– : –'}
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
  const [results, setResults]       = useState({});
  const [saved, setSaved]           = useState({});
  const [phase, setPhase]           = useState('all');
  const [filling, setFilling]       = useState(false);
  const [fillStatus, setFillStatus] = useState('');  // '' | 'ok' | 'err'

  const fillBracket = async () => {
    setFilling(true); setFillStatus('');
    const { error } = await supabase.rpc('auto_fill_bracket');
    setFilling(false);
    if (error) { setFillStatus('err'); }
    else       { setFillStatus('ok'); onMatchUpdated(); setTimeout(() => setFillStatus(''), 4000); }
  };

  const setGoals = (matchId, side, val) => {
    const n = val.replace(/\D/g,'').slice(0,2);
    setResults(r => ({ ...r, [matchId]: { ...r[matchId], [side]: n } }));
  };

  const saveResult = async (match) => {
    const r = results[match.id] || {};
    if (r.h === undefined || r.a === undefined) return;
    const { error } = await supabase.from('matches').update({
      home_goals: parseInt(r.h), away_goals: parseInt(r.a), status: 'finished'
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

      {/* ── Bracket auto-fill ── */}
      <div className="card" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',
                                     marginBottom:12,padding:'12px 16px'}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:14}}>Cuadro eliminatorio</div>
          <div className="txt-mut" style={{fontSize:12,marginTop:2}}>
            Calcula clasificados y rellena los cruces automáticamente
          </div>
        </div>
        <button className="btn-acc btn-sm" onClick={fillBracket} disabled={filling}>
          {filling ? t.updating_bracket : t.update_bracket}
        </button>
        {fillStatus === 'ok'  && <span className="badge-ok">{t.bracket_updated}</span>}
        {fillStatus === 'err' && <span className="badge-err">Error al actualizar</span>}
      </div>

      <div className="phase-filter">
        <button className={`phase-chip ${phase==='all'?'active':''}`}
          onClick={() => setPhase('all')}>{t.all_phases}</button>
        {PHASES.map(p => (
          <button key={p} className={`phase-chip ${phase===p?'active':''}`}
            onClick={() => setPhase(p)}>{PHASE_LABELS[p]}</button>
        ))}
      </div>
      <div className="card">
        {filtered.map(m => (
          <div key={m.id} className="admin-match">
            <div style={{fontSize:13}}>
              <div style={{fontWeight:600}}>{flag(m.home_team)} {m.home_team || '?'}</div>
              <div style={{fontWeight:600}}>{flag(m.away_team)} {m.away_team || '?'}</div>
              <div className="txt-mut" style={{fontSize:11}}>
                P{m.match_number} · {PHASE_LABELS[m.phase]}
              </div>
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
            <button className="btn-acc btn-sm" onClick={() => saveResult(m)}>
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
  const [lang, setLang]           = useState(() => localStorage.getItem('pml') || 'es');
  const [tab, setTab]             = useState('home');
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState('');  // set after register
  const [matches, setMatches]     = useState([]);
  const [predictions, setPreds]   = useState([]);
  const [adminMode, setAdmin]     = useState(false);
  const [adminBuf, setAdminBuf]   = useState('');

  const t = LANGS[lang];

  useEffect(() => { localStorage.setItem('pml', lang); }, [lang]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setVerifyEmail('');  // limpia pantalla verify al confirmar
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadMatches = useCallback(async () => {
    const { data } = await supabase.from('matches').select('*').order('match_number');
    setMatches(data || []);
  }, []);

  const loadPredictions = useCallback(async () => {
    if (!user) { setPreds([]); return; }
    const { data } = await supabase.from('predictions').select('*').eq('user_id', user.id);
    setPreds(data || []);
  }, [user]);

  useEffect(() => { loadMatches(); }, [loadMatches]);
  useEffect(() => { loadPredictions(); }, [loadPredictions]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setTab('home');
  };

  // Admin unlock — escribe el PIN con el teclado (en cualquier parte de la página)
  const handleAdminKey = char => {
    const next = (adminBuf + char).slice(-ADMIN_PIN.length);
    setAdminBuf(next);
    if (next === ADMIN_PIN) { setAdmin(true); setTab('admin'); }
  };

  useEffect(() => {
    const onKey = e => {
      // Ignora si el foco está en un input/textarea
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key.length === 1) handleAdminKey(e.key);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminBuf]);

  const navTabs = [
    { id:'home',    l:t.nav_home },
    { id:'predict', l:t.nav_predict },
    { id:'results', l:t.nav_results },
    { id:'ranking', l:t.nav_ranking },
    { id:'groups',  l:t.nav_groups },
    { id:'bracket', l:t.nav_bracket },
    ...(adminMode ? [{ id:'admin', l:'⚙️ Admin' }] : []),
  ];

  if (authLoading) return <><style>{CSS}</style><Spinner /></>;

  // Pantalla de verificación de email (tras registrarse)
  if (verifyEmail) return (
    <>
      <style>{CSS}</style>
      <VerifyScreen t={t} email={verifyEmail} />
    </>
  );

  // Pantalla de login/registro (sin sesión y han navegado a predict)
  if (!user && tab === 'auth') return (
    <>
      <style>{CSS}</style>
      <AuthPage t={t} onVerifying={email => setVerifyEmail(email)} />
    </>
  );

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <>
      <style>{CSS}</style>

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
                <span style={{fontSize:20}}>👤</span>
                <span className="hdr-name-u">{displayName}</span>
                <button className="btn-ghost btn-sm" onClick={signOut}>{t.logout_btn}</button>
              </>
            ) : (
              <button className="btn-acc btn-sm" onClick={() => setTab('auth')}>
                {t.auth_login} / {t.auth_register}
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

      {tab === 'home'    && <HomePage t={t} />}
      {tab === 'auth'    && <AuthPage t={t} onVerifying={email => setVerifyEmail(email)} />}
      {tab === 'predict' && <PredictionsPage t={t} user={user} matches={matches}
                              predictions={predictions} onSave={loadPredictions}
                              onGoAuth={() => setTab('auth')} />}
      {tab === 'results' && <ResultsPage t={t} matches={matches} />}
      {tab === 'ranking' && <LeaderboardPage t={t} user={user} />}
      {tab === 'groups'  && <GroupsPage t={t} matches={matches} />}
      {tab === 'bracket' && <BracketPage t={t} matches={matches} />}
      {tab === 'admin'   && <AdminPage t={t} matches={matches}
                              onMatchUpdated={() => { loadMatches(); loadPredictions(); }} />}

      <footer style={{textAlign:'center',padding:'24px 16px',color:'var(--mut)',fontSize:12}}>
        {'Porra Marcadores · Mundial 2026'.split('').map((c,i) => (
          <span key={i} onClick={() => handleAdminKey(c)} style={{cursor:'default'}}>{c}</span>
        ))}
        {' '}
        <span onClick={() => handleAdminKey('🔐')} style={{cursor:'pointer',opacity:.3}}>🔐</span>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
export default App;
