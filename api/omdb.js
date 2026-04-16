// POPCORN PARDNER — api/omdb.js
// Edge Function proxy for OMDb API. Keeps the API key server-side.
//
// GET /api/omdb?title=Inception&year=2010

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OMDb key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const params = new URLSearchParams({ apikey: apiKey, t: title, type: 'movie' });
  if (year) params.set('y', year);

  const omdbRes = await fetch(`https://www.omdbapi.com/?${params}`);
  const data = await omdbRes.json();

  return new Response(JSON.stringify(data), {
    status: omdbRes.status,
    headers: { 'Content-Type': 'application/json' }
  });
}
