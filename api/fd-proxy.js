// GET /api/fd-proxy
// Proxy server-side hacia football-data.org para evitar bloqueo CORS en producción.
// La clave API viaja en cabeceras de servidor, nunca expuesta al navegador.

export default async function handler(req, res) {
  const apiKey = process.env.VITE_FD_KEY;
  if (!apiKey) return res.status(500).json({ error: 'FD_KEY no configurada en el servidor' });

  try {
    const fdRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    );
    const data = await fdRes.json();
    if (!fdRes.ok) return res.status(fdRes.status).json({ error: data?.message || fdRes.status });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
