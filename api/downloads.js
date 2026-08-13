const SUPABASE_URL = 'https://thicmfnkyexgvezdphep.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return res.status(200).json({ count: 0, configured: false });
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  try {
    if (req.method === 'POST') {
      const ua = req.headers['user-agent'] || '';
      if (!/bot|crawl|spider|prerender|lighthouse/i.test(ua)) {
        const source = typeof req.body?.source === 'string' ? req.body.source.slice(0, 40) : 'website';
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_downloads`, {
          method: 'POST', headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ source }),
        });
        if (!insertResponse.ok) throw new Error(`Download insert failed: ${insertResponse.status}`);
      }
    } else if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_downloads?select=id`, {
      method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' },
    });
    const range = countResponse.headers.get('content-range') || '*/0';
    const count = Number(range.split('/')[1]) || 0;
    if (!countResponse.ok) throw new Error(`Download count failed: ${countResponse.status}`);
    return res.status(200).json({ count, configured: true });
  } catch (_) {
    return res.status(200).json({ count: 0, configured: false });
  }
}
