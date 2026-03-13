// POPCORN PARDNER — watchlist.js

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  renderAllWatchlist();
});

function renderAllWatchlist() {
  const watchlist = getWatchlist();
  const container = document.getElementById('watchlist-container');
  if (!container) return;

  container.innerHTML = '';

  if (watchlist.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const p = document.createElement('p');
    p.textContent = 'Your watchlist is empty. Add movies you want to watch later.';
    const a = document.createElement('a');
    a.href = 'search.html';
    a.className = 'btn btn-outline';
    a.textContent = 'Browse Movies';
    empty.appendChild(p);
    empty.appendChild(a);
    container.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'results-grid';

  watchlist.forEach(item => {
    grid.appendChild(buildWatchlistCard(item));
  });

  container.appendChild(grid);
}

function buildWatchlistCard(item) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  const posterDiv = document.createElement('div');
  posterDiv.className = 'movie-poster';

  if (item.posterPath) {
    const img = document.createElement('img');
    img.src = `${TMDB_IMAGE_BASE}${item.posterPath}`;
    img.alt = `${item.title} poster`;
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
  title.textContent = item.title;

  const cardActions = document.createElement('div');
  cardActions.className = 'card-actions';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'watchlist-btn watchlist-btn--remove';
  removeBtn.textContent = '✕ Remove';
  removeBtn.addEventListener('click', () => {
    removeFromWatchlist(item.tmdbId);
    renderAllWatchlist();
  });

  cardActions.appendChild(removeBtn);
  infoDiv.appendChild(title);
  infoDiv.appendChild(cardActions);
  card.appendChild(posterDiv);
  card.appendChild(infoDiv);

  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-actions')) return;
    openLogModal(item);
  });

  return card;
}

// ===== LOG MODAL =====

let logMovie = null;
let logSelectedRating = 0;

const logModal = document.getElementById('log-modal');
const logModalClose = document.getElementById('log-modal-close');
const logModalCancel = document.getElementById('log-modal-cancel');
const logModalSave = document.getElementById('log-modal-save');
const logReviewTextarea = document.getElementById('log-review-text');
const logFormError = document.getElementById('log-form-error');
const logHatButtons = document.querySelectorAll('#log-hat-rating .hat-btn');

logModalClose.addEventListener('click', closeLogModal);
logModalCancel.addEventListener('click', closeLogModal);
logModalSave.addEventListener('click', saveFromLogModal);

logModal.addEventListener('click', (e) => {
  if (e.target === logModal) closeLogModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !logModal.hidden) closeLogModal();
});

logHatButtons.forEach((btn, index) => {
  btn.addEventListener('mouseenter', () => highlightLogHats(index + 1));
  btn.addEventListener('mouseleave', () => highlightLogHats(logSelectedRating));
  btn.addEventListener('click', () => {
    logSelectedRating = index + 1;
    highlightLogHats(logSelectedRating);
  });
});

function highlightLogHats(count) {
  logHatButtons.forEach((btn, index) => {
    btn.classList.toggle('hat-active', index < count);
  });
}

function openLogModal(item) {
  logMovie = item;
  logSelectedRating = 0;

  document.getElementById('log-modal-title').textContent = item.title;
  document.getElementById('log-modal-overview').textContent = item.overview || 'No description available.';

  const posterImg = document.getElementById('log-modal-poster-img');
  const posterPlaceholder = document.getElementById('log-modal-poster-placeholder');

  if (item.posterPath) {
    posterImg.src = `${TMDB_IMAGE_BASE}${item.posterPath}`;
    posterImg.alt = `${item.title} poster`;
    posterImg.hidden = false;
    posterPlaceholder.hidden = true;
  } else {
    posterImg.hidden = true;
    posterPlaceholder.hidden = false;
  }

  logReviewTextarea.value = '';
  highlightLogHats(0);
  hideLogError();
  logModal.hidden = false;
  document.body.style.overflow = 'hidden';
  logReviewTextarea.focus();
}

function closeLogModal() {
  logModal.hidden = true;
  document.body.style.overflow = '';
  logMovie = null;
  logSelectedRating = 0;
  highlightLogHats(0);
}

function saveFromLogModal() {
  if (logSelectedRating === 0) {
    showLogError('Please select a rating before logging.');
    return;
  }
  if (!logReviewTextarea.value.trim()) {
    showLogError('Please write a review before logging.');
    return;
  }

  saveReview({
    tmdbId: logMovie.tmdbId,
    title: logMovie.title,
    posterPath: logMovie.posterPath || null,
    overview: logMovie.overview || '',
    rating: logSelectedRating,
    reviewText: logReviewTextarea.value.trim()
  });

  removeFromWatchlist(logMovie.tmdbId);
  closeLogModal();
  renderAllWatchlist();
}

function showLogError(message) {
  logFormError.textContent = message;
  logFormError.hidden = false;
}

function hideLogError() {
  logFormError.textContent = '';
  logFormError.hidden = true;
}
