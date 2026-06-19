# Award Predictions — Design Spec
# PorraMundialDani

**Date:** 2026-06-03  
**Status:** Approved

---

## Overview

Add a new "Premios" section to the Pronósticos tab where participants can predict 5 award winners before the tournament starts. Each correct prediction earns **+5 pts**, calculated in the frontend and displayed in the ranking.

## Categories

| Key               | Label              | Type   | Icon    |
|-------------------|--------------------|--------|---------|
| `champion`        | Equipo Campeón     | team   | trophy  |
| `top_scorer`      | Máximo Goleador    | player | boot    |
| `mvp`             | MVP                | player | star    |
| `best_goalkeeper` | Mejor Portero      | player | glove   |
| `best_player`     | Mejor Jugador      | player | medal   |

---

## Database

### Table: `award_predictions`
```sql
CREATE TABLE award_predictions (
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
```

### Table: `award_winners`
```sql
CREATE TABLE award_winners (
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
*(Admin PIN in the UI is the security gate for writes.)*

---

## Frontend

### Constants (near top of App.jsx)

```js
const AWARD_BONUS = 5;

const AWARD_CONFIG = [
  { key:'champion',        label:'Equipo Campeón',  icon:'trophy', type:'team'   },
  { key:'top_scorer',      label:'Máximo Goleador', icon:'boot',   type:'player' },
  { key:'mvp',             label:'MVP',             icon:'star',   type:'player' },
  { key:'best_goalkeeper', label:'Mejor Portero',   icon:'glove',  type:'player' },
  { key:'best_player',     label:'Mejor Jugador',   icon:'medal',  type:'player' },
];

// tournament teams (keys of COUNTRIES)
const AWARD_TEAMS = Object.keys(COUNTRIES).sort();

// players per category — see player lists below
const AWARD_PLAYERS = { top_scorer: [...], mvp: [...], best_goalkeeper: [...], best_player: [...] };
```

**Player lists:**
- `top_scorer`: 73 players (provided by user)
- `mvp`: 28 players (provided by user)
- `best_player`: same as `mvp` list
- `best_goalkeeper`: ~20 goalkeepers from tournament teams (defined in code)
- `champion`: all tournament teams from `COUNTRIES`

**Goalkeeper list** (hardcoded):
Alisson (Brazil), Éderson (Brazil), Manuel Neuer (Germany), Marc-André ter Stegen (Germany), David Raya (Spain), Unai Simón (Spain), Mike Maignan (France), Gianluigi Donnarumma (not in tournament — omit), Gregor Kobel (Switzerland), Yann Sommer (Switzerland), Jordan Pickford (England), Dean Henderson (England), Andriy Lunin (no, not in tournament), Diogo Costa (Portugal), Rui Patrício (Portugal), Emiliano Martínez (Argentina), Geronimo Rulli (Argentina), Alireza Beiranvand (Iran), Mathew Ryan (Australia), Samir Handanović-style for Bosnia — Vedran Ćosić, Bart Verbruggen (Netherlands), Jan Oblak (not in tournament), Bono/Yassine Bounou (Morocco), Edouard Mendy (Senegal).

### Lock condition

Awards are editable while `isBeforeDeadline(firstMatchDeadline)`:
```js
const firstMatchDeadline = matches.length > 0
  ? matches.reduce((min, m) => m.deadline && (!min || m.deadline < min) ? m.deadline : min, null)
  : null;
const awardsOpen = firstMatchDeadline ? isBeforeDeadline(firstMatchDeadline) : true;
```

### AwardSection component

Renders **only in `view === 'predict'`** inside PredictionsPage, at the bottom, after the match list.

Layout per category:
```
[icon] Máximo Goleador       [select dropdown or locked value]
```

- **Open state:** `<select>` with options sorted alphabetically (for teams), or grouped by team (for players). Placeholder: `— Elige —`.
- **Locked state:** shows selected value (or `—` if not set) with a subtle lock icon.
- Save: on `onChange`, immediately upsert to `award_predictions`. Show inline `✅` for 500ms.
- If no user → show login CTA (same pattern as PredictionsPage).

### AdminPage — Premios section

New card at the bottom of AdminPage, after the match list section.

```
┌─────────────────────────────────────────┐
│ 🏆 Ganadores de Premios                 │
│                                         │
│ Equipo Campeón    [select] [Guardar]    │
│ Máximo Goleador   [select] [Guardar]    │
│ MVP               [select] [Guardar]    │
│ Mejor Portero     [select] [Guardar]    │
│ Mejor Jugador     [select] [Guardar]    │
└─────────────────────────────────────────┘
```

Each row has its own save button. Calls `supabase.from('award_winners').upsert({category, value}, {onConflict:'category'})`.

### Leaderboard — bonus integration

In `LeaderboardPage` and `HomePage` (my position card), the displayed total = `row.total_pts + awardBonus(row.user_id)`.

```js
// In App(), alongside loadLeaderboard:
const [awardPreds, setAwardPreds] = useState([]);
const [awardWinners, setAwardWinners] = useState([]);

const loadAwards = useCallback(async () => {
  const [{ data: preds }, { data: winners }] = await Promise.all([
    supabase.from('award_predictions').select('*'),
    supabase.from('award_winners').select('*'),
  ]);
  setAwardPreds(preds || []);
  setAwardWinners(winners || []);
}, []);
```

Bonus calculation helper (used in LeaderboardPage):
```js
function calcAwardBonus(userId, awardPreds, awardWinners) {
  return awardWinners
    .filter(w => w.value != null)
    .reduce((sum, w) => {
      const pred = awardPreds.find(p => p.user_id === userId && p.category === w.category);
      return sum + (pred?.value === w.value ? AWARD_BONUS : 0);
    }, 0);
}
```

**In LeaderboardPage:** sort leaderboard by `(total_pts + awardBonus)` descending (only when `awardWinners` has at least one non-null entry). Show award bonus as a small chip: `+Xpts 🏆` next to the points.

**In HomePage** (my position card): add award bonus to displayed pts.

---

## i18n additions

```js
award_section_title: 'Premios del Torneo',
award_locked:        'Premios cerrados',
award_pick_team:     '— Elige equipo —',
award_pick_player:   '— Elige jugador —',
award_saved:         '✅',
award_bonus_label:   '+{n} premios',
admin_awards_title:  'Ganadores de Premios',
admin_awards_save:   'Guardar',
admin_awards_saved:  'Guardado ✓',
```
(same keys in `en` and `pt`)

---

## Supabase migration file

`supabase/migrations/phase_awards.sql` — the two CREATE TABLE statements above, ready to paste in the SQL editor.

---

## Out of scope

- No changes to the `leaderboard` VIEW (frontend-only calculation)
- No changes to existing `predictions`, `matches`, or RPC functions
- No pagination of player list (≤100 items per category, native `<select>` is fine)
- No deadline change for award predictions (same as first match)
