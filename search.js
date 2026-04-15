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
const modalReviewBtn = document.getElementById('modal-review-btn');
const modalForm = document.getElementById('review-modal-form');
const reviewTextarea = document.getElementById('review-text');
const formError = document.getElementById('form-error');
const hatButtons = document.querySelectorAll('#hat-rating .hat-btn');

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveReviewFromModal);
modalReviewBtn.addEventListener('click', () => {
  modalReviewBtn.hidden = true;
  modalForm.hidden = false;
  reviewTextarea.focus();
});

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

  const omdbDiv = document.getElementById('modal-omdb-info');
  omdbDiv.innerHTML = '';
  const year = movie.release_date ? movie.release_date.substring(0, 4) : null;
  fetchOmdbData(movie.id, movie.title, year).then(data => renderOmdbInfo(omdbDiv, data));

  const streamingDiv = document.getElementById('modal-streaming-info');
  streamingDiv.innerHTML = '';
  fetchStreamingSources(movie.id)
    .then(sources => renderStreamingInline(streamingDiv, sources))
    .catch(() => {});

  modalForm.hidden = true;
  modalReviewBtn.hidden = false;
  reviewTextarea.value = '';
  highlightHats(0);
  hideError();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  modalForm.hidden = true;
  modalReviewBtn.hidden = false;
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

// ===== STREAMING INFO =====

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

function renderStreamingInline(container, sources) {
  container.innerHTML = '';
  if (!sources || sources.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'streaming-inline-label';
    msg.textContent = 'Not currently streaming anywhere, pardner.';
    container.appendChild(msg);
    return;
  }

  const label = document.createElement('p');
  label.className = 'streaming-inline-label';
  label.textContent = 'Available to stream:';

  const pillsDiv = document.createElement('div');
  pillsDiv.className = 'streaming-sources';

  sources.forEach(s => {
    let el;
    if (s.web_url) {
      el = document.createElement('a');
      el.href = s.web_url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el = document.createElement('span');
    }
    el.className = 'source-pill';
    el.textContent = s.name;
    pillsDiv.appendChild(el);
  });

  container.appendChild(label);
  container.appendChild(pillsDiv);
}
