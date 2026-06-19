-- phase_tiebreaker.sql
-- Knockout-stage tiebreaker view for the leaderboard.
-- When two players are tied on total points (incl. award bonus),
-- the one with more points earned from quarterfinals onwards wins.
-- Run in Supabase SQL editor for project kvdtuogpkpklnqmbcjvo.

CREATE OR REPLACE VIEW leaderboard_tb AS
SELECT
  p.user_id,
  SUM(
    -- Goal-acertado: 0.5 per side
    (CASE WHEN p.home_goals = m.home_goals THEN 0.5 ELSE 0 END) +
    (CASE WHEN p.away_goals = m.away_goals THEN 0.5 ELSE 0 END) +
    -- Result V/E/D: +1 if winner side matches
    (CASE
      WHEN SIGN(p.home_goals - p.away_goals) = SIGN(m.home_goals - m.away_goals)
      THEN 1 ELSE 0
    END) +
    -- Exact match: +1
    (CASE
      WHEN p.home_goals = m.home_goals AND p.away_goals = m.away_goals
      THEN 1 ELSE 0
    END)
  )::numeric AS tb_pts
FROM predictions p
JOIN matches m ON m.id = p.match_id
WHERE m.status = 'finished'
  AND m.home_goals IS NOT NULL
  AND m.away_goals IS NOT NULL
  AND m.phase IN ('qf','sf','3rd','final')
GROUP BY p.user_id;
