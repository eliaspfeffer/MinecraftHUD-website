const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

export default async function handler(req, res) {
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_KEY) {
    return res.status(200).json({ error: 'SUPABASE_SERVICE_ROLE_KEY env var is not set' });
  }

  const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

  // Check what columns exist
  const schemaRes = await fetch(
    `${SUPABASE_URL}/rest/v1/minecrafthud_pageviews?limit=1`,
    { headers }
  ).catch(e => ({ ok: false, error: e.message }));

  let columns = null;
  let schemaError = null;
  if (schemaRes.ok) {
    const rows = await schemaRes.json();
    columns = rows.length > 0 ? Object.keys(rows[0]) : 'table exists but empty — column info unavailable';
  } else {
    schemaError = await schemaRes.text?.() || schemaRes.error;
  }

  // Try a test insert
  const testInsert = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_pageviews`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ country: 'TEST', city: 'Debug', path: '/debug', referrer: '', visitor_hash: 'debug-test-000' }),
  }).catch(e => ({ ok: false, status: 'network error', error: e.message }));

  const insertStatus = testInsert.status;
  const insertBody = await testInsert.text?.() || '';

  // Clean up test row
  await fetch(
    `${SUPABASE_URL}/rest/v1/minecrafthud_pageviews?visitor_hash=eq.debug-test-000`,
    { method: 'DELETE', headers }
  ).catch(() => {});

  res.status(200).json({
    envKeySet: !!SUPABASE_KEY,
    keyPrefix: SUPABASE_KEY.slice(0, 8) + '...',
    columns,
    schemaError,
    insertStatus,
    insertBody: insertBody || '(empty — means success)',
  });
}
