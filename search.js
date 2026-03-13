// POPCORN PARDNER — search.js

if (typeof CONFIG === 'undefined') {
  console.error('config.js is not loaded. TMDB credentials are missing.');
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultsContainer = document.getElementById('search-results');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  await searchMovies(query);
});

async function searchMovies(query) {
  setStatus('Searching...');

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${CONFIG.TMDB_READ_TOKEN}`
        }
      }
    );

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      setStatus('No movies found. Try a different search.');
      return;
    }

    renderResults(data.results);
  } catch (err) {
    setStatus('Something went wrong. Please try again.');
    console.error(err);
  }
}

function renderResults(movies) {
  resultsContainer.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'results-grid';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Poster
    const posterDiv = document.createElement('div');
    posterDiv.className = 'movie-poster';

    if (movie.poster_path) {
      const img = document.createElement('img');
      img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      img.alt = `${movie.title} poster`;
      img.loading = 'lazy';
      posterDiv.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'poster-placeholder';
      placeholder.textContent = 'No Image';
      posterDiv.appendChild(placeholder);
    }

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info';

    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.title;

    const overview = document.createElement('p');
    overview.className = 'movie-overview';
    overview.textContent = movie.overview || 'No description available.';

    infoDiv.appendChild(title);
    infoDiv.appendChild(overview);

    card.appendChild(posterDiv);
    card.appendChild(infoDiv);
    grid.appendChild(card);
  });

  resultsContainer.appendChild(grid);
}

function setStatus(message) {
  resultsContainer.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'search-status';
  p.textContent = message;
  resultsContainer.appendChild(p);
}
