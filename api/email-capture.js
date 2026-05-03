const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_KEY) return res.status(200).json({ ok: true, debug: 'no key' });

  const email = (req.body && req.body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const source = (req.body && req.body.source) || 'homepage';

  const r = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_email_signups`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ email, source }),
  }).catch(() => null);

  if (!r) return res.status(500).json({ error: 'db_error' });

  if (r.status === 409 || r.status === 422) {
    // duplicate — treat as success so we don't reveal list membership
    return res.status(200).json({ ok: true });
  }

  if (!r.ok) {
    const body = await r.text().catch(() => '');
    return res.status(500).json({ error: 'db_error', detail: body });
  }

  return res.status(200).json({ ok: true });
}
