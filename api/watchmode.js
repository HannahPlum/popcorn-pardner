// POPCORN PARDNER — api/watchmode.js
// Edge Function proxy for WatchMode API. Keeps the API key server-side.
//
// GET /api/watchmode?action=search&tmdbId=27205
// GET /api/watchmode?action=sources&watchmodeId=1350564

export const config = { runtime: 'edge' };

const WATCHMODE_BASE = 'https://api.watchmode.com/v1';

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const apiKey = process.env.WATCHMODE_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'WatchMode key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'search') {
    const tmdbId = searchParams.get('tmdbId');
    if (!tmdbId) {
      return new Response(JSON.stringify({ error: 'Missing tmdbId param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch(
      `${WATCHMODE_BASE}/search/?apiKey=${apiKey}&search_field=tmdb_movie_id&search_value=${tmdbId}`
    );
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } else if (action === 'sources') {
    const watchmodeId = searchParams.get('watchmodeId');
    if (!watchmodeId) {
      return new Response(JSON.stringify({ error: 'Missing watchmodeId param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch(
      `${WATCHMODE_BASE}/title/${watchmodeId}/sources/?apiKey=${apiKey}`
    );
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } else {
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
