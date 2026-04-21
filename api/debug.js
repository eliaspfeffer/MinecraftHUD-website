const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

export default async function handler(req, res) {
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_KEY) return res.status(200).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  // Find the table via RPC (bypasses schema cache issue)
  const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, { headers }).catch(() => null);

  // Query information_schema directly via RPC
  const schemaCheckRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  }).catch(() => null);

  // Check purchases table
  const purchasesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/purchases?select=status,created_at&limit=5`,
    { headers }
  ).catch(() => null);
  const purchasesStatus = purchasesRes?.status;
  const purchasesBody = await purchasesRes?.text() || 'fetch failed';

  // Try inserting directly with service role via raw SQL endpoint
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/minecrafthud_pageviews`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ country: 'DE', city: 'Test', path: '/debug', referrer: '', visitor_hash: 'dbg-' + Date.now() }),
  }).catch(() => null);
  const sqlStatus = sqlRes?.status;
  const sqlBody = await sqlRes?.text() || 'fetch failed';

  // Try reading the table
  const readRes = await fetch(
    `${SUPABASE_URL}/rest/v1/minecrafthud_pageviews?limit=1`,
    { headers }
  ).catch(() => null);
  const readStatus = readRes?.status;
  const readBody = await readRes?.text() || 'fetch failed';

  res.status(200).json({
    insertStatus: sqlStatus,
    insertBody: sqlBody,
    readStatus,
    readBody,
    purchasesStatus,
    purchasesSample: purchasesBody,
  });
}
