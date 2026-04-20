function flag(code) {
  if (!code || code === 'Unknown') return '🌍';
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

const NAMES = {
  DE:'Germany', US:'United States', GB:'United Kingdom', FR:'France', NL:'Netherlands',
  AT:'Austria', CH:'Switzerland', ES:'Spain', IT:'Italy', PL:'Poland', SE:'Sweden',
  DK:'Denmark', NO:'Norway', FI:'Finland', BE:'Belgium', PT:'Portugal', CA:'Canada',
  AU:'Australia', BR:'Brazil', IN:'India', SG:'Singapore', AE:'UAE', JP:'Japan',
  KR:'South Korea', CN:'China', MX:'Mexico', ZA:'South Africa', NG:'Nigeria',
  RU:'Russia', UA:'Ukraine', AR:'Argentina', CL:'Chile', TR:'Turkey', IL:'Israel',
};

const SUPABASE_URL = 'https://eczgwwpesnjlvwqrelzz.supabase.co';

export default async function handler(req, res) {
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_KEY) {
    return res.status(200).json({
      total: 0, today: 0, yesterday: 0, totalPurchases: 0,
      countries: [], daily: [], points: [], configured: false,
    });
  }

  try {
    const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

    const [viewsRes, purchasesRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/minecrafthud_pageviews?select=country,city,lat,lng,created_at&order=created_at.desc&limit=50000`,
        { headers }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/purchases?select=platform,created_at,status&order=created_at.desc&limit=10000`,
        { headers }
      ),
    ]);

    const views     = viewsRes.ok     ? await viewsRes.json()     : [];
    const purchases = purchasesRes.ok ? await purchasesRes.json() : [];

    if (!Array.isArray(views)) throw new Error('bad response from pageviews');

    const total = views.length;

    const todayStr     = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today     = views.filter(v => v.created_at?.startsWith(todayStr)).length;
    const yesterday = views.filter(v => v.created_at?.startsWith(yesterdayStr)).length;

    const validPurchases = Array.isArray(purchases)
      ? purchases.filter(p => p.status === 'Completed' || p.status === 'completed')
      : [];
    const totalPurchases = validPurchases.length;

    // Last 30-day purchase activity for "active users" signal
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const recentPurchases = validPurchases.filter(p => p.created_at >= thirtyDaysAgo).length;

    const cc = {};
    views.forEach(v => { const c = v.country || 'Unknown'; cc[c] = (cc[c] || 0) + 1; });
    const countries = Object.entries(cc)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([code, count]) => ({
        code,
        name: NAMES[code] || code,
        flag: flag(code),
        count,
        pct: Math.round(count / total * 100),
      }));

    const dc = {};
    views.forEach(v => {
      const d = v.created_at?.slice(0, 10);
      if (d) dc[d] = (dc[d] || 0) + 1;
    });
    const daily = Object.entries(dc)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));

    const points = views
      .filter(v => v.lat && v.lng)
      .map(v => ({ lat: v.lat, lng: v.lng, city: v.city || '', country: v.country || '' }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      total, today, yesterday, totalPurchases, recentPurchases,
      countries, daily, points, configured: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
