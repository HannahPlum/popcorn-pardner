// POPCORN PARDNER — api/tmdb.js
// Edge Function proxy for TMDB API. Keeps the Bearer token server-side.
//
// GET /api/tmdb?action=search&query=inception
// GET /api/tmdb?action=images&id=27205

export const config = { runtime: 'edge' };

const TMDB_BASE = 'https://api.themoviedb.org/3';

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const token = process.env.TMDB_READ_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: 'TMDB token not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let tmdbUrl;

  if (action === 'search') {
    const query = searchParams.get('query');
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    tmdbUrl = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`;

  } else if (action === 'images') {
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    tmdbUrl = `${TMDB_BASE}/movie/${id}/images`;

  } else {
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const tmdbRes = await fetch(tmdbUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await tmdbRes.json();

  return new Response(JSON.stringify(data), {
    status: tmdbRes.status,
    headers: { 'Content-Type': 'application/json' }
  });
}
