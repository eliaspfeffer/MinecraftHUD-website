import { createHash } from 'crypto';

const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_KEY) return res.status(200).json({ ok: true });

  const ip       = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
  const referrer = (req.body && req.body.referrer) || '';
  const path     = (req.body && req.body.path)     || '/';
  const ua       = req.headers['user-agent']       || '';

  if (/bot|crawl|spider|prerender|lighthouse/i.test(ua)) {
    return res.status(200).json({ ok: true });
  }

  let lat     = null;
  let lng     = null;
  let city    = decodeURIComponent(req.headers['x-vercel-ip-city'] || '');
  let country = req.headers['x-vercel-ip-country'] || 'Unknown';

  if (ip) {
    try {
      const geoRes = await fetch(`https://ipwho.is/${ip}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.success && geo.latitude && geo.longitude) {
          lat     = geo.latitude;
          lng     = geo.longitude;
          city    = geo.city         || city;
          country = geo.country_code || country;
        }
      }
    } catch (_) {}
  }

  if (!lat) {
    lat = parseFloat(req.headers['x-vercel-ip-latitude'])  || null;
    lng = parseFloat(req.headers['x-vercel-ip-longitude']) || null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash('sha256')
    .update(ip + ua + today + 'mchud-salt-2025')
    .digest('hex')
    .slice(0, 16);

  try {
    const check = await fetch(
      `${SUPABASE_URL}/rest/v1/minecrafthud_pageviews?visitor_hash=eq.${visitorHash}&select=id&limit=1`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await check.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(200).json({ ok: true, duplicate: true });
    }
  } catch (_) {}

  const r = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_pageviews`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ country, city, lat, lng, path, referrer, visitor_hash: visitorHash }),
  }).catch(() => null);

  if (r && r.status === 400) {
    await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_pageviews`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ country, city, path, referrer }),
    }).catch(() => {});
  }

  res.status(200).json({ ok: true });
}
