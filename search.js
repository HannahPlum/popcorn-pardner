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

  infoDiv.appendChild(title);
  infoDiv.appendChild(overview);
  card.appendChild(posterDiv);
  card.appendChild(infoDiv);

  return card;
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
