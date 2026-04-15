// POPCORN PARDNER — search.js

if (typeof CONFIG === 'undefined') {
  console.error('config.js is not loaded. TMDB credentials are missing.');
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// ===== SEARCH =====

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
    const card = buildMovieCard(movie);
    card.addEventListener('click', () => openModal(movie));
    grid.appendChild(card);
  });

  resultsContainer.appendChild(grid);
}

function buildMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.style.cursor = 'pointer';

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

  const infoDiv = document.createElement('div');
  infoDiv.className = 'movie-info';

  const title = document.createElement('h3');
  title.className = 'movie-title';
  title.textContent = movie.title;

  const overview = document.createElement('p');
  overview.className = 'movie-overview';
  overview.textContent = movie.overview || 'No description available.';

  const cardActions = document.createElement('div');
  cardActions.className = 'card-actions';

  const watchlistBtn = document.createElement('button');
  watchlistBtn.type = 'button';
  watchlistBtn.className = 'watchlist-btn';
  setWatchlistBtnState(watchlistBtn, getWatchlist().some(item => item.tmdbId === movie.id));

  watchlistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const onWatchlist = getWatchlist().some(item => item.tmdbId === movie.id);
    if (onWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path || null,
        overview: movie.overview || ''
      });
      openStreamingModal(movie);
    }
    setWatchlistBtnState(watchlistBtn, !onWatchlist);
  });

  const watchingBtn = document.createElement('button');
  watchingBtn.type = 'button';
  watchingBtn.className = 'watching-btn';
  setWatchingBtnState(watchingBtn, getCurrentlyWatching()?.tmdbId === movie.id);

  watchingBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.watching-btn').forEach(btn => setWatchingBtnState(btn, false));
    setCurrentlyWatching({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path || null,
      overview: movie.overview || ''
    });
    setWatchingBtnState(watchingBtn, true);
  });

  cardActions.appendChild(watchlistBtn);
  cardActions.appendChild(watchingBtn);
  infoDiv.appendChild(title);
  infoDiv.appendChild(overview);
  infoDiv.appendChild(cardActions);
  card.appendChild(posterDiv);
  card.appendChild(infoDiv);

  return card;
}

function setWatchlistBtnState(btn, isOnWatchlist) {
  btn.textContent = isOnWatchlist ? '✓ Watchlisted' : '+ Watchlist';
  btn.classList.toggle('watchlist-btn--active', isOnWatchlist);
}

function setWatchingBtnState(btn, isWatching) {
  btn.textContent = isWatching ? '▶ Watching' : '▶ Watch Now';
  btn.classList.toggle('watching-btn--active', isWatching);
}

function setStatus(message) {
  resultsContainer.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'search-status';
  p.textContent = message;
  resultsContainer.appendChild(p);
}

// ===== LOG MODAL =====

let selectedMovie = null;
let selectedRating = 0;

const modal = document.getElementById('review-modal');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const reviewTextarea = document.getElementById('review-text');
const formError = document.getElementById('form-error');
const hatButtons = document.querySelectorAll('#hat-rating .hat-btn');

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveReviewFromModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

hatButtons.forEach((btn, index) => {
  btn.addEventListener('mouseenter', () => highlightHats(index + 1));
  btn.addEventListener('mouseleave', () => highlightHats(selectedRating));
  btn.addEventListener('click', () => {
    selectedRating = index + 1;
    highlightHats(selectedRating);
  });
});

function highlightHats(count) {
  hatButtons.forEach((btn, index) => {
    btn.classList.toggle('hat-active', index < count);
  });
}

function openModal(movie) {
  selectedMovie = movie;
  selectedRating = 0;

  document.getElementById('modal-movie-title').textContent = movie.title;
  document.getElementById('modal-movie-overview').textContent = movie.overview || 'No description available.';

  const posterImg = document.getElementById('modal-poster-img');
  const posterPlaceholder = document.getElementById('modal-poster-placeholder');

  if (movie.poster_path) {
    posterImg.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
    posterImg.alt = `${movie.title} poster`;
    posterImg.hidden = false;
    posterPlaceholder.hidden = true;
  } else {
    posterImg.hidden = true;
    posterPlaceholder.hidden = false;
  }

  reviewTextarea.value = '';
  highlightHats(0);
  hideError();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  reviewTextarea.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  selectedMovie = null;
  selectedRating = 0;
  highlightHats(0);
}

function saveReviewFromModal() {
  if (selectedRating === 0) {
    showError('Please select a rating before logging.');
    return;
  }
  if (!reviewTextarea.value.trim()) {
    showError('Please write a review before logging.');
    return;
  }

  saveReview({
    tmdbId: selectedMovie.id,
    title: selectedMovie.title,
    posterPath: selectedMovie.poster_path || null,
    overview: selectedMovie.overview || '',
    rating: selectedRating,
    reviewText: reviewTextarea.value.trim()
  });

  closeModal();
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function hideError() {
  formError.textContent = '';
  formError.hidden = true;
}

// ===== STREAMING MODAL =====

const streamingModal = document.getElementById('streaming-modal');
const streamingModalClose = document.getElementById('streaming-modal-close');
const streamingModalDismiss = document.getElementById('streaming-modal-dismiss');
const streamingModalBody = document.getElementById('streaming-modal-body');
const streamingModalTitle = document.getElementById('streaming-modal-title');

streamingModalClose.addEventListener('click', closeStreamingModal);
streamingModalDismiss.addEventListener('click', closeStreamingModal);
streamingModal.addEventListener('click', (e) => {
  if (e.target === streamingModal) closeStreamingModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !streamingModal.hidden) closeStreamingModal();
});

function openStreamingModal(movie) {
  streamingModalTitle.textContent = movie.title;
  streamingModalBody.innerHTML = '<p class="streaming-loading">Wranglin\' up some sources...</p>';
  streamingModal.hidden = false;
  document.body.style.overflow = 'hidden';

  fetchStreamingSources(movie.id).then(sources => {
    renderStreamingSources(sources);
  }).catch(() => {
    renderStreamingSources(null);
  });
}

function closeStreamingModal() {
  streamingModal.hidden = true;
  document.body.style.overflow = '';
}

async function fetchStreamingSources(tmdbId) {
  const cacheKey = `watchmode_sources_${tmdbId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { sources, cachedAt } = JSON.parse(cached);
      if (Date.now() - cachedAt < 7 * 24 * 60 * 60 * 1000) return sources;
    } catch {
      // corrupted cache entry — fall through to fetch
    }
  }

  try {
    const searchRes = await fetch(
      `https://api.watchmode.com/v1/search/?apiKey=${CONFIG.WATCHMODE_API_KEY}&search_field=tmdb_movie_id&search_value=${tmdbId}`
    );
    if (!searchRes.ok) throw new Error(`WatchMode search failed: ${searchRes.status}`);
    const searchData = await searchRes.json();

    const titleResults = searchData.title_results;
    if (!titleResults || titleResults.length === 0) {
      localStorage.setItem(cacheKey, JSON.stringify({ sources: [], cachedAt: Date.now() }));
      return [];
    }

    const watchmodeId = titleResults[0].id;
    const sourcesRes = await fetch(
      `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${CONFIG.WATCHMODE_API_KEY}`
    );
    if (!sourcesRes.ok) throw new Error(`WatchMode sources failed: ${sourcesRes.status}`);
    const sourcesData = await sourcesRes.json();

    const seen = new Set();
    const filtered = sourcesData
      .filter(s => s.type === 'sub' || s.type === 'free')
      .reduce((acc, s) => {
        if (!seen.has(s.name)) {
          seen.add(s.name);
          acc.push({ name: s.name, web_url: s.web_url || null });
        }
        return acc;
      }, []);

    localStorage.setItem(cacheKey, JSON.stringify({ sources: filtered, cachedAt: Date.now() }));
    return filtered;
  } catch (err) {
    console.error('WatchMode error:', err);
    return null;
  }
}

function renderStreamingSources(sources) {
  if (sources === null) {
    streamingModalBody.innerHTML = '<p class="streaming-message">Couldn\'t reach the trail right now, pardner. Try again later.</p>';
    return;
  }
  if (sources.length === 0) {
    streamingModalBody.innerHTML = '<p class="streaming-message">This one ain\'t ridin\' any streaming services right now, pardner.</p>';
    return;
  }

  const pills = sources.map(s =>
    s.web_url
      ? `<a href="${s.web_url}" target="_blank" rel="noopener noreferrer" class="source-pill">${s.name}</a>`
      : `<span class="source-pill">${s.name}</span>`
  ).join('');

  streamingModalBody.innerHTML = `
    <p class="streaming-message">You can lasso this film over at:</p>
    <div class="streaming-sources">${pills}</div>
  `;
}
