// Cached GitHub stats: release download counts + star count
// In-memory cache survives warm Vercel instance restarts; CDN cache handles cold starts.
let cache = null;
let cacheExpiry = 0;

const RELEASES_REPO = 'eliaspfeffer/MinecraftHUD-releases';
const CACHE_TTL_MS  = 60 * 60 * 1000; // 1 hour

export default async function handler(req, res) {
  const now = Date.now();

  if (cache && now < cacheExpiry) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.json(cache);
  }

  try {
    const headers = { 'User-Agent': 'PixelHUD-website/1.0' };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [releasesRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${RELEASES_REPO}/releases`, { headers }),
      fetch(`https://api.github.com/repos/${RELEASES_REPO}`,          { headers }),
    ]);

    const [releases, repo] = await Promise.all([
      releasesRes.json(),
      repoRes.json(),
    ]);

    let downloads = 0;
    if (Array.isArray(releases)) {
      for (const release of releases) {
        for (const asset of release.assets || []) {
          downloads += asset.download_count || 0;
        }
      }
    }

    const stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;

    cache = { downloads, stars };
    cacheExpiry = now + CACHE_TTL_MS;

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.json(cache);
  } catch {
    // Return stale cache or zeroes; don't surface errors to visitors
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.json(cache || { downloads: 0, stars: 0 });
  }
}
