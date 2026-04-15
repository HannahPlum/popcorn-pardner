// POPCORN PARDNER — omdb.js
// Shared OMDb fetch + render — loaded on search.html, index.html, reviews.html

async function fetchOmdbData(tmdbId, title, year) {
  const cacheKey = `omdb_${tmdbId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, cachedAt } = JSON.parse(cached);
      if (Date.now() - cachedAt < 30 * 24 * 60 * 60 * 1000) return data;
    } catch {
      // corrupted cache — fall through to fetch
    }
  }

  try {
    const params = new URLSearchParams({ apikey: CONFIG.OMDB_API_KEY, t: title, type: 'movie' });
    if (year) params.set('y', year);

    const res = await fetch(`https://www.omdbapi.com/?${params}`);
    if (!res.ok) throw new Error(`OMDb failed: ${res.status}`);
    const raw = await res.json();

    if (raw.Response === 'False') {
      localStorage.setItem(cacheKey, JSON.stringify({ data: null, cachedAt: Date.now() }));
      return null;
    }

    const rtRating   = (raw.Ratings || []).find(r => r.Source === 'Rotten Tomatoes');
    const imdbRating = (raw.Ratings || []).find(r => r.Source === 'Internet Movie Database');

    const data = {
      rt:      rtRating?.Value   || null,
      imdb:    imdbRating?.Value || null,
      rated:   raw.Rated   !== 'N/A' ? raw.Rated   : null,
      runtime: raw.Runtime !== 'N/A' ? raw.Runtime : null
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));
    return data;
  } catch (err) {
    console.error('OMDb error:', err);
    return null;
  }
}

function renderOmdbInfo(container, data) {
  container.innerHTML = '';
  if (!data) return;

  const parts = [];
  if (data.rt)      parts.push(`🍅 ${data.rt}`);
  if (data.imdb)    parts.push(`⭐ ${data.imdb}`);
  if (data.rated)   parts.push(data.rated);
  if (data.runtime) parts.push(data.runtime);

  if (parts.length === 0) return;

  parts.forEach(text => {
    const pill = document.createElement('span');
    pill.className = 'omdb-pill';
    pill.textContent = text;
    container.appendChild(pill);
  });
}
