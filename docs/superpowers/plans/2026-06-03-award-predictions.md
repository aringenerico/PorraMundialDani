# Award Predictions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5-category award predictions (+5 pts each) to PorraMundialDani — selection UI in Pronósticos, admin winner panel, ranking integration.

**Architecture:** Two new Supabase tables (`award_predictions`, `award_winners`), all frontend-computed bonus, single-file App.jsx edits.

**Tech Stack:** React 19, Supabase JS client, existing Icon component, native `<select>` elements.

---

## Task 1: Supabase migration

**Files:**
- Create: `supabase/migrations/phase_awards.sql`

- [ ] **Step 1: Create migration file**

```sql
-- phase_awards.sql
-- Run in Supabase SQL editor for project kvdtuogpkpklnqmbcjvo

CREATE TABLE IF NOT EXISTS award_predictions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN ('champion','top_scorer','mvp','best_goalkeeper','best_player')),
  value       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);
ALTER TABLE award_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ap_select_all"  ON award_predictions FOR SELECT USING (true);
CREATE POLICY "ap_insert_own"  ON award_predictions FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ap_update_own"  ON award_predictions FOR UPDATE  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS award_winners (
  id          BIGSERIAL PRIMARY KEY,
  category    TEXT NOT NULL UNIQUE CHECK (category IN ('champion','top_scorer','mvp','best_goalkeeper','best_player')),
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE award_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aw_select_all"  ON award_winners FOR SELECT USING (true);
CREATE POLICY "aw_upsert_auth" ON award_winners FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "aw_update_auth" ON award_winners FOR UPDATE  TO authenticated USING (true);
```

- [ ] **Step 2: Inform user to run in Supabase SQL editor**

Print/note: "Execute `supabase/migrations/phase_awards.sql` in the Supabase SQL editor for project kvdtuogpkpklnqmbcjvo before continuing."

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/phase_awards.sql
git commit -m "feat: add award_predictions and award_winners tables"
```

---

## Task 2: App.jsx — constants block

**Files:**
- Modify: `src/App.jsx` (constants section, after the SCORING block, around line 102)

- [ ] **Step 1: Read lines 92–105 of App.jsx to confirm insert point**

Find the `// ─── SCORING ─────` comment and insert the new constants block right after the `calcScore` function closes (around line 103).

- [ ] **Step 2: Insert AWARD_BONUS, AWARD_CONFIG, AWARD_TEAMS, AWARD_PLAYERS constants**

Insert after line 103 (closing `};` of `calcScore`):

```js
// ─── AWARD PREDICTIONS ────────────────────────────────────────────────────────
const AWARD_BONUS = 5;

const AWARD_CONFIG = [
  { key:'champion',        label:'Equipo Campeón',  icon:'trophy', type:'team'   },
  { key:'top_scorer',      label:'Máximo Goleador', icon:'boot',   type:'player' },
  { key:'mvp',             label:'MVP',             icon:'star',   type:'player' },
  { key:'best_goalkeeper', label:'Mejor Portero',   icon:'glove',  type:'player' },
  { key:'best_player',     label:'Mejor Jugador',   icon:'medal',  type:'player' },
];

const AWARD_TEAMS = Object.keys(COUNTRIES).sort((a,b) => a.localeCompare(b));

const AWARD_PLAYERS = {
  top_scorer: [
    {name:'Kylian Mbappé',team:'France'},{name:'Erling Haaland',team:'Norway'},
    {name:'Harry Kane',team:'England'},{name:'Lautaro Martínez',team:'Argentina'},
    {name:'Julián Álvarez',team:'Argentina'},{name:'Vinicius Jr',team:'Brazil'},
    {name:'Raphinha',team:'Brazil'},{name:'Endrick',team:'Brazil'},
    {name:'Cristiano Ronaldo',team:'Portugal'},{name:'Gonçalo Ramos',team:'Portugal'},
    {name:'Álvaro Morata',team:'Spain'},{name:'Ferran Torres',team:'Spain'},
    {name:'Lamine Yamal',team:'Spain'},{name:'Kai Havertz',team:'Germany'},
    {name:'Florian Wirtz',team:'Germany'},{name:'Jamal Musiala',team:'Germany'},
    {name:'Marcus Thuram',team:'France'},{name:'Randal Kolo Muani',team:'France'},
    {name:'Memphis Depay',team:'Netherlands'},{name:'Cody Gakpo',team:'Netherlands'},
    {name:'Donyell Malen',team:'Netherlands'},{name:'Romelu Lukaku',team:'Belgium'},
    {name:'Lois Openda',team:'Belgium'},{name:'Darwin Núñez',team:'Uruguay'},
    {name:'Rodrigo Bentancur',team:'Uruguay'},{name:'Luis Díaz',team:'Colombia'},
    {name:'Jhon Durán',team:'Colombia'},{name:'Jhon Arias',team:'Colombia'},
    {name:'Hakim Ziyech',team:'Morocco'},{name:'Youssef En-Nesyri',team:'Morocco'},
    {name:'Hirving Lozano',team:'Mexico'},{name:'Santiago Giménez',team:'Mexico'},
    {name:'Raúl Jiménez',team:'Mexico'},{name:'Christian Pulisic',team:'USA'},
    {name:'Folarin Balogun',team:'USA'},{name:'Ricardo Pepi',team:'USA'},
    {name:'Jonathan David',team:'Canada'},{name:'Cyle Larin',team:'Canada'},
    {name:'Alphonso Davies',team:'Canada'},{name:'Takumi Minamino',team:'Japan'},
    {name:'Kaoru Mitoma',team:'Japan'},{name:'Ayase Ueda',team:'Japan'},
    {name:'Breel Embolo',team:'Switzerland'},{name:'Noah Okafor',team:'Switzerland'},
    {name:'Marko Arnautović',team:'Austria'},{name:'Michael Gregoritsch',team:'Austria'},
    {name:'Enner Valencia',team:'Ecuador'},{name:'Moisés Caicedo',team:'Ecuador'},
    {name:'Son Heung-min',team:'South Korea'},{name:'Hwang Hee-chan',team:'South Korea'},
    {name:'Cho Gue-sung',team:'South Korea'},{name:'Mehdi Taremi',team:'Iran'},
    {name:'Sardar Azmoun',team:'Iran'},{name:'Martin Boyle',team:'Australia'},
    {name:'Mathew Leckie',team:'Australia'},{name:'Miguel Almirón',team:'Paraguay'},
    {name:'Antonio Sanabria',team:'Paraguay'},{name:'Omar Marmoush',team:'Egypt'},
    {name:'Mostafa Mohamed',team:'Egypt'},{name:'Mohamed Salah',team:'Egypt'},
    {name:'Riyad Mahrez',team:'Algeria'},{name:'Said Benrahma',team:'Algeria'},
    {name:'Wahbi Khazri',team:'Tunisia'},{name:'Hannibal Mejbri',team:'Tunisia'},
    {name:'Arda Güler',team:'Turkey'},{name:'Kenan Yıldız',team:'Turkey'},
    {name:'Edin Džeko',team:'Bosnia and Herzegovina'},
    {name:'Ermedin Demirović',team:'Bosnia and Herzegovina'},
    {name:'Pedro de la Vega',team:'Panama'},
    {name:'Adama Traoré',team:'Ivory Coast'},{name:'Sébastien Haller',team:'Ivory Coast'},
    {name:'Jordan Ayew',team:'Ghana'},{name:'Mohammed Kudus',team:'Ghana'},
  ],
  mvp: [
    {name:'Kylian Mbappé',team:'France'},{name:'Vinicius Jr',team:'Brazil'},
    {name:'Jude Bellingham',team:'England'},{name:'Lamine Yamal',team:'Spain'},
    {name:'Pedri',team:'Spain'},{name:'Rodri',team:'Spain'},
    {name:'Lionel Messi',team:'Argentina'},{name:'Alexis Mac Allister',team:'Argentina'},
    {name:'Enzo Fernández',team:'Argentina'},{name:'Cristiano Ronaldo',team:'Portugal'},
    {name:'Bruno Fernandes',team:'Portugal'},{name:'Bernardo Silva',team:'Portugal'},
    {name:'Erling Haaland',team:'Norway'},{name:'Florian Wirtz',team:'Germany'},
    {name:'Jamal Musiala',team:'Germany'},{name:'Joshua Kimmich',team:'Germany'},
    {name:'Kevin De Bruyne',team:'Belgium'},{name:'Antoine Griezmann',team:'France'},
    {name:'Ousmane Dembélé',team:'France'},{name:'Aurélien Tchouaméni',team:'France'},
    {name:'Harry Kane',team:'England'},{name:'Bukayo Saka',team:'England'},
    {name:'Declan Rice',team:'England'},{name:'Trent Alexander-Arnold',team:'England'},
    {name:'Raphinha',team:'Brazil'},{name:'Rodrygo',team:'Brazil'},
    {name:'Federico Valverde',team:'Uruguay'},
  ],
  best_goalkeeper: [
    {name:'Alisson',team:'Brazil'},{name:'Éderson',team:'Brazil'},
    {name:'Manuel Neuer',team:'Germany'},{name:'Marc-André ter Stegen',team:'Germany'},
    {name:'David Raya',team:'Spain'},{name:'Unai Simón',team:'Spain'},
    {name:'Mike Maignan',team:'France'},{name:'Alphonse Areola',team:'France'},
    {name:'Jordan Pickford',team:'England'},{name:'Dean Henderson',team:'England'},
    {name:'Diogo Costa',team:'Portugal'},{name:'Rui Patrício',team:'Portugal'},
    {name:'Emiliano Martínez',team:'Argentina'},{name:'Geronimo Rulli',team:'Argentina'},
    {name:'Bart Verbruggen',team:'Netherlands'},{name:'Mark Flekken',team:'Netherlands'},
    {name:'Gregor Kobel',team:'Switzerland'},{name:'Yann Sommer',team:'Switzerland'},
    {name:'Bono',team:'Morocco'},{name:'Edouard Mendy',team:'Senegal'},
    {name:'Alireza Beiranvand',team:'Iran'},{name:'Mathew Ryan',team:'Australia'},
    {name:'Andrés Cubas',team:'Paraguay'},{name:'Guillermo Ochoa',team:'Mexico'},
    {name:'Turner Matt',team:'USA'},{name:'Maxime Crépeau',team:'Canada'},
  ],
  get best_player() { return this.mvp; },
};
```

- [ ] **Step 3: Verify constants are correct**

Open App.jsx and confirm the block was inserted without syntax errors. Check that `AWARD_PLAYERS.best_player` correctly aliases `mvp` list.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add AWARD_BONUS, AWARD_CONFIG and AWARD_PLAYERS constants"
```

---

## Task 3: App.jsx — i18n strings

**Files:**
- Modify: `src/App.jsx` (LANGS object, es/en/pt sections)

- [ ] **Step 1: Read current end of `es` section** to find the last key before `}` close

The `es` block ends around line 192. Find the last key (likely `lb_me_pin` or similar) and append after it.

- [ ] **Step 2: Add award strings to `es` block**

After the last existing key in the `es` section (before closing `}`):

```js
    award_section_title: 'Premios del Torneo',
    award_locked:        'Premios cerrados antes del inicio del torneo',
    award_pick_team:     '— Elige equipo —',
    award_pick_player:   '— Elige jugador —',
    award_saved:         '✅',
    award_bonus_label:   '+{n} premios',
    admin_awards_title:  'Ganadores de Premios',
    admin_awards_save:   'Guardar',
    admin_awards_saved:  'Guardado ✓',
```

- [ ] **Step 3: Add award strings to `en` block**

```js
    award_section_title: 'Tournament Awards',
    award_locked:        'Awards locked before tournament starts',
    award_pick_team:     '— Pick team —',
    award_pick_player:   '— Pick player —',
    award_saved:         '✅',
    award_bonus_label:   '+{n} awards',
    admin_awards_title:  'Award Winners',
    admin_awards_save:   'Save',
    admin_awards_saved:  'Saved ✓',
```

- [ ] **Step 4: Add award strings to `pt` block**

```js
    award_section_title: 'Prêmios do Torneio',
    award_locked:        'Prêmios encerrados antes do início do torneio',
    award_pick_team:     '— Escolha o time —',
    award_pick_player:   '— Escolha o jogador —',
    award_saved:         '✅',
    award_bonus_label:   '+{n} prêmios',
    admin_awards_title:  'Vencedores dos Prêmios',
    admin_awards_save:   'Salvar',
    admin_awards_saved:  'Salvo ✓',
```

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add award i18n strings to all three languages"
```

---

## Task 4: App.jsx — calcAwardBonus helper + AwardSection component

**Files:**
- Modify: `src/App.jsx` (insert before PredictionsPage function, around line 1625)

- [ ] **Step 1: Read lines 1620–1630 to confirm insert point**

Find `// PAGE: PREDICTIONS` comment and insert the helper + component right before it.

- [ ] **Step 2: Insert `calcAwardBonus` helper**

```js
// ─── AWARD HELPERS ────────────────────────────────────────────────────────────
function calcAwardBonus(userId, awardPreds, awardWinners) {
  return awardWinners
    .filter(w => w.value != null)
    .reduce((sum, w) => {
      const pred = awardPreds.find(p => p.user_id === userId && p.category === w.category);
      return sum + (pred?.value === w.value ? AWARD_BONUS : 0);
    }, 0);
}
```

- [ ] **Step 3: Insert `AwardSection` component**

```js
// ─── COMPONENT: AWARD SECTION ────────────────────────────────────────────────
function AwardSection({ t, user, awardPreds, awardWinners, awardsOpen, onGoAuth }) {
  const [localPreds, setLocalPreds] = useState(() => {
    const m = {};
    awardPreds.filter(p => p.user_id === user?.id).forEach(p => { m[p.category] = p.value; });
    return m;
  });
  const [flash, setFlash] = useState({});

  useEffect(() => {
    const m = {};
    awardPreds.filter(p => p.user_id === user?.id).forEach(p => { m[p.category] = p.value; });
    setLocalPreds(m);
  }, [awardPreds, user]);

  const handleChange = async (category, value) => {
    setLocalPreds(prev => ({ ...prev, [category]: value }));
    const { error } = await supabase.from('award_predictions')
      .upsert({ user_id: user.id, category, value }, { onConflict: 'user_id,category' });
    if (!error) {
      setFlash(f => ({ ...f, [category]: true }));
      setTimeout(() => setFlash(f => ({ ...f, [category]: false })), 1200);
    }
  };

  const winners = {};
  awardWinners.forEach(w => { winners[w.category] = w.value; });
  const hasWinners = awardWinners.some(w => w.value != null);

  if (!user) return (
    <div style={{padding:'16px',textAlign:'center',marginTop:8}}>
      <p style={{color:'var(--mut)',fontSize:13,marginBottom:10}}>{t.login_required}</p>
      <button className="btn-acc btn-sm" onClick={onGoAuth}>{t.auth_login} / {t.auth_register}</button>
    </div>
  );

  return (
    <div style={{padding:'8px 16px 0'}}>
      <div style={{fontWeight:700,fontSize:13,textTransform:'uppercase',letterSpacing:'.08em',
                   color:'var(--mut)',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
        <Icon name="trophy" size={14} color="var(--gold)" stroke={2}/>
        {t.award_section_title}
      </div>

      {AWARD_CONFIG.map(({ key, label, icon, type }) => {
        const myPred   = localPreds[key] || '';
        const winner   = winners[key];
        const isCorrect = hasWinners && winner && myPred === winner;
        const isWrong   = hasWinners && winner && myPred && myPred !== winner;
        const options   = type === 'team'
          ? AWARD_TEAMS
          : (AWARD_PLAYERS[key] || []).map(p => p.name);

        return (
          <div key={key} style={{
            display:'flex', alignItems:'center', gap:10, padding:'9px 0',
            borderBottom:'1px solid var(--line)',
          }}>
            <Icon name={icon} size={16} color="var(--gold)" stroke={2}/>
            <div style={{flex:1,fontSize:13,fontWeight:600}}>{label}</div>

            {awardsOpen ? (
              <div style={{position:'relative',display:'flex',alignItems:'center',gap:6}}>
                <select
                  value={myPred}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{
                    fontSize:12,padding:'5px 8px',borderRadius:8,
                    background:'var(--surface)',border:'1px solid var(--line)',
                    color: myPred ? 'var(--txt)' : 'var(--mut)', cursor:'pointer',
                    maxWidth:160,
                  }}
                >
                  <option value="">{type==='team' ? t.award_pick_team : t.award_pick_player}</option>
                  {type === 'player'
                    ? AWARD_PLAYERS[key]?.map(p => (
                        <option key={p.name} value={p.name}>
                          {flag(p.team)} {p.name}
                        </option>
                      ))
                    : AWARD_TEAMS.map(tm => (
                        <option key={tm} value={tm}>{flag(tm)} {tm}</option>
                      ))
                  }
                </select>
                {flash[key] && <span style={{fontSize:14}}>{t.award_saved}</span>}
              </div>
            ) : (
              <div style={{
                fontSize:12, color: isCorrect ? 'var(--green)' : isWrong ? 'var(--coral)' : 'var(--mut)',
                display:'flex', alignItems:'center', gap:4,
              }}>
                {myPred ? (
                  <>
                    {type === 'team' ? flag(myPred) : ''} {myPred}
                    {isCorrect && ' ✅'}
                    {isWrong && ` ✗ (${winner})`}
                  </>
                ) : '—'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add calcAwardBonus helper and AwardSection component"
```

---

## Task 5: App.jsx — Wire AwardSection into PredictionsPage

**Files:**
- Modify: `src/App.jsx` (PredictionsPage function signature + return JSX)

- [ ] **Step 1: Read PredictionsPage signature and return block**

Find `function PredictionsPage({` (around line 1627) and the closing `</div>` of the return at line ~1780.

- [ ] **Step 2: Add awardPreds, awardWinners, awardsOpen, onGoAuth to props**

Change:
```js
function PredictionsPage({ t, user, matches, predictions, onSave, onGoAuth, onOpenDetail }) {
```
To:
```js
function PredictionsPage({ t, user, matches, predictions, onSave, onGoAuth, onOpenDetail,
                           awardPreds, awardWinners, awardsOpen }) {
```

- [ ] **Step 3: Insert AwardSection at end of predict view**

Just before the closing `</div>` of the return (before `{/* Sticky save bar */}` or at the very end of `<div className="page">`), add:

```jsx
{/* Award predictions */}
{view === 'predict' && (
  <AwardSection
    t={t} user={user}
    awardPreds={awardPreds} awardWinners={awardWinners}
    awardsOpen={awardsOpen}
    onGoAuth={onGoAuth}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate AwardSection into PredictionsPage"
```

---

## Task 6: App.jsx — Admin awards panel

**Files:**
- Modify: `src/App.jsx` (AdminPage function, after match list section)

- [ ] **Step 1: Read end of AdminPage return block**

Find the closing `</div>` of `function AdminPage` (around line 3302) and identify where to append the new awards card.

- [ ] **Step 2: Add awardWinners + setAwardWinners props to AdminPage**

Change:
```js
function AdminPage({ t, matches, onMatchUpdated }) {
```
To:
```js
function AdminPage({ t, matches, onMatchUpdated, awardWinners, onAwardWinnersChange }) {
```

- [ ] **Step 3: Add local award winner state inside AdminPage**

After the existing `useState` declarations at the top of AdminPage:
```js
const [adminAwards, setAdminAwards] = useState(() => {
  const m = {};
  awardWinners.forEach(w => { m[w.category] = w.value || ''; });
  return m;
});
const [awardSaved, setAwardSaved] = useState({});
```

Also add a `useEffect` to sync when `awardWinners` prop changes:
```js
useEffect(() => {
  const m = {};
  awardWinners.forEach(w => { m[w.category] = w.value || ''; });
  setAdminAwards(m);
}, [awardWinners]);
```

- [ ] **Step 4: Add saveAward handler**

```js
const saveAward = async (category) => {
  const value = adminAwards[category];
  if (!value) return;
  const { error } = await supabase.from('award_winners')
    .upsert({ category, value }, { onConflict: 'category' });
  if (!error) {
    setAwardSaved(s => ({ ...s, [category]: 'ok' }));
    onAwardWinnersChange();
    setTimeout(() => setAwardSaved(s => ({ ...s, [category]: null })), 2500);
  }
};
```

- [ ] **Step 5: Insert awards card in JSX, at end of AdminPage return, before closing `</div>`**

```jsx
{/* AWARDS */}
<div className="card" style={{marginTop:16,padding:'12px 16px'}}>
  <div style={{fontWeight:700,fontSize:14,marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
    <Icon name="trophy" size={16} color="var(--gold)" stroke={2}/>
    {t.admin_awards_title}
  </div>
  {AWARD_CONFIG.map(({ key, label, icon, type }) => {
    const options = type === 'team' ? AWARD_TEAMS : (AWARD_PLAYERS[key] || []).map(p => p.name);
    return (
      <div key={key} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',
                              borderBottom:'1px solid var(--line)'}}>
        <Icon name={icon} size={14} color="var(--gold)" stroke={2}/>
        <div style={{flex:1,fontSize:13,fontWeight:600}}>{label}</div>
        <select
          value={adminAwards[key] || ''}
          onChange={e => setAdminAwards(a => ({...a,[key]:e.target.value}))}
          style={{fontSize:12,padding:'4px 8px',borderRadius:6,
                  background:'var(--surface)',border:'1px solid var(--line)',color:'var(--txt)',maxWidth:160}}
        >
          <option value="">{type==='team' ? t.award_pick_team : t.award_pick_player}</option>
          {type === 'player'
            ? AWARD_PLAYERS[key]?.map(p => (
                <option key={p.name} value={p.name}>{flag(p.team)} {p.name}</option>
              ))
            : AWARD_TEAMS.map(tm => (
                <option key={tm} value={tm}>{flag(tm)} {tm}</option>
              ))
          }
        </select>
        <button
          className="btn-acc btn-sm"
          onClick={() => saveAward(key)}
          style={{minWidth:64,fontSize:11}}
        >
          {awardSaved[key] === 'ok' ? t.admin_awards_saved : t.admin_awards_save}
        </button>
      </div>
    );
  })}
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add awards winner panel to AdminPage"
```

---

## Task 7: App.jsx — App() state, loaders, and prop wiring

**Files:**
- Modify: `src/App.jsx` (App function: state, callbacks, JSX prop passing)

- [ ] **Step 1: Read App() state block (around line 3307–3357)**

Confirm current state declarations and useEffect calls.

- [ ] **Step 2: Add awardPreds and awardWinners state + loadAwards callback**

After `const [detailMatchId, setDetailMatchId] = useState(null);`:

```js
const [awardPreds,   setAwardPreds]   = useState([]);
const [awardWinners, setAwardWinners] = useState([]);
```

After `const loadLeaderboard = useCallback(...)`:

```js
const loadAwards = useCallback(async () => {
  const [{ data: preds }, { data: winners }] = await Promise.all([
    supabase.from('award_predictions').select('*'),
    supabase.from('award_winners').select('*'),
  ]);
  setAwardPreds(preds || []);
  setAwardWinners(winners || []);
}, []);
```

After `useEffect(()=>{ loadLeaderboard(); },[loadLeaderboard]);`:

```js
useEffect(() => { loadAwards(); }, [loadAwards]);
```

- [ ] **Step 3: Add awardsOpen computed value**

After the `const t = LANGS[lang];` line:

```js
const firstMatchDeadline = matches.length > 0
  ? matches.reduce((min, m) => m.deadline && (!min || m.deadline < min) ? m.deadline : min, null)
  : null;
const awardsOpen = firstMatchDeadline ? isBeforeDeadline(firstMatchDeadline) : true;
```

- [ ] **Step 4: Wire props into PredictionsPage JSX**

Find the `{tab==='predict' && <PredictionsPage` line (around line 3468) and add the new props:

```jsx
{tab==='predict' && <PredictionsPage t={t} user={user} matches={matches}
                      predictions={predictions} onSave={()=>{loadPredictions();loadLeaderboard();}}
                      onGoAuth={()=>setTab('auth')}
                      onOpenDetail={id => setDetailMatchId(id)}
                      awardPreds={awardPreds} awardWinners={awardWinners}
                      awardsOpen={awardsOpen}/>}
```

- [ ] **Step 5: Wire props into AdminPage JSX**

Find the `{tab==='admin'` line and add the new props:

```jsx
{tab==='admin' && adminMode && <AdminPage t={t} matches={matches}
                    onMatchUpdated={onRefresh}
                    awardWinners={awardWinners}
                    onAwardWinnersChange={loadAwards}/>}
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire award state and props through App root"
```

---

## Task 8: App.jsx — LeaderboardPage bonus display

**Files:**
- Modify: `src/App.jsx` (LeaderboardPage function)

- [ ] **Step 1: Read LeaderboardPage signature and row rendering (around line 2237–2400)**

Find the component signature and the place where `row.total_pts` is displayed (in podium and list rows).

- [ ] **Step 2: Add awardPreds + awardWinners props to LeaderboardPage**

Change:
```js
function LeaderboardPage({ t, user, leaderboard: leaderboardProp, loading, matches }) {
```
To:
```js
function LeaderboardPage({ t, user, leaderboard: leaderboardProp, loading, matches, awardPreds, awardWinners }) {
```

- [ ] **Step 3: Add computed totals map inside the component**

After the `const leaderboard = filteredData ?? leaderboardProp;` line, add:

```js
const hasWinners = awardWinners.some(w => w.value != null);
const totalWithBonus = (userId) => {
  const row = leaderboard.find(r => r.user_id === userId);
  const base = row?.total_pts ?? 0;
  return base + (hasWinners ? calcAwardBonus(userId, awardPreds, awardWinners) : 0);
};
const sortedLeaderboard = hasWinners
  ? [...leaderboard].sort((a,b) => totalWithBonus(b.user_id) - totalWithBonus(a.user_id))
  : leaderboard;
const top3 = sortedLeaderboard.slice(0, 3);
const rest = sortedLeaderboard.slice(3);
```

Replace existing `const top3 = leaderboard.slice(0,3);` and `const rest = leaderboard.slice(3);` with the above (they are already declared; just replace).

- [ ] **Step 4: Update all points displays to use totalWithBonus**

In the component JSX, find every instance of `row.total_pts` (there are ~3: podium, list rows, and my position) and replace with `totalWithBonus(row.user_id)`.

Also find `leaderboard[0].total_pts` or any leader reference and use `totalWithBonus(leaderboard[0].user_id)`.

- [ ] **Step 5: Add award bonus chip in list row**

In the list row rendering (the part that renders each player after top3), find where pts are shown and add a small chip when bonus > 0:

```jsx
{hasWinners && calcAwardBonus(row.user_id, awardPreds, awardWinners) > 0 && (
  <span style={{fontSize:10,color:'var(--gold)',marginLeft:4}}>
    +{calcAwardBonus(row.user_id, awardPreds, awardWinners)}{t.pts} 🏆
  </span>
)}
```

- [ ] **Step 6: Wire awardPreds + awardWinners into LeaderboardPage call in App JSX**

Find `{tab==='ranking' && <LeaderboardPage` and add:

```jsx
{tab==='ranking' && <LeaderboardPage t={t} user={user} leaderboard={leaderboard}
                      loading={lbLoading} matches={matches}
                      awardPreds={awardPreds} awardWinners={awardWinners}/>}
```

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate award bonus into leaderboard total and display"
```

---

## Task 9: App.jsx — HomePage my-position bonus

**Files:**
- Modify: `src/App.jsx` (HomePage function, my position card)

- [ ] **Step 1: Read HomePage props and my-position section (around line 1188–1280)**

Find where `myRow.total_pts` is displayed in the my-position card.

- [ ] **Step 2: Add awardPreds + awardWinners to HomePage props**

```js
function HomePage({ t, user, matches, predictions, leaderboard, onGoAuth, onTabChange, awardPreds, awardWinners }) {
```

- [ ] **Step 3: Replace total_pts display with bonus-aware value in my-position card**

Find `myRow.total_pts` or `myRow?.total_pts` in the home page and replace with:

```js
(myRow.total_pts + calcAwardBonus(myRow.user_id, awardPreds, awardWinners))
```

- [ ] **Step 4: Wire props in App JSX**

```jsx
{tab==='home' && <HomePage t={t} user={user} matches={matches} leaderboard={leaderboard}
                   predictions={predictions}
                   onGoAuth={()=>setTab('auth')} onTabChange={setTab}
                   awardPreds={awardPreds} awardWinners={awardWinners}/>}
```

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add award bonus to homepage my-position display"
```

---

## Task 10: Final verification and deploy

- [ ] **Step 1: Run the app locally**

```bash
npm run dev
```

Check for console errors.

- [ ] **Step 2: Manual smoke test checklist**

1. Navigate to Pronósticos tab → verify "Premios del Torneo" section appears below match list
2. Select a value for each of the 5 categories → verify ✅ flash appears
3. Reload → verify selections are persisted (loaded from DB)
4. Open Admin tab (enter PIN) → verify "Ganadores de Premios" section appears with all 5 categories
5. Set a winner in admin → verify it saves → go back to Pronósticos → verify correct prediction shows correct indicator
6. Open Ranking tab → verify award bonus appears next to player who guessed correctly

- [ ] **Step 3: Verify `AWARD_PLAYERS.best_player` getter doesn't cause infinite loop**

In browser console: `AWARD_PLAYERS.best_player === AWARD_PLAYERS.mvp` should be `true`.

If the getter pattern causes issues (some environments don't support `get` in object literals), replace with:
```js
const AWARD_PLAYERS = { ..., best_player: null };
AWARD_PLAYERS.best_player = AWARD_PLAYERS.mvp;
```

- [ ] **Step 4: Deploy**

```bash
git push origin main
```

(Or whatever branch/deploy flow the project uses.)

- [ ] **Step 5: Remind user to run SQL migration**

If not already done: execute `supabase/migrations/phase_awards.sql` in the Supabase SQL editor for project `kvdtuogpkpklnqmbcjvo`.
