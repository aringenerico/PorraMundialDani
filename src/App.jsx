import { useState, useEffect, useCallback, useMemo } from "react";
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

// ─── PRIZE SYSTEM ─────────────────────────────────────────────────────────────
const PRIZE_PER_HEAD = 10;
const PRIZE_DIST     = [0.80, 0.15, 0.05];

// ─── FLAGS (compat) ───────────────────────────────────────────────────────────
const FLAGS = {
  "Algeria":"🇩🇿","Argentina":"🇦🇷","Australia":"🇦🇺","Austria":"🇦🇹",
  "Belgium":"🇧🇪","Bosnia and Herzegovina":"🇧🇦","Brazil":"🇧🇷",
  "Cabo Verde":"🇨🇻","Canada":"🇨🇦","Colombia":"🇨🇴","Croatia":"🇭🇷",
  "Curaçao":"🇨🇼","Czech Republic":"🇨🇿","DR Congo":"🇨🇩","Ecuador":"🇪🇨",
  "Egypt":"🇪🇬","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","France":"🇫🇷","Germany":"🇩🇪","Ghana":"🇬🇭",
  "Haiti":"🇭🇹","Iran":"🇮🇷","Iraq":"🇮🇶","Ivory Coast":"🇨🇮","Japan":"🇯🇵",
  "Jordan":"🇯🇴","Mexico":"🇲🇽","Morocco":"🇲🇦","Netherlands":"🇳🇱",
  "New Zealand":"🇳🇿","Norway":"🇳🇴","Panama":"🇵🇦","Paraguay":"🇵🇾",
  "Portugal":"🇵🇹","Qatar":"🇶🇦","Saudi Arabia":"🇸🇦","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Senegal":"🇸🇳","South Africa":"🇿🇦","South Korea":"🇰🇷","Spain":"🇪🇸",
  "Sweden":"🇸🇪","Switzerland":"🇨🇭","Tunisia":"🇹🇳","Turkey":"🇹🇷",
  "Uruguay":"🇺🇾","USA":"🇺🇸","Uzbekistan":"🇺🇿",
};
const flag = t => FLAGS[t] || '🏳️';

// ─── COUNTRIES (FlagChip colors) ──────────────────────────────────────────────
const COUNTRIES = {
  Spain:      {code:'ESP',name:'España',    c:['#c60b1e','#f1bf00']},
  France:     {code:'FRA',name:'Francia',   c:['#002395','#ed2939']},
  Brazil:     {code:'BRA',name:'Brasil',    c:['#009c3b','#ffdf00']},
  Argentina:  {code:'ARG',name:'Argentina', c:['#74acdf','#ffffff']},
  Germany:    {code:'GER',name:'Alemania',  c:['#222','#dd0000']},
  Portugal:   {code:'POR',name:'Portugal',  c:['#af1212','#006600']},
  England:    {code:'ENG',name:'Inglaterra',c:['#cf142b','#ffffff']},
  Netherlands:{code:'NED',name:'Holanda',   c:['#ff6600','#003087']},
  Japan:      {code:'JPN',name:'Japón',     c:['#bc002d','#ffffff']},
  Mexico:     {code:'MEX',name:'México',    c:['#006847','#ce1126']},
  USA:        {code:'USA',name:'USA',       c:['#002868','#bf0a30']},
  Canada:     {code:'CAN',name:'Canadá',    c:['#ff0000','#ffffff']},
  Morocco:    {code:'MAR',name:'Marruecos', c:['#c1272d','#006233']},
  Senegal:    {code:'SEN',name:'Senegal',   c:['#00853f','#fdef42']},
  Uruguay:    {code:'URU',name:'Uruguay',   c:['#5aaaa8','#ffffff']},
  Colombia:   {code:'COL',name:'Colombia',  c:['#fcd116','#003087']},
  Ecuador:    {code:'ECU',name:'Ecuador',   c:['#ffd100','#003087']},
  Croatia:    {code:'CRO',name:'Croacia',   c:['#ff0000','#ffffff']},
  Switzerland:{code:'SUI',name:'Suiza',     c:['#ff0000','#ffffff']},
  Belgium:    {code:'BEL',name:'Bélgica',   c:['#000','#ef3340']},
  'South Korea':{code:'KOR',name:'Corea',   c:['#cd2e3a','#003478']},
  Australia:  {code:'AUS',name:'Australia', c:['#00843d','#003087']},
  Ghana:      {code:'GHA',name:'Ghana',     c:['#006b3f','#fcd116']},
  Austria:    {code:'AUT',name:'Austria',   c:['#ed2939','#ffffff']},
  Turkey:     {code:'TUR',name:'Turquía',   c:['#e30a17','#ffffff']},
  'Saudi Arabia':{code:'KSA',name:'Arabia S.',c:['#006c35','#ffffff']},
  Iran:       {code:'IRN',name:'Irán',      c:['#239f40','#da0000']},
  Iraq:       {code:'IRQ',name:'Irak',      c:['#ce1126','#007a3d']},
  Qatar:      {code:'QAT',name:'Qatar',     c:['#8d1b3d','#ffffff']},
  'Ivory Coast':{code:'CIV',name:'Costa Marfil',c:['#f77f00','#009a44']},
  'DR Congo': {code:'COD',name:'R.D. Congo',c:['#007fff','#f7d618']},
  Algeria:    {code:'ALG',name:'Argelia',   c:['#006233','#ffffff']},
  Egypt:      {code:'EGY',name:'Egipto',    c:['#ce1126','#ffffff']},
  Tunisia:    {code:'TUN',name:'Túnez',     c:['#e70013','#ffffff']},
  'South Africa':{code:'RSA',name:'Sudáfrica',c:['#007a4d','#ffb81c']},
  Uzbekistan: {code:'UZB',name:'Uzbekistán',c:['#1eb53a','#1cbfaf']},
  Jordan:     {code:'JOR',name:'Jordania',  c:['#007a3d','#ce1126']},
  Panama:     {code:'PAN',name:'Panamá',    c:['#da121a','#003893']},
  'Cabo Verde':{code:'CPV',name:'Cabo Verde',c:['#003893','#cf2027']},
  Haiti:      {code:'HAI',name:'Haití',     c:['#003087','#d21034']},
  Paraguay:   {code:'PAR',name:'Paraguay',  c:['#d52b1e','#0038a8']},
  'New Zealand':{code:'NZL',name:'N. Zelanda',c:['#00247d','#cc142b']},
  Norway:     {code:'NOR',name:'Noruega',   c:['#ef2b2d','#002868']},
  Sweden:     {code:'SWE',name:'Suecia',    c:['#006aa7','#fecc02']},
  'Czech Republic':{code:'CZE',name:'R. Checa',c:['#d7141a','#11457e']},
  Scotland:   {code:'SCO',name:'Escocia',   c:['#003078','#ffffff']},
  'Bosnia and Herzegovina':{code:'BIH',name:'Bosnia',c:['#002395','#f5c518']},
  'Curaçao':  {code:'CUW',name:'Curaçao',   c:['#003087','#f5c518']},
};
const C = t => COUNTRIES[t] || {code:(t||'?').slice(0,3).toUpperCase(), name:t||'?', c:['#334155','#1e293b']};

// ─── SCORING ──────────────────────────────────────────────────────────────────
const calcScore = (predH, predA, realH, realA) => {
  if (realH === null || realA === null) return null;
  const gh    = predH === realH ? 0.5 : 0;
  const ga    = predA === realA ? 0.5 : 0;
  const rp    = predH > predA ? 'H' : predH < predA ? 'A' : 'D';
  const rr    = realH > realA ? 'H' : realH < realA ? 'A' : 'D';
  const res   = rp === rr ? 1 : 0;
  const exact = predH === realH && predA === realA ? 1 : 0;
  return gh + ga + res + exact;
};

// ─── GROUP STANDINGS ─────────────────────────────────────────────────────────
function computeAllStandings(matches) {
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
      .map(([team, s]) => ({team,pj:s.pj,w:s.w,d:s.d,l:s.l,gf:s.gf,ga:s.ga,gd:s.gf-s.ga,pts:s.w*3+s.d}))
      .sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
  });
  return result;
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const LANGS = {
  es: {
    nav_home:'Inicio', nav_predict:'Pronósticos', nav_results:'Resultados',
    nav_ranking:'Ranking', nav_groups:'Grupos', nav_bracket:'Cuadro', nav_me:'Yo',
    logout_btn:'Salir',
    predict_title:'Mis Pronósticos', results_title:'Resultados',
    ranking_title:'Clasificación', bracket_title:'Cuadro Eliminatorio',
    save_btn:'Guardar', saving:'Guardando…', saved:'✅ Guardado',
    deadline_passed:'Plazo cerrado', no_predictions:'Sin predicciones aún',
    match_vs:'vs', pts:'pts',
    admin_panel:'Panel Admin', admin_save:'Guardar resultado', admin_saved:'Guardado ✓',
    login_required:'Inicia sesión para hacer tus pronósticos',
    matchday:'Jornada', all_phases:'Todas las fases',
    open_until:'Cierra',
    auth_login:'Iniciar sesión', auth_register:'Crear cuenta',
    auth_email:'Email', auth_password:'Contraseña',
    auth_password2:'Repite la contraseña', auth_name:'Tu nombre',
    auth_name_hint:'Cómo aparecerás en la clasificación',
    btn_login:'Entrar al Mundial →', btn_register:'Crear cuenta',
    btn_sending:'Enviando…',
    auth_no_account:'¿No tienes cuenta?', auth_have_account:'¿Ya tienes cuenta?',
    auth_forgot:'¿Olvidaste la contraseña?',
    auth_reset_sent:'✅ Email enviado. Revisa tu bandeja de entrada.',
    auth_reset_title:'Recuperar contraseña',
    auth_reset_btn:'Enviar enlace',
    auth_back:'← Volver',
    err_email_taken:'Este email ya está registrado.',
    err_wrong_pass:'Email o contraseña incorrectos.',
    err_weak_pass:'La contraseña debe tener al menos 6 caracteres.',
    err_pass_match:'Las contraseñas no coinciden.',
    err_general:'Algo ha ido mal. Inténtalo de nuevo.',
    verify_title:'¡Cuenta creada! 🎉',
    verify_msg:'Te hemos enviado un email de verificación a',
    verify_hint:'Haz clic en el enlace del email para activar tu cuenta.',
    verify_resend:'Reenviar email',
    verify_resent:'✅ Email reenviado',
    groups_title:'Clasificaciones de Grupo',
    update_bracket:'🔄 Actualizar Cuadro',
    updating_bracket:'Actualizando…',
    bracket_updated:'✅ Cuadro actualizado',
    prize_pool:'Bote total',
    prize_dist:'Reparto de premios',
    my_stats:'Mis estadísticas',
    my_profile:'Mi perfil',
    exact_label:'Exactos',
    result_label:'Resultados',
    streak_label:'Racha',
    preds_label:'Pronósticos',
  },
  en: {
    nav_home:'Home', nav_predict:'Predictions', nav_results:'Results',
    nav_ranking:'Ranking', nav_groups:'Groups', nav_bracket:'Bracket', nav_me:'Me',
    logout_btn:'Sign out',
    predict_title:'My Predictions', results_title:'Results',
    ranking_title:'Leaderboard', bracket_title:'Knockout Bracket',
    save_btn:'Save', saving:'Saving…', saved:'✅ Saved',
    deadline_passed:'Deadline passed', no_predictions:'No predictions yet',
    match_vs:'vs', pts:'pts',
    admin_panel:'Admin Panel', admin_save:'Save result', admin_saved:'Saved ✓',
    login_required:'Sign in to submit your predictions',
    matchday:'Matchday', all_phases:'All phases',
    open_until:'Closes',
    auth_login:'Sign in', auth_register:'Create account',
    auth_email:'Email', auth_password:'Password',
    auth_password2:'Repeat password', auth_name:'Your name',
    auth_name_hint:'How you\'ll appear in the leaderboard',
    btn_login:'Enter the World Cup →', btn_register:'Create account',
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
    verify_hint:'Click the link in the email to activate your account.',
    verify_resend:'Resend email',
    verify_resent:'✅ Email resent',
    groups_title:'Group Standings',
    update_bracket:'🔄 Update Bracket',
    updating_bracket:'Updating…',
    bracket_updated:'✅ Bracket updated',
    prize_pool:'Prize pool',
    prize_dist:'Prize distribution',
    my_stats:'My stats',
    my_profile:'My profile',
    exact_label:'Exact',
    result_label:'Results',
    streak_label:'Streak',
    preds_label:'Predictions',
  },
  pt: {
    nav_home:'Início', nav_predict:'Palpites', nav_results:'Resultados',
    nav_ranking:'Ranking', nav_groups:'Grupos', nav_bracket:'Chaveamento', nav_me:'Eu',
    logout_btn:'Sair',
    predict_title:'Meus Palpites', results_title:'Resultados',
    ranking_title:'Classificação', bracket_title:'Mata-Mata',
    save_btn:'Salvar', saving:'Salvando…', saved:'✅ Salvo',
    deadline_passed:'Prazo encerrado', no_predictions:'Sem palpites ainda',
    match_vs:'vs', pts:'pts',
    admin_panel:'Painel Admin', admin_save:'Salvar resultado', admin_saved:'Salvo ✓',
    login_required:'Entre para enviar seus palpites',
    matchday:'Rodada', all_phases:'Todas as fases',
    open_until:'Fecha',
    auth_login:'Entrar', auth_register:'Criar conta',
    auth_email:'Email', auth_password:'Senha',
    auth_password2:'Repita a senha', auth_name:'Seu nome',
    auth_name_hint:'Como aparecerá na classificação',
    btn_login:'Entrar na Copa →', btn_register:'Criar conta',
    btn_sending:'Enviando…',
    auth_no_account:'Não tem conta?', auth_have_account:'Já tem conta?',
    auth_forgot:'Esqueceu a senha?',
    auth_reset_sent:'✅ Email enviado.',
    auth_reset_title:'Recuperar senha',
    auth_reset_btn:'Enviar link',
    auth_back:'← Voltar',
    err_email_taken:'Este email já está registrado.',
    err_wrong_pass:'Email ou senha incorretos.',
    err_weak_pass:'A senha deve ter pelo menos 6 caracteres.',
    err_pass_match:'As senhas não coincidem.',
    err_general:'Algo deu errado.',
    verify_title:'Conta criada! 🎉',
    verify_msg:'Enviamos um email de verificação para',
    verify_hint:'Clique no link do email para ativar sua conta.',
    verify_resend:'Reenviar email',
    verify_resent:'✅ Email reenviado',
    groups_title:'Classificações dos Grupos',
    update_bracket:'🔄 Atualizar Chaveamento',
    updating_bracket:'Atualizando…',
    bracket_updated:'✅ Chaveamento atualizado',
    prize_pool:'Bolão total',
    prize_dist:'Distribuição de prêmios',
    my_stats:'Minhas estatísticas',
    my_profile:'Meu perfil',
    exact_label:'Exatos',
    result_label:'Resultados',
    streak_label:'Sequência',
    preds_label:'Palpites',
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --bg:        #0a1628;
    --bg-deep:   #050f1c;
    --surface:   #132040;
    --surface2:  #1a2d52;
    --line:      rgba(255,255,255,0.09);
    --txt:       #e8f0fe;
    --txt-mid:   #b0c4de;
    --mut:       #7a8ba0;
    --gold:      #F5B731;
    --gold-deep: #C48A10;
    --gold-glow: rgba(245,183,49,0.13);
    --coral:     #FF6B8A;
    --coral-glow:rgba(255,107,138,0.13);
    --green:     #40D490;
    --green-glow:rgba(64,212,144,0.13);
    --sky:       #60AAFF;
    --sky-glow:  rgba(96,170,255,0.13);
    /* legacy aliases */
    --card:  #132040; --card2: #1a2d52;
    --acc:   #F5B731; --acc2:  #C48A10;
    --ok:    #40D490; --err:   #FF6B8A; --info: #60AAFF;
    --rad:   14px; --tr: .18s ease;
  }
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--txt);
         font-family:'Inter',system-ui,sans-serif; min-height:100vh; }

  /* ── TOP BAR ── */
  .topbar { background:var(--bg-deep); border-bottom:1px solid var(--line);
            padding:10px 16px; display:flex; align-items:center; gap:10px;
            position:sticky; top:0; z-index:100; }
  .topbar-brand { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
  .brand-mark { width:30px; height:30px; border-radius:9px; flex-shrink:0;
                background:conic-gradient(from 45deg,#F5B731 0deg,#C48A10 90deg,#F5B731 180deg,#C48A10 270deg,#F5B731 360deg);
                display:flex; align-items:center; justify-content:center; position:relative; }
  .brand-mark-inner { position:absolute; inset:3px; border-radius:6px; background:var(--bg-deep);
                      display:flex; align-items:center; justify-content:center;
                      font-family:'Archivo Black',sans-serif; font-size:13px; color:var(--gold); }
  .topbar-title { font-family:'Archivo Black',sans-serif; font-size:13px; color:var(--gold);
                  text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; overflow:hidden; }
  .topbar-sub { font-size:10px; color:var(--mut); }
  .topbar-user { display:flex; align-items:center; gap:6px; padding:5px 9px 5px 5px;
                 background:var(--surface); border-radius:999px; border:1px solid var(--line);
                 cursor:pointer; flex-shrink:0; }
  .topbar-avatar { width:22px; height:22px; border-radius:50%;
                   background:linear-gradient(135deg,var(--gold),var(--coral));
                   display:flex; align-items:center; justify-content:center;
                   font-size:10px; font-weight:800; color:var(--bg-deep); }
  .topbar-rank { font-size:11px; font-weight:700; color:var(--txt); }
  .lang-sel { display:flex; gap:3px; }
  .lang-btn { background:rgba(255,255,255,.06); border:1px solid transparent;
              border-radius:6px; color:var(--mut); cursor:pointer; font-size:11px;
              padding:4px 7px; transition:all var(--tr); }
  .lang-btn:hover  { color:var(--txt); }
  .lang-btn.active { color:var(--gold); border-color:var(--gold); background:var(--gold-glow); }

  /* ── BOTTOM TAB BAR ── */
  .tab-bar { position:fixed; bottom:0; left:0; right:0; z-index:100;
             background:linear-gradient(180deg,rgba(5,15,28,0) 0%,rgba(5,15,28,0.97) 40%);
             backdrop-filter:blur(20px); border-top:1px solid var(--line);
             display:flex; justify-content:space-around; align-items:center;
             padding:10px 8px 20px; }
  .tab-btn { display:flex; flex-direction:column; align-items:center; gap:3px;
             color:var(--mut); background:none; border:none; cursor:pointer;
             padding:4px 12px; position:relative; transition:color var(--tr); }
  .tab-btn.on { color:var(--gold); }
  .tab-btn-dot { position:absolute; top:-6px; width:20px; height:3px; border-radius:3px;
                 background:var(--gold); box-shadow:0 0 10px var(--gold); }
  .tab-btn span { font-size:9.5px; font-weight:600; letter-spacing:.02em; }

  /* ── PAGE WRAPPER ── */
  .page { max-width:680px; margin:0 auto; padding:0 0 90px; }

  /* ── SECTION TITLE ── */
  .sec-title { display:flex; align-items:center; justify-content:space-between;
               padding:18px 16px 8px; }
  .sec-title-left { display:flex; align-items:center; gap:8px; }
  .sec-title-bar  { width:3px; height:14px; background:var(--gold); border-radius:2px; }
  .sec-title-text { font-family:'Archivo Black',sans-serif; font-size:12px;
                    text-transform:uppercase; letter-spacing:.08em; color:var(--txt); }
  .sec-title-right { font-size:11px; color:var(--mut); font-weight:600; }

  /* ── CARDS ── */
  .card  { background:var(--surface); border:1px solid var(--line); border-radius:16px;
           padding:14px; }
  .card2 { background:var(--surface2); }

  /* ── PILL ── */
  .pill { display:inline-flex; align-items:center; gap:5px; padding:3px 9px;
          border-radius:999px; font-size:10.5px; font-weight:700;
          letter-spacing:.04em; text-transform:uppercase; border-width:1px; border-style:solid; }
  .pill-gold  { background:var(--gold-glow);  color:var(--gold);  border-color:rgba(245,183,49,.35); }
  .pill-coral { background:var(--coral-glow); color:var(--coral); border-color:rgba(255,107,138,.35); }
  .pill-green { background:var(--green-glow); color:var(--green); border-color:rgba(64,212,144,.35); }
  .pill-sky   { background:var(--sky-glow);   color:var(--sky);   border-color:rgba(96,170,255,.35); }
  .pill-mut   { background:rgba(255,255,255,.06); color:var(--mut); border-color:var(--line); }

  /* ── FILTER CHIPS ── */
  .chips { display:flex; gap:6px; overflow-x:auto; padding:0 16px 4px;
           scrollbar-width:none; }
  .chips::-webkit-scrollbar { display:none; }
  .chip { padding:5px 12px; border-radius:999px; font-size:11px; font-weight:700;
          white-space:nowrap; cursor:pointer; transition:all var(--tr); border:1px solid var(--line);
          background:var(--surface); color:var(--mut); }
  .chip.on { background:var(--gold-glow); color:var(--gold); border-color:var(--gold); }

  /* ── BUTTONS ── */
  .btn-acc { background:var(--gold); color:var(--bg-deep); border:none; border-radius:10px;
             font-size:14px; font-weight:700; cursor:pointer; padding:10px 20px;
             transition:all var(--tr); min-height:44px; display:inline-flex;
             align-items:center; gap:6px; }
  .btn-acc:hover { background:var(--gold-deep); }
  .btn-acc:disabled { opacity:.5; cursor:not-allowed; }
  .btn-ghost { background:transparent; border:1px solid var(--line); color:var(--txt);
               border-radius:10px; font-size:14px; cursor:pointer; padding:10px 20px;
               transition:all var(--tr); min-height:44px; }
  .btn-ghost:hover { border-color:rgba(255,255,255,.3); }
  .btn-sm { padding:6px 14px; font-size:13px; min-height:36px; }
  .btn-link { background:none; border:none; color:var(--sky); cursor:pointer;
              font-size:13px; padding:0; text-decoration:underline; }

  /* ── AUTH ── */
  .auth-wrap { max-width:400px; margin:24px auto; padding:16px; }
  .auth-card  { background:var(--surface); border-radius:20px; padding:28px;
                border:1px solid rgba(245,183,49,.2); }
  .auth-tabs  { display:flex; margin-bottom:22px; border-radius:10px;
                overflow:hidden; border:1px solid var(--line); }
  .auth-tab   { flex:1; padding:10px; background:transparent; border:none;
                color:var(--mut); cursor:pointer; font-size:14px; font-weight:600;
                transition:all var(--tr); }
  .auth-tab.active { background:var(--gold); color:var(--bg-deep); }
  .field label { display:block; font-size:11px; font-weight:700; color:var(--mut);
                 letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; }
  .field input { width:100%; padding:12px 14px; background:var(--surface2);
                 border:1px solid var(--line); border-radius:10px; color:var(--txt);
                 font-size:15px; outline:none; transition:border-color var(--tr); margin-bottom:14px; }
  .field input:focus { border-color:var(--gold); }
  .field input::placeholder { color:var(--mut); }
  .auth-err { background:rgba(255,107,138,.1); border:1px solid rgba(255,107,138,.3);
              border-radius:8px; color:var(--err); font-size:13px;
              padding:10px 14px; margin-bottom:14px; }
  .auth-ok  { background:rgba(64,212,144,.1); border:1px solid rgba(64,212,144,.3);
              border-radius:8px; color:var(--ok); font-size:13px;
              padding:10px 14px; margin-bottom:14px; }
  .auth-footer { text-align:center; margin-top:14px; font-size:13px; color:var(--mut); }

  /* ── MATCH CARD ── */
  .match-card { background:var(--surface); border:1px solid var(--line); border-radius:16px;
                padding:14px; margin-bottom:10px; transition:border-color var(--tr); }
  .match-card.has-result { border-left:3px solid var(--ok); }
  .match-card.deadline-passed { opacity:.75; }
  .match-teams { display:flex; align-items:center; gap:8px; }
  .team-name { font-size:14px; font-weight:600; display:flex; align-items:center;
               gap:6px; flex:1; }
  .team-name.right { flex-direction:row-reverse; }
  .score-vs     { color:var(--mut); font-size:13px; }
  .score-result { font-size:18px; font-weight:700; color:var(--gold);
                  font-family:'JetBrains Mono',monospace; min-width:60px; text-align:center; }
  .match-meta { font-size:11px; color:var(--mut); margin-top:8px;
                display:flex; gap:12px; flex-wrap:wrap; }
  .pred-row { display:flex; align-items:center; gap:8px; margin-top:10px; }
  .score-input { width:52px; height:42px; background:var(--surface2);
                 border:1.5px solid rgba(245,183,49,.4); border-radius:10px;
                 color:var(--txt); font-size:20px; font-weight:700; font-family:'JetBrains Mono',monospace;
                 text-align:center; outline:none; transition:border-color var(--tr); }
  .score-input:focus { border-color:var(--gold); }
  .score-input:disabled { border-color:var(--line); opacity:.6; }
  .pred-dash { color:var(--mut); font-size:20px; font-weight:700; }
  .pred-pts { margin-left:auto; font-size:13px; font-weight:700;
              font-family:'JetBrains Mono',monospace; }
  .pred-pts.exact  { color:var(--gold); }
  .pred-pts.result { color:var(--green); }
  .pred-pts.goals  { color:var(--sky); }
  .pred-pts.zero   { color:var(--mut); }

  /* ── MATCHDAY HEADER ── */
  .matchday-hdr { display:flex; align-items:center; justify-content:space-between;
                  padding:16px 16px 8px; }
  .matchday-title { font-family:'Archivo Black',sans-serif; font-size:15px; color:var(--gold); }
  .deadline-badge { font-size:11px; padding:4px 10px; border-radius:20px; font-weight:700; }
  .deadline-badge.open   { background:var(--green-glow); color:var(--green); }
  .deadline-badge.closed { background:var(--coral-glow); color:var(--coral); }
  .save-matchday { padding:8px 16px 16px; display:flex; justify-content:flex-end; }

  /* ── LEADERBOARD ── */
  .lb-row { display:flex; align-items:center; gap:10px; padding:10px 12px;
            background:var(--surface); border:1px solid var(--line); border-radius:12px;
            margin-bottom:6px; }
  .lb-row.me { background:var(--gold-glow); border-color:var(--gold); }
  .lb-rank { font-family:'Archivo Black',sans-serif; font-size:16px; color:var(--mut);
             min-width:26px; text-align:center; }
  .lb-rank.r1 { color:var(--gold); }
  .lb-rank.r2 { color:#c0c0c0; }
  .lb-rank.r3 { color:#cd7f32; }
  .lb-avatar { width:34px; height:34px; border-radius:10px; background:var(--surface2);
               border:1px solid var(--line); display:flex; align-items:center;
               justify-content:center; font-size:11px; font-weight:800; color:var(--txt-mid); }
  .lb-name { font-size:13px; font-weight:700; flex:1; }
  .lb-pts  { font-size:16px; font-weight:700; color:var(--txt);
             font-family:'JetBrains Mono',monospace; }
  .lb-pts-sub { font-size:9px; color:var(--mut); font-weight:600; }

  /* ── PODIUM ── */
  .podium { display:grid; grid-template-columns:1fr 1.15fr 1fr; gap:8px;
            align-items:flex-end; padding:0 16px; margin-bottom:4px; }
  .podium-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
  .podium-avatar { width:48px; height:48px; border-radius:14px; display:flex;
                   align-items:center; justify-content:center; font-family:'Archivo Black',sans-serif;
                   font-size:18px; color:var(--bg-deep); }
  .podium-name { font-size:11px; font-weight:700; color:var(--txt); white-space:nowrap;
                 overflow:hidden; text-overflow:ellipsis; max-width:90px; text-align:center; }
  .podium-pts  { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; }
  .podium-bar  { width:100%; border-radius:10px 10px 0 0;
                 display:flex; align-items:flex-start; justify-content:center; padding-top:8px; }
  .podium-bar-num { font-family:'Archivo Black',sans-serif; font-size:28px; opacity:.45; }

  /* ── PRIZE CARD ── */
  .prize-card { background:linear-gradient(135deg,var(--surface2),var(--surface));
                border:1px solid rgba(245,183,49,.3); border-radius:16px;
                padding:16px; margin:0 16px; }
  .prize-total { font-family:'JetBrains Mono',monospace; font-size:36px; font-weight:700;
                 color:var(--gold); line-height:1; }
  .prize-row { display:flex; align-items:center; gap:10px; padding:8px 0;
               border-top:1px solid var(--line); }
  .prize-medal { font-size:18px; }
  .prize-name  { flex:1; font-size:13px; font-weight:600; }
  .prize-pct   { font-size:13px; color:var(--mut); font-weight:600; min-width:36px; text-align:right; }
  .prize-amt   { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700;
                 color:var(--gold); min-width:60px; text-align:right; }

  /* ── BRACKET ── */
  .bracket-phase { margin-bottom:20px; }
  .bracket-phase-title { font-family:'Archivo Black',sans-serif; font-size:11px; color:var(--gold);
                         padding:0 16px 6px; text-transform:uppercase; letter-spacing:.08em; }
  .bracket-match { background:var(--surface); border-radius:12px; padding:10px 14px;
                   margin:0 16px 6px; display:flex; align-items:center; gap:8px; }
  .bracket-team  { flex:1; font-size:13px; font-weight:600; display:flex;
                   align-items:center; gap:6px; }
  .bracket-score { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700;
                   color:var(--gold); min-width:48px; text-align:center; }

  /* ── GROUPS TABLE ── */
  .groups-grid { display:grid; gap:10px; padding:0 16px;
                 grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
  .group-card  { background:var(--surface); border-radius:14px; padding:12px;
                 border:1px solid var(--line); }
  .group-title { font-family:'Archivo Black',sans-serif; font-size:11px; color:var(--gold);
                 margin-bottom:8px; text-transform:uppercase; letter-spacing:.08em; }
  .grp-tbl     { width:100%; border-collapse:collapse; font-size:11.5px; }
  .grp-tbl th  { color:var(--mut); font-weight:600; text-align:center; padding:2px 3px; }
  .grp-tbl th:first-child { text-align:left; }
  .grp-tbl td  { padding:5px 3px; text-align:center; border-top:1px solid rgba(255,255,255,.05); }
  .grp-tbl td:first-child { text-align:left; font-weight:600; }
  .grp-tbl .classified  { background:rgba(64,212,144,.07); }
  .grp-tbl .third-place { background:rgba(96,170,255,.06); }
  .pos-badge { display:inline-block; width:16px; height:16px; border-radius:50%;
               font-size:10px; font-weight:700; line-height:16px; text-align:center; margin-right:4px; }
  .p1 { background:var(--gold); color:var(--bg-deep); }
  .p2 { background:rgba(64,212,144,.6); color:var(--bg-deep); }
  .p3 { background:rgba(96,170,255,.5); color:var(--bg-deep); }

  /* ── PROFILE ── */
  .stat-tile { flex:1; padding:12px 10px; border-radius:14px; background:var(--surface);
               border:1px solid var(--line); }
  .stat-val  { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700;
               line-height:1; }
  .stat-lbl  { font-size:10px; color:var(--mut); font-weight:600; letter-spacing:.04em;
               text-transform:uppercase; margin-top:4px; }

  /* ── ADMIN ── */
  .admin-match { display:grid; grid-template-columns:1fr auto auto;
                 align-items:center; gap:8px; padding:10px 0;
                 border-bottom:1px solid var(--line); }
  .admin-score-inp { width:48px; height:36px; background:var(--surface2);
                     border:1px solid var(--line); border-radius:8px;
                     color:var(--txt); font-size:16px; text-align:center; outline:none; }
  .phase-filter { display:flex; gap:6px; overflow-x:auto; margin:0 16px 12px;
                  scrollbar-width:none; }
  .phase-filter::-webkit-scrollbar { display:none; }
  .phase-chip { background:var(--surface); border:1px solid var(--line);
                border-radius:999px; color:var(--mut); cursor:pointer; font-size:11px;
                font-weight:600; padding:5px 12px; white-space:nowrap; }
  .phase-chip.active { background:var(--gold-glow); color:var(--gold); border-color:var(--gold); }

  /* ── UTILS ── */
  .spinner { width:24px; height:24px; border:3px solid rgba(255,255,255,.1);
             border-top-color:var(--gold); border-radius:50%;
             animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .center { display:flex; align-items:center; justify-content:center; padding:40px; }
  .txt-mut { color:var(--mut); font-size:13px; }
  .badge-ok  { background:var(--green-glow); color:var(--ok);   border-radius:6px; padding:2px 8px; font-size:12px; }
  .badge-err { background:var(--coral-glow); color:var(--err);  border-radius:6px; padding:2px 8px; font-size:12px; }
  .mono { font-family:'JetBrains Mono',monospace; }
  .display { font-family:'Archivo Black',sans-serif; }
  @media(max-width:480px){
    .groups-grid { grid-template-columns:1fr; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('es-ES',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
  : '—';
const isBeforeDeadline = dl => new Date() < new Date(dl);
const initials = name => (name||'?').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
const fmt€ = n => `${n.toLocaleString('es-ES')}€`;

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const ICON_PATHS = {
  home:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  target:  'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6a6 6 0 100 12 6 6 0 000-12z M12 10a2 2 0 100 4 2 2 0 000-4z',
  trophy:  'M6 9H2V2h4m12 7h4V2h-4M6 2h12v13a6 6 0 01-12 0V2z M12 22v-4 M8 22h8',
  bracket: 'M3 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z M14 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5z M3 16a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3z M14 12h3m-3 4h5a2 2 0 002-2v-1',
  user:    'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
  flame:   'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z',
  bolt:    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  check:   'M20 6L9 17l-5-5',
  clock:   'M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2',
  arrowR:  'M5 12h14 M12 5l7 7-7 7',
  lock:    'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4',
};
function Icon({ name, size=20, color='currentColor', stroke=1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {(ICON_PATHS[name]||'').split(' M').map((d,i) => (
        <path key={i} d={(i===0?'':' M')+d}/>
      ))}
    </svg>
  );
}

// ─── FLAG CHIP ────────────────────────────────────────────────────────────────
function FlagChip({ team, size=28 }) {
  const ct = C(team);
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.28, flexShrink:0,
      background:`linear-gradient(135deg, ${ct.c[0]}, ${ct.c[1]})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.34, fontWeight:700, color:'#fff',
      fontFamily:'JetBrains Mono,monospace', letterSpacing:'-0.03em',
    }}>
      {ct.code}
    </div>
  );
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Spinner() { return <div className="center"><div className="spinner"/></div>; }

function LangSelector({ lang, setLang }) {
  return (
    <div className="lang-sel">
      {[{code:'es',flag:'🇪🇸'},{code:'en',flag:'🇬🇧'},{code:'pt',flag:'🇧🇷'}].map(l=>(
        <button key={l.code} className={`lang-btn ${lang===l.code?'active':''}`}
          onClick={()=>setLang(l.code)}>{l.flag} {l.code.toUpperCase()}</button>
      ))}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="sec-title">
      <div className="sec-title-left">
        <div className="sec-title-bar"/>
        <div className="sec-title-text">{children}</div>
      </div>
      {right && <div className="sec-title-right">{right}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AuthPage({ t, lang, setLang, onVerifying }) {
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [pass2, setPass2]   = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');
  const [ok, setOk]         = useState('');
  const clear = () => { setErr(''); setOk(''); };

  const handleLogin = async e => {
    e.preventDefault(); clear(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password:pass });
    setLoading(false);
    if (error) setErr(error.message.includes('Invalid') ? t.err_wrong_pass : t.err_general);
  };
  const handleRegister = async e => {
    e.preventDefault(); clear();
    if (pass.length < 6) return setErr(t.err_weak_pass);
    if (pass !== pass2)  return setErr(t.err_pass_match);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password:pass,
      options:{ data:{ full_name: name.trim() || email.split('@')[0] } }
    });
    setLoading(false);
    if (error) setErr(error.message.includes('already') ? t.err_email_taken : error.message);
    else onVerifying(email);
  };
  const handleReset = async e => {
    e.preventDefault(); clear(); setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setLoading(false); setOk(t.auth_reset_sent);
  };

  return (
    <div style={{minHeight:'100vh', background:`radial-gradient(ellipse 120% 60% at 50% 0%, #1a2d52 0%, var(--bg) 60%, var(--bg-deep) 100%)`}}>
      {/* header strip */}
      <div style={{padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div className="brand-mark" style={{width:28,height:28}}>
            <div className="brand-mark-inner" style={{fontSize:12}}>P</div>
          </div>
          <span style={{fontFamily:'Archivo Black,sans-serif', fontSize:12, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'.06em'}}>
            Porra · Mundial 26
          </span>
        </div>
        <LangSelector lang={lang} setLang={setLang}/>
      </div>

      <div className="auth-wrap">
        {/* brand hero */}
        <div style={{textAlign:'center', paddingBottom:28, position:'relative'}}>
          <div style={{position:'absolute', top:-20, left:'50%', transform:'translateX(-50%)',
            width:200, height:200, borderRadius:'50%', background:'var(--gold-glow)',
            filter:'blur(50px)', pointerEvents:'none'}}/>
          <div className="brand-mark" style={{width:56,height:56,margin:'0 auto 14px',position:'relative'}}>
            <div className="brand-mark-inner" style={{fontSize:24}}>P</div>
          </div>
          <div style={{fontFamily:'Archivo Black,sans-serif', fontSize:28, letterSpacing:'-.02em', lineHeight:1}}>
            PORRA<br/><span style={{color:'var(--gold)'}}>MUNDIAL 26</span>
          </div>
          <div style={{fontSize:11, color:'var(--mut)', letterSpacing:'.18em', textTransform:'uppercase', marginTop:8, fontWeight:700}}>
            USA · MEX · CAN
          </div>
        </div>

        <div className="auth-card">
          {mode !== 'reset' && (
            <div className="auth-tabs">
              <button className={`auth-tab ${mode==='login'?'active':''}`}
                onClick={()=>{setMode('login');clear();}}>{t.auth_login}</button>
              <button className={`auth-tab ${mode==='register'?'active':''}`}
                onClick={()=>{setMode('register');clear();}}>{t.auth_register}</button>
            </div>
          )}
          {err && <div className="auth-err">{err}</div>}
          {ok  && <div className="auth-ok">{ok}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>{t.auth_email}</label>
                <input type="email" required autoComplete="email" placeholder="tu@email.com"
                  value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div className="field">
                <label>{t.auth_password}</label>
                <input type="password" required autoComplete="current-password" placeholder="••••••••"
                  value={pass} onChange={e=>setPass(e.target.value)}/>
              </div>
              <button className="btn-acc" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:4}}>
                {loading ? t.btn_sending : t.btn_login}
              </button>
              <div className="auth-footer">
                <button type="button" className="btn-link" onClick={()=>{setMode('reset');clear();}}>
                  {t.auth_forgot}
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="field">
                <label>{t.auth_name}</label>
                <input type="text" required placeholder="Pedro Sánchez"
                  value={name} onChange={e=>setName(e.target.value)}/>
                <div style={{fontSize:11,color:'var(--mut)',marginTop:-10,marginBottom:14}}>{t.auth_name_hint}</div>
              </div>
              <div className="field">
                <label>{t.auth_email}</label>
                <input type="email" required autoComplete="email" placeholder="tu@email.com"
                  value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div className="field">
                <label>{t.auth_password}</label>
                <input type="password" required autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                  value={pass} onChange={e=>setPass(e.target.value)}/>
              </div>
              <div className="field">
                <label>{t.auth_password2}</label>
                <input type="password" required autoComplete="new-password" placeholder="Repite la contraseña"
                  value={pass2} onChange={e=>setPass2(e.target.value)}/>
              </div>
              <button className="btn-acc" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:4}}>
                {loading ? t.btn_sending : t.btn_register}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset}>
              <div style={{marginBottom:16,fontSize:14,color:'var(--mut)'}}>{t.auth_reset_title}</div>
              <div className="field">
                <label>{t.auth_email}</label>
                <input type="email" required placeholder="tu@email.com"
                  value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <button className="btn-acc" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
                {loading ? t.btn_sending : t.auth_reset_btn}
              </button>
              <div className="auth-footer">
                <button type="button" className="btn-link" onClick={()=>{setMode('login');clear();}}>
                  {t.auth_back}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function VerifyScreen({ t, email }) {
  const [resent, setResent] = useState(false);
  const resend = async () => { await supabase.auth.resend({type:'signup',email}); setResent(true); };
  return (
    <div style={{maxWidth:420,margin:'60px auto',padding:16}}>
      <div style={{background:'var(--surface)',borderRadius:20,padding:32,
        border:'1px solid rgba(64,212,144,.3)',textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:12}}>📧</div>
        <div style={{fontFamily:'Archivo Black,sans-serif',fontSize:22,color:'var(--ok)',marginBottom:8}}>{t.verify_title}</div>
        <p style={{fontSize:14,color:'var(--mut)'}}>{t.verify_msg}{' '}
          <span style={{fontWeight:700,color:'var(--gold)',display:'block',margin:'8px 0'}}>{email}</span>
        </p>
        <p style={{fontSize:13,color:'var(--mut)',lineHeight:1.6,marginTop:12}}>{t.verify_hint}</p>
        <div style={{marginTop:20}}>
          {resent
            ? <span style={{color:'var(--ok)',fontSize:14}}>{t.verify_resent}</span>
            : <button className="btn-ghost btn-sm" onClick={resend}>{t.verify_resend}</button>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ t, user, matches, leaderboard, onGoAuth, onTabChange }) {
  // Next deadline
  const nextDeadline = useMemo(() => {
    const upcoming = matches
      .filter(m => m.deadline && isBeforeDeadline(m.deadline))
      .map(m => ({dl: new Date(m.deadline), md: m.matchday}))
      .sort((a,b) => a.dl - b.dl);
    return upcoming[0] || null;
  }, [matches]);

  // Today's matches
  const todayMatches = useMemo(() => {
    const today = new Date().toDateString();
    return matches.filter(m => m.match_date && new Date(m.match_date).toDateString() === today);
  }, [matches]);

  // Live matches
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'in_progress');

  // My rank
  const myRow = useMemo(() => {
    if (!user || !leaderboard.length) return null;
    const idx = leaderboard.findIndex(r => r.user_id === user.id);
    return idx >= 0 ? { rank: idx+1, ...leaderboard[idx] } : null;
  }, [user, leaderboard]);

  // Countdown from nextDeadline
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!nextDeadline) return;
    const tick = () => {
      const diff = nextDeadline.dl - new Date();
      if (diff <= 0) { setCountdown('00h 00m'); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [nextDeadline]);

  const totalPool = leaderboard.length * PRIZE_PER_HEAD;

  return (
    <div className="page">
      {/* DEADLINE HERO */}
      {nextDeadline && (
        <div style={{padding:'14px 16px 0'}}>
          <div style={{
            background:'linear-gradient(135deg,var(--surface2),var(--surface))',
            border:'1px solid rgba(255,107,138,.3)', borderRadius:16,
            padding:16, position:'relative', overflow:'hidden'
          }}>
            <div style={{position:'absolute',top:-40,right:-40,width:130,height:130,
              borderRadius:'50%',background:'var(--coral-glow)',filter:'blur(30px)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
              <Icon name="bolt" size={12} color="var(--coral)" stroke={2.2}/>
              <span style={{fontSize:10,fontWeight:800,color:'var(--coral)',letterSpacing:'.1em',textTransform:'uppercase'}}>
                Cierre Jornada {nextDeadline.md}
              </span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:32,fontWeight:700,
                color:'var(--gold)',lineHeight:1,textShadow:'0 0 24px rgba(245,183,49,.4)'}}>
                {countdown}
              </div>
              <div style={{flex:1}}/>
              <button className="btn-acc btn-sm" onClick={()=>onTabChange('predict')}>
                Pronosticar <Icon name="arrowR" size={13} color="var(--bg-deep)" stroke={2.4}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TODAY / LIVE */}
      {(todayMatches.length > 0 || liveMatches.length > 0) && (
        <>
          <SectionTitle right="Ver todos">
            {liveMatches.length > 0 ? '🔴 En directo' : 'Hoy juegan'}
          </SectionTitle>
          <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:8}}>
            {(liveMatches.length > 0 ? liveMatches : todayMatches).slice(0,3).map(m => (
              <div key={m.id} className="match-card" style={{
                borderLeft: m.status==='live'||m.status==='in_progress'
                  ? '3px solid var(--coral)' : '1px solid var(--line)'
              }}>
                <div className="match-teams">
                  <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
                    <FlagChip team={m.home_team} size={26}/>
                    <span style={{fontWeight:700,fontSize:14}}>{m.home_team||'?'}</span>
                  </div>
                  {m.status==='finished' || m.status==='live' || m.status==='in_progress'
                    ? <div className="score-result">{m.home_goals}–{m.away_goals}</div>
                    : <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:15,color:'var(--txt)',minWidth:50,textAlign:'center'}}>
                        {new Date(m.match_date).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}
                      </div>}
                  <div style={{display:'flex',alignItems:'center',gap:8,flex:1,justifyContent:'flex-end'}}>
                    <span style={{fontWeight:700,fontSize:14}}>{m.away_team||'?'}</span>
                    <FlagChip team={m.away_team} size={26}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MY RANK */}
      {myRow && (
        <>
          <SectionTitle right={<span onClick={()=>onTabChange('ranking')} style={{cursor:'pointer',color:'var(--gold)'}}>Ver podio →</span>}>
            Tu posición
          </SectionTitle>
          <div style={{padding:'0 16px'}}>
            <div className="card" style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{
                width:52, height:52, borderRadius:14,
                background:'linear-gradient(135deg,rgba(245,183,49,.2),rgba(255,107,138,.2))',
                border:'1.5px solid var(--gold)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'Archivo Black,sans-serif',fontSize:22,color:'var(--gold)'
              }}>{myRow.rank}º</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:24,fontWeight:700,lineHeight:1}}>
                  {myRow.total_pts}
                  <span style={{fontSize:12,color:'var(--mut)',marginLeft:6,fontWeight:500}}>pts</span>
                </div>
                <div style={{display:'flex',gap:12,marginTop:6,fontSize:11,color:'var(--mut)'}}>
                  <span>🎯 {myRow.pts_exact} exactos</span>
                  <span>✅ {myRow.pts_result} resultados</span>
                  <span>⚽ {myRow.pts_goals} goles</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!user && (
        <div style={{padding:'16px'}}>
          <div className="card" style={{textAlign:'center',padding:'28px 20px'}}>
            <div style={{fontSize:36,marginBottom:12}}>🎯</div>
            <div style={{fontFamily:'Archivo Black,sans-serif',fontSize:18,marginBottom:8}}>
              ¿Quién ganará el Mundial?
            </div>
            <p style={{color:'var(--mut)',fontSize:13,marginBottom:16,lineHeight:1.5}}>
              Entra, haz tus pronósticos y compite con tus amigos.
            </p>
            <button className="btn-acc" onClick={onGoAuth} style={{width:'100%',justifyContent:'center'}}>
              Jugar gratis <Icon name="arrowR" size={14} color="var(--bg-deep)" stroke={2.4}/>
            </button>
          </div>
        </div>
      )}

      {/* PRIZE POOL */}
      {leaderboard.length > 0 && (
        <>
          <SectionTitle>🏆 {t.prize_pool}</SectionTitle>
          <div style={{padding:'0 16px'}}>
            <div className="prize-card">
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
                <div className="prize-total">{fmt€(totalPool)}</div>
                <div style={{fontSize:12,color:'var(--mut)'}}>{leaderboard.length} participantes × {fmt€(PRIZE_PER_HEAD)}</div>
              </div>
              {[
                {medal:'🥇',label:'1er Premio',pct:PRIZE_DIST[0]},
                {medal:'🥈',label:'2º Premio', pct:PRIZE_DIST[1]},
                {medal:'🥉',label:'3er Premio',pct:PRIZE_DIST[2]},
              ].map((row,i)=>(
                <div key={i} className="prize-row">
                  <span className="prize-medal">{row.medal}</span>
                  <span className="prize-name">{row.label}</span>
                  <span className="prize-pct">{(row.pct*100).toFixed(0)}%</span>
                  <span className="prize-amt">{fmt€(Math.floor(totalPool*row.pct))}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* SCORING RULES */}
      <SectionTitle>Sistema de puntuación</SectionTitle>
      <div style={{padding:'0 16px'}}>
        <div className="card">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[
              {pts:'+0.5',lbl:'Gol acertado',color:'var(--sky)'},
              {pts:'+1',  lbl:'Resultado V/E/D',color:'var(--green)'},
              {pts:'+3',  lbl:'Marcador exacto',color:'var(--gold)'},
            ].map(r=>(
              <div key={r.pts} style={{background:'var(--surface2)',borderRadius:12,padding:'12px 10px',textAlign:'center'}}>
                <div style={{fontFamily:'Archivo Black,sans-serif',fontSize:22,color:r.color}}>{r.pts}</div>
                <div style={{fontSize:10,color:'var(--mut)',marginTop:4}}>{r.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: PREDICTIONS (+ Results toggle)
// ─────────────────────────────────────────────────────────────────────────────
function PredictionsPage({ t, user, matches, predictions, onSave, onGoAuth }) {
  const [localPreds, setLocalPreds] = useState({});
  const [saving, setSaving]         = useState(null);
  const [savedMd, setSavedMd]       = useState(null);
  const [phase, setPhase]           = useState('all');
  const [view, setView]             = useState('predict'); // 'predict' | 'results'

  useEffect(() => {
    const init = {};
    predictions.forEach(p => { init[p.match_id] = {h:String(p.home_goals),a:String(p.away_goals)}; });
    setLocalPreds(init);
  }, [predictions]);

  if (!user) return (
    <div className="page" style={{padding:'40px 16px',textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:12}}>🔐</div>
      <p style={{marginBottom:16,color:'var(--mut)'}}>{t.login_required}</p>
      <button className="btn-acc" onClick={onGoAuth}>{t.auth_login} / {t.auth_register}</button>
    </div>
  );

  const matchdayGroups = {};
  matches.forEach(m => {
    if (view === 'results' && m.status !== 'finished') return;
    if (phase !== 'all' && m.phase !== phase) return;
    if (!matchdayGroups[m.matchday]) matchdayGroups[m.matchday] = [];
    matchdayGroups[m.matchday].push(m);
  });

  const setPred = (matchId, side, val) => {
    const n = val.replace(/\D/g,'').slice(0,2);
    setLocalPreds(p => ({...p,[matchId]:{...p[matchId],[side]:n}}));
  };

  const handleSaveMatchday = async (matchday, mdMatches) => {
    setSaving(matchday);
    const rows = mdMatches
      .filter(m => { const p = localPreds[m.id]; return p && p.h!=='' && p.a!==''; })
      .map(m => ({
        user_id:user.id, match_id:m.id,
        home_goals:parseInt(localPreds[m.id].h),
        away_goals:parseInt(localPreds[m.id].a),
      }));
    const { error } = await supabase.from('predictions').upsert(rows, {onConflict:'user_id,match_id'});
    setSaving(null);
    if (!error) { setSavedMd(matchday); onSave(); setTimeout(()=>setSavedMd(null),3000); }
  };

  const phasesInView = [...new Set(matches.map(m => m.phase))];

  return (
    <div className="page">
      {/* view toggle */}
      <div style={{padding:'14px 16px 0', display:'flex', gap:8, alignItems:'center'}}>
        <div style={{display:'flex',background:'var(--surface)',borderRadius:999,padding:3,border:'1px solid var(--line)'}}>
          {[{id:'predict',l:t.nav_predict},{id:'results',l:t.nav_results}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{
              padding:'5px 14px', borderRadius:999, fontSize:12, fontWeight:700,
              background:view===v.id?'var(--gold)':'transparent',
              color:view===v.id?'var(--bg-deep)':'var(--mut)', border:'none', cursor:'pointer',
            }}>{v.l}</button>
          ))}
        </div>
      </div>

      {/* phase chips */}
      <div style={{padding:'12px 0 0'}}>
        <div className="chips">
          <button className={`chip ${phase==='all'?'on':''}`} onClick={()=>setPhase('all')}>
            {t.all_phases}
          </button>
          {PHASES.filter(p=>phasesInView.includes(p)).map(p=>(
            <button key={p} className={`chip ${phase===p?'on':''}`} onClick={()=>setPhase(p)}>
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'4px 16px 0'}}>
        {Object.entries(matchdayGroups).map(([md, mdMatches]) => {
          const deadline = mdMatches[0]?.deadline;
          const open = isBeforeDeadline(deadline);
          return (
            <div key={md}>
              <div className="matchday-hdr">
                <span className="matchday-title">{t.matchday} {md}</span>
                <span className={`deadline-badge ${open?'open':'closed'}`}>
                  {open ? `${t.open_until}: ${fmtDate(deadline)}` : t.deadline_passed}
                </span>
              </div>
              {mdMatches.map(m => {
                const pred = localPreds[m.id] || {h:'',a:''};
                const hasPred = pred.h!=='' && pred.a!=='';
                const pts = m.status==='finished' && hasPred
                  ? calcScore(parseInt(pred.h),parseInt(pred.a),m.home_goals,m.away_goals)
                  : null;
                const ptsClass = pts===3?'exact':pts>=1?'result':pts>0?'goals':'zero';
                return (
                  <div key={m.id} className={`match-card ${m.status==='finished'?'has-result':''} ${!open?'deadline-passed':''}`}>
                    <div className="match-teams">
                      <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
                        <FlagChip team={m.home_team} size={28}/>
                        <div>
                          <div style={{fontWeight:700,fontSize:14}}>{m.home_team||'?'}</div>
                          <div style={{fontSize:10,color:'var(--mut)',fontFamily:'JetBrains Mono,monospace'}}>
                            {C(m.home_team).code}
                          </div>
                        </div>
                      </div>
                      {m.status==='finished'
                        ? <div className="score-result">{m.home_goals}–{m.away_goals}</div>
                        : <div className="score-vs">{t.match_vs}</div>}
                      <div style={{display:'flex',alignItems:'center',gap:8,flex:1,justifyContent:'flex-end'}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:700,fontSize:14}}>{m.away_team||'?'}</div>
                          <div style={{fontSize:10,color:'var(--mut)',fontFamily:'JetBrains Mono,monospace'}}>
                            {C(m.away_team).code}
                          </div>
                        </div>
                        <FlagChip team={m.away_team} size={28}/>
                      </div>
                    </div>
                    {view==='predict' && (
                      <div className="pred-row">
                        <input className="score-input" type="text" inputMode="numeric"
                          value={pred.h} disabled={!open}
                          onChange={e=>setPred(m.id,'h',e.target.value)} placeholder="0"/>
                        <span className="pred-dash">–</span>
                        <input className="score-input" type="text" inputMode="numeric"
                          value={pred.a} disabled={!open}
                          onChange={e=>setPred(m.id,'a',e.target.value)} placeholder="0"/>
                        {pts !== null && <span className={`pred-pts ${ptsClass}`}>+{pts} {t.pts}</span>}
                      </div>
                    )}
                    <div className="match-meta">
                      <span>📅 {fmtDate(m.match_date)}</span>
                      <span>🏟️ {m.stadium}</span>
                      <span className="txt-mut">
                        {PHASE_LABELS[m.phase]}{m.group_name?` · Grupo ${m.group_name}`:''}
                      </span>
                    </div>
                  </div>
                );
              })}
              {view==='predict' && open && (
                <div className="save-matchday">
                  <button className="btn-acc" disabled={saving===parseInt(md)}
                    onClick={()=>handleSaveMatchday(parseInt(md),mdMatches)}>
                    {saving===parseInt(md) ? t.saving : savedMd===parseInt(md) ? t.saved : `💾 ${t.save_btn} Jornada ${md}`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────
function LeaderboardPage({ t, user, leaderboard, loading }) {
  if (loading) return <Spinner/>;
  const n = leaderboard.length;
  const totalPool = n * PRIZE_PER_HEAD;

  const top3 = leaderboard.slice(0,3);
  const rest = leaderboard.slice(3);

  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]   // 2nd, 1st, 3rd
    : top3;

  const podiumColors = ['#c0c0c0', '#F5B731', '#cd7f32'];
  const podiumHeights = [80, 110, 66];

  return (
    <div className="page">
      <div style={{padding:'14px 16px 0', display:'flex', alignItems:'baseline', gap:8}}>
        <div style={{fontFamily:'Archivo Black,sans-serif',fontSize:22,textTransform:'uppercase'}}>
          {t.ranking_title}
        </div>
        <span style={{fontSize:11,color:'var(--mut)',marginLeft:'auto'}}>{n} jugadores</span>
      </div>

      {/* PRIZE POOL BANNER */}
      {n > 0 && (
        <div style={{padding:'12px 16px 0'}}>
          <div className="prize-card" style={{padding:'12px 16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--mut)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:2}}>
                  🏆 {t.prize_pool}
                </div>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:28,fontWeight:700,color:'var(--gold)',lineHeight:1}}>
                  {fmt€(totalPool)}
                </div>
              </div>
              <div style={{flex:1}}/>
              <div style={{textAlign:'right',fontSize:12,color:'var(--mut)'}}>
                {[{m:'🥇',p:PRIZE_DIST[0]},{m:'🥈',p:PRIZE_DIST[1]},{m:'🥉',p:PRIZE_DIST[2]}].map((r,i)=>(
                  <div key={i}>{r.m} {fmt€(Math.floor(totalPool*r.p))}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PODIUM */}
      {top3.length >= 3 && (
        <>
          <div style={{padding:'20px 0 0'}}>
            <div className="podium">
              {podiumOrder.map((row, i) => {
                const origRank = top3.indexOf(row) + 1;
                const clr = podiumColors[origRank-1];
                const h = podiumHeights[i];
                const isMe = user?.id === row.user_id;
                return (
                  <div key={row.user_id} className="podium-item">
                    <div className="podium-avatar" style={{
                      background: isMe ? `linear-gradient(135deg,var(--gold),var(--coral))` : clr,
                      border:`2px solid ${clr}`,
                      boxShadow:`0 0 20px ${clr}55`,
                    }}>
                      {initials(row.display_name)}
                    </div>
                    <div className="podium-name">{row.display_name?.split(' ')[0]}</div>
                    <div className="podium-pts" style={{color:clr}}>
                      {row.total_pts}<span style={{fontSize:9,color:'var(--mut)',marginLeft:2}}>pts</span>
                    </div>
                    <div className="podium-bar" style={{
                      height:h,
                      background:`linear-gradient(180deg,${clr}aa 0%,${clr}22 100%)`,
                      border:`1px solid ${clr}66`, borderBottom:'none',
                    }}>
                      <span className="podium-bar-num" style={{color:clr}}>{origRank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* REST */}
      {rest.length > 0 && (
        <>
          <SectionTitle>Resto</SectionTitle>
          <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:6}}>
            {rest.map((row,i) => {
              const rank = i+4;
              const isMe = user?.id === row.user_id;
              return (
                <div key={row.user_id} className={`lb-row ${isMe?'me':''}`}>
                  <div className={`lb-rank ${rank<=3?`r${rank}`:''}`}>{rank}</div>
                  <div className="lb-avatar">{initials(row.display_name)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="lb-name">{row.display_name}</div>
                    <div style={{fontSize:10,color:'var(--mut)',marginTop:3}}>
                      🎯 {row.pts_exact} · ✅ {row.pts_result} · ⚽ {row.pts_goals}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="lb-pts">{row.total_pts}</div>
                    <div className="lb-pts-sub">{t.pts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TOP3 as list if podium not shown */}
      {top3.length < 3 && top3.length > 0 && (
        <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
          {leaderboard.map((row,i)=>{
            const rank=i+1;
            const isMe=user?.id===row.user_id;
            return (
              <div key={row.user_id} className={`lb-row ${isMe?'me':''}`}>
                <div className={`lb-rank ${rank<=3?`r${rank}`:''}`}>
                  {rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank}
                </div>
                <div className="lb-avatar">{initials(row.display_name)}</div>
                <div style={{flex:1}}><div className="lb-name">{row.display_name}</div></div>
                <div className="lb-pts">{row.total_pts}<span style={{fontSize:10,color:'var(--mut)',marginLeft:4}}>pts</span></div>
              </div>
            );
          })}
        </div>
      )}

      {leaderboard.length===0 && (
        <div style={{padding:'40px',textAlign:'center',color:'var(--mut)'}}>{t.no_predictions}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: BRACKET + GROUPS toggle
// ─────────────────────────────────────────────────────────────────────────────
function BracketPage({ t, matches }) {
  const [view, setView] = useState('bracket'); // 'bracket' | 'groups'
  const standings = useMemo(() => computeAllStandings(matches), [matches]);

  const knockoutPhases = ['r32','r16','qf','sf','3rd','final'];

  return (
    <div className="page">
      <div style={{padding:'14px 16px 0', display:'flex', gap:8}}>
        <div style={{display:'flex',background:'var(--surface)',borderRadius:999,padding:3,border:'1px solid var(--line)'}}>
          {[{id:'bracket',l:t.bracket_title},{id:'groups',l:t.groups_title}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{
              padding:'5px 14px', borderRadius:999, fontSize:12, fontWeight:700,
              background:view===v.id?'var(--gold)':'transparent',
              color:view===v.id?'var(--bg-deep)':'var(--mut)', border:'none', cursor:'pointer',
            }}>{v.l}</button>
          ))}
        </div>
      </div>

      {view === 'bracket' && (
        <div style={{marginTop:14}}>
          {knockoutPhases.map(ph => {
            const phMatches = matches.filter(m => m.phase === ph);
            if (!phMatches.length) return null;
            return (
              <div key={ph} className="bracket-phase">
                <div className="bracket-phase-title">{PHASE_LABELS[ph]}</div>
                {phMatches.map(m => (
                  <div key={m.id} className="bracket-match">
                    <div className="bracket-team">
                      <FlagChip team={m.home_team} size={20}/>
                      <span>{m.home_team||'?'}</span>
                    </div>
                    <div className="bracket-score">
                      {m.status==='finished' ? `${m.home_goals}–${m.away_goals}` : '·–·'}
                    </div>
                    <div className="bracket-team" style={{justifyContent:'flex-end',flexDirection:'row-reverse'}}>
                      <FlagChip team={m.away_team} size={20}/>
                      <span>{m.away_team||'?'}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {knockoutPhases.every(ph => !matches.filter(m=>m.phase===ph).length) && (
            <div style={{padding:'40px',textAlign:'center',color:'var(--mut)'}}>
              El cuadro eliminatorio se genera tras la fase de grupos.
            </div>
          )}
        </div>
      )}

      {view === 'groups' && (
        <div style={{marginTop:14}}>
          {Object.keys(standings).length === 0 && (
            <div style={{padding:'40px',textAlign:'center',color:'var(--mut)'}}>No hay datos de grupo aún.</div>
          )}
          <div className="groups-grid">
            {Object.entries(standings).map(([grp, rows]) => (
              <div key={grp} className="group-card">
                <div className="group-title">Grupo {grp}</div>
                <table className="grp-tbl">
                  <thead>
                    <tr>
                      <th style={{width:'42%'}}></th>
                      <th>PJ</th><th>G</th><th>E</th><th>P</th>
                      <th>GF</th><th>GC</th><th>DG</th>
                      <th style={{color:'var(--gold)'}}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r,i) => {
                      const rowClass = i<2?'classified':i===2?'third-place':'';
                      const pos      = i===0?'p1':i===1?'p2':i===2?'p3':'';
                      return (
                        <tr key={r.team} className={rowClass}>
                          <td>
                            {pos ? <span className={`pos-badge ${pos}`}>{i+1}</span>
                                 : <span style={{display:'inline-block',width:20}}></span>}
                            {flag(r.team)} {r.team}
                          </td>
                          <td>{r.pj}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
                          <td>{r.gf}</td><td>{r.ga}</td>
                          <td style={{color:r.gd>0?'var(--ok)':r.gd<0?'var(--err)':'var(--mut)'}}>
                            {r.gd>0?`+${r.gd}`:r.gd}
                          </td>
                          <td style={{fontWeight:700,color:'var(--gold)'}}>{r.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          {Object.keys(standings).length > 0 && (
            <div style={{margin:'12px 16px',padding:'10px 14px',background:'rgba(255,255,255,.04)',
              borderRadius:10,fontSize:12,color:'var(--mut)',display:'flex',gap:16}}>
              <span><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',
                background:'rgba(64,212,144,.6)',marginRight:4,verticalAlign:'middle'}}/>Clasificado</span>
              <span><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',
                background:'rgba(96,170,255,.5)',marginRight:4,verticalAlign:'middle'}}/>Mejor 3º</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function ProfilePage({ t, user, leaderboard, matches, predictions, onGoAuth, signOut }) {
  const myRow = useMemo(() => {
    if (!user || !leaderboard.length) return null;
    const idx = leaderboard.findIndex(r => r.user_id === user.id);
    return idx >= 0 ? {rank:idx+1, ...leaderboard[idx]} : null;
  }, [user, leaderboard]);

  if (!user) return (
    <div className="page" style={{padding:'40px 16px',textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:12}}>👤</div>
      <p style={{marginBottom:16,color:'var(--mut)'}}>{t.login_required}</p>
      <button className="btn-acc" onClick={onGoAuth}>{t.auth_login} / {t.auth_register}</button>
    </div>
  );

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '?';

  // Streak: consecutive finished matches with pts > 0
  const streak = useMemo(() => {
    const finished = matches
      .filter(m => m.status==='finished' && m.home_goals!==null)
      .sort((a,b) => new Date(b.match_date)-new Date(a.match_date));
    let s = 0;
    for (const m of finished) {
      const p = predictions.find(p => p.match_id===m.id);
      if (!p) break;
      const pts = calcScore(p.home_goals, p.away_goals, m.home_goals, m.away_goals);
      if (pts && pts > 0) s++; else break;
    }
    return s;
  }, [matches, predictions]);

  const stats = [
    {val: myRow?.pts_exact ?? 0,     lbl:t.exact_label,  color:'var(--gold)'},
    {val: myRow?.pts_result ?? 0,    lbl:t.result_label, color:'var(--green)'},
    {val: streak,                    lbl:t.streak_label, color:'var(--coral)'},
    {val: myRow?.predictions_made??0,lbl:t.preds_label,  color:'var(--sky)'},
  ];

  return (
    <div className="page">
      {/* Identity card */}
      <div style={{padding:'14px 16px 0'}}>
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{height:60,background:'linear-gradient(135deg,var(--gold),var(--coral))'}}/>
          <div style={{padding:'0 16px 16px',marginTop:-32}}>
            <div style={{
              width:64,height:64,borderRadius:18,background:'var(--bg-deep)',
              border:'3px solid var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:'Archivo Black,sans-serif',fontWeight:900,fontSize:22,color:'var(--gold)',
              boxShadow:'0 8px 24px rgba(0,0,0,.5)',
            }}>{initials(displayName)}</div>
            <div style={{marginTop:10,display:'flex',alignItems:'flex-end',gap:8}}>
              <div>
                <div style={{fontSize:18,fontWeight:800}}>{displayName}</div>
                <div style={{fontSize:11,color:'var(--mut)',marginTop:2}}>{user.email}</div>
              </div>
              {myRow && (
                <div style={{marginLeft:'auto',textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:24,fontWeight:700,
                    color:'var(--gold)',lineHeight:1}}>{myRow.total_pts}</div>
                  <div style={{fontSize:9,color:'var(--mut)',marginTop:2,letterSpacing:'.1em',
                    textTransform:'uppercase'}}>PUNTOS · {myRow.rank}º</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <SectionTitle>{t.my_stats}</SectionTitle>
      <div style={{padding:'0 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {stats.map((s,i) => (
          <div key={i} className="stat-tile">
            <div className="stat-val" style={{color:s.color}}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Scoring breakdown */}
      {myRow && (
        <>
          <SectionTitle>Desglose de puntos</SectionTitle>
          <div style={{padding:'0 16px'}}>
            <div className="card">
              {[
                {lbl:'Goles acertados', val:myRow.pts_goals,  color:'var(--sky)',   pct: myRow.total_pts>0 ? myRow.pts_goals/myRow.total_pts : 0},
                {lbl:'Resultados',      val:myRow.pts_result, color:'var(--green)', pct: myRow.total_pts>0 ? myRow.pts_result/myRow.total_pts : 0},
                {lbl:'Exactos (bonus)', val:myRow.pts_exact,  color:'var(--gold)',  pct: myRow.total_pts>0 ? myRow.pts_exact/myRow.total_pts : 0},
              ].map((row,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<2?10:0}}>
                  <div style={{fontSize:12,color:'var(--txt)',width:120}}>{row.lbl}</div>
                  <div style={{flex:1,height:6,background:'var(--surface2)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${row.pct*100}%`,height:'100%',background:row.color,borderRadius:99}}/>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,
                    color:'var(--txt)',width:32,textAlign:'right'}}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{padding:'20px 16px 0',display:'flex',flexDirection:'column',gap:8}}>
        <button className="btn-ghost" style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
          onClick={signOut}>
          <Icon name="lock" size={16}/> {t.logout_btn}
        </button>
      </div>
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
  const [fillStatus, setFillStatus] = useState('');

  const fillBracket = async () => {
    setFilling(true); setFillStatus('');
    const { error } = await supabase.rpc('auto_fill_bracket');
    setFilling(false);
    if (error) setFillStatus('err');
    else { setFillStatus('ok'); onMatchUpdated(); setTimeout(()=>setFillStatus(''),4000); }
  };

  const setGoals = (matchId, side, val) => {
    const n = val.replace(/\D/g,'').slice(0,2);
    setResults(r => ({...r,[matchId]:{...r[matchId],[side]:n}}));
  };

  const saveResult = async (match) => {
    const r = results[match.id] || {};
    const h = r.h !== undefined ? r.h : String(match.home_goals ?? '');
    const a = r.a !== undefined ? r.a : String(match.away_goals ?? '');
    if (h==='' || a==='') return;
    const { error } = await supabase.rpc('admin_save_result', {
      p_match_id: match.id, p_home: parseInt(h), p_away: parseInt(a),
    });
    if (error) setSaved(s => ({...s,[match.id]:'err:'+error.message}));
    else {
      setSaved(s => ({...s,[match.id]:'ok'}));
      onMatchUpdated();
      setTimeout(()=>setSaved(s=>({...s,[match.id]:null})),2500);
    }
  };

  const filtered = phase==='all' ? matches : matches.filter(m=>m.phase===phase);

  return (
    <div className="page" style={{padding:'0 0 90px'}}>
      <div style={{padding:'14px 16px 0'}}>
        <div style={{fontFamily:'Archivo Black,sans-serif',fontSize:20,textTransform:'uppercase',marginBottom:12}}>
          ⚙️ {t.admin_panel}
        </div>

        {/* Bracket fill */}
        <div className="card" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:12,padding:'12px 16px'}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14}}>Cuadro eliminatorio</div>
            <div className="txt-mut" style={{fontSize:12,marginTop:2}}>Calcula clasificados y rellena los cruces</div>
          </div>
          <button className="btn-acc btn-sm" onClick={fillBracket} disabled={filling}>
            {filling ? t.updating_bracket : t.update_bracket}
          </button>
          {fillStatus==='ok'  && <span className="badge-ok">{t.bracket_updated}</span>}
          {fillStatus==='err' && <span className="badge-err">Error al actualizar</span>}
        </div>
      </div>

      <div className="phase-filter">
        <button className={`phase-chip ${phase==='all'?'active':''}`} onClick={()=>setPhase('all')}>
          {t.all_phases}
        </button>
        {PHASES.map(p=>(
          <button key={p} className={`phase-chip ${phase===p?'active':''}`} onClick={()=>setPhase(p)}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <div style={{padding:'0 16px'}}>
        <div className="card">
          {filtered.map(m=>(
            <div key={m.id} className="admin-match">
              <div style={{fontSize:13}}>
                <div style={{fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
                  <FlagChip team={m.home_team} size={16}/> {m.home_team||'?'}
                </div>
                <div style={{fontWeight:600,display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                  <FlagChip team={m.away_team} size={16}/> {m.away_team||'?'}
                </div>
                <div className="txt-mut" style={{fontSize:11,marginTop:4}}>
                  P{m.match_number} · {PHASE_LABELS[m.phase]}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <input className="admin-score-inp"
                  value={results[m.id]?.h ?? (m.home_goals??'')}
                  onChange={e=>setGoals(m.id,'h',e.target.value)} placeholder="0"/>
                <span style={{color:'var(--mut)'}}>–</span>
                <input className="admin-score-inp"
                  value={results[m.id]?.a ?? (m.away_goals??'')}
                  onChange={e=>setGoals(m.id,'a',e.target.value)} placeholder="0"/>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <button className="btn-acc btn-sm" onClick={()=>saveResult(m)}>
                  {saved[m.id]==='ok' ? t.admin_saved : t.admin_save}
                </button>
                {saved[m.id]?.startsWith?.('err:') && (
                  <span style={{fontSize:11,color:'var(--err)',maxWidth:180,wordBreak:'break-all'}}>
                    ❌ {saved[m.id].replace('err:','')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [lang, setLang]             = useState(()=>localStorage.getItem('pml')||'es');
  const [tab, setTab]               = useState('home');
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [matches, setMatches]       = useState([]);
  const [predictions, setPreds]     = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading]   = useState(true);
  const [adminMode, setAdmin]       = useState(false);
  const [adminBuf, setAdminBuf]     = useState('');

  const t = LANGS[lang];

  useEffect(()=>{ localStorage.setItem('pml',lang); },[lang]);

  // Auth
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null); setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,session)=>{
      setUser(session?.user??null);
      if (session?.user) setVerifyEmail('');
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadMatches = useCallback(async()=>{
    const {data} = await supabase.from('matches').select('*').order('match_number');
    setMatches(data||[]);
  },[]);

  const loadPredictions = useCallback(async()=>{
    if (!user) { setPreds([]); return; }
    const {data} = await supabase.from('predictions').select('*').eq('user_id',user.id);
    setPreds(data||[]);
  },[user]);

  const loadLeaderboard = useCallback(async()=>{
    setLbLoading(true);
    const {data} = await supabase.from('leaderboard').select('*');
    setLeaderboard(data||[]);
    setLbLoading(false);
  },[]);

  useEffect(()=>{ loadMatches(); },[loadMatches]);
  useEffect(()=>{ loadPredictions(); },[loadPredictions]);
  useEffect(()=>{ loadLeaderboard(); },[loadLeaderboard]);

  const signOut = async()=>{ await supabase.auth.signOut(); setTab('home'); };

  // Admin PIN via keyboard
  const handleAdminKey = char => {
    const next = (adminBuf+char).slice(-ADMIN_PIN.length);
    setAdminBuf(next);
    if (next===ADMIN_PIN) { setAdmin(true); setTab('admin'); }
  };
  useEffect(()=>{
    const onKey = e=>{
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key.length===1) handleAdminKey(e.key);
    };
    document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[adminBuf]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  const myRank = useMemo(()=>{
    if (!user||!leaderboard.length) return null;
    const idx = leaderboard.findIndex(r=>r.user_id===user.id);
    return idx>=0 ? idx+1 : null;
  },[user,leaderboard]);

  const onRefresh = ()=>{ loadMatches(); loadPredictions(); loadLeaderboard(); };

  if (authLoading) return <><style>{CSS}</style><Spinner/></>;

  if (verifyEmail) return (
    <><style>{CSS}</style><VerifyScreen t={t} email={verifyEmail}/></>
  );

  if (!user && (tab==='auth')) return (
    <><style>{CSS}</style>
      <AuthPage t={t} lang={lang} setLang={setLang} onVerifying={email=>setVerifyEmail(email)}/>
    </>
  );

  const bottomTabs = [
    {id:'home',    label:t.nav_home,    icon:'home'},
    {id:'predict', label:t.nav_predict, icon:'target'},
    {id:'bracket', label:t.nav_bracket, icon:'bracket'},
    {id:'ranking', label:t.nav_ranking, icon:'trophy'},
    {id:'me',      label:t.nav_me,      icon:'user'},
    ...(adminMode ? [{id:'admin',label:'Admin',icon:'lock'}] : []),
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark">
            <div className="brand-mark-inner">P</div>
          </div>
          <div>
            <div className="topbar-title">Porra · Mundial 26</div>
            <div className="topbar-sub">USA · MEX · CAN</div>
          </div>
        </div>
        <LangSelector lang={lang} setLang={setLang}/>
        {user ? (
          <div className="topbar-user" onClick={()=>setTab('me')}>
            <div className="topbar-avatar">{initials(displayName)}</div>
            {myRank && <span className="topbar-rank">#{myRank}</span>}
          </div>
        ) : (
          <button className="btn-acc btn-sm" onClick={()=>setTab('auth')}>
            {t.auth_login}
          </button>
        )}
      </div>

      {/* PAGES */}
      {tab==='home'    && <HomePage    t={t} user={user} matches={matches} leaderboard={leaderboard}
                            onGoAuth={()=>setTab('auth')} onTabChange={setTab}/>}
      {tab==='auth'    && <AuthPage    t={t} lang={lang} setLang={setLang}
                            onVerifying={email=>setVerifyEmail(email)}/>}
      {tab==='predict' && <PredictionsPage t={t} user={user} matches={matches}
                            predictions={predictions} onSave={()=>{loadPredictions();loadLeaderboard();}}
                            onGoAuth={()=>setTab('auth')}/>}
      {tab==='ranking' && <LeaderboardPage t={t} user={user} leaderboard={leaderboard} loading={lbLoading}/>}
      {tab==='bracket' && <BracketPage t={t} matches={matches}/>}
      {tab==='me'      && <ProfilePage t={t} user={user} leaderboard={leaderboard}
                            matches={matches} predictions={predictions}
                            onGoAuth={()=>setTab('auth')} signOut={signOut}/>}
      {tab==='admin'   && <AdminPage   t={t} matches={matches}
                            onMatchUpdated={onRefresh}/>}

      {/* BOTTOM TAB BAR */}
      <nav className="tab-bar">
        {bottomTabs.map(bt=>(
          <button key={bt.id} className={`tab-btn ${tab===bt.id?'on':''}`}
            onClick={()=>setTab(bt.id)}>
            {tab===bt.id && <div className="tab-btn-dot"/>}
            <Icon name={bt.icon} size={22} stroke={tab===bt.id?2.2:1.7}/>
            <span>{bt.label}</span>
          </button>
        ))}
      </nav>

      {/* hidden admin trigger in footer (keep for mobile long-press) */}
      <div style={{textAlign:'center',padding:'6px 16px 4px',color:'rgba(255,255,255,.04)',fontSize:10,userSelect:'none'}}>
        {'Porra Marcadores · Mundial 2026'.split('').map((c,i)=>(
          <span key={i} onClick={()=>handleAdminKey(c)}>{c}</span>
        ))}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
export default App;
