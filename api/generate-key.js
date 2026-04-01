export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

  if (!SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Generate key
  const hex = (n) => [...Array(n)].map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
  const key = `MCHUD-${hex(6)}-${hex(6)}-${hex(6)}`;

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/license_keys`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ key }),
    });

    if (!r.ok) {
      const body = await r.text();
      return res.status(500).json({ error: 'DB error', detail: body });
    }

    return res.status(200).json({ key });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
