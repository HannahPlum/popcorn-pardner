// POPCORN PARDNER — script.js

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  renderMyReviews();
  renderWatchlist();
});

// ===== MY REVIEWS SECTION =====

function renderMyReviews() {
  const reviews = getReviews().slice(0, 6);

  const section = document.getElementById('my-reviews');
  if (!section) return;

  const container = section.querySelector('.container');
  const emptyState = container.querySelector('.empty-state');

  if (reviews.length === 0) {
    const existingGrid = container.querySelector('.results-grid');
    if (existingGrid) existingGrid.remove();
    if (!emptyState) {
      container.appendChild(buildEmptyState());
    }
    return;
  }

  if (emptyState) emptyState.remove();

  // Replace existing grid on re-render
  const existingGrid = container.querySelector('.results-grid');
  if (existingGrid) existingGrid.remove();

  const grid = document.createElement('div');
  grid.className = 'results-grid';

  reviews.forEach(review => {
    const card = buildReviewCard(review);
    card.addEventListener('click', () => openEditModal(review));
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function buildEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  const p = document.createElement('p');
  p.textContent = 'No reviews yet. Search for a film and log your first watch.';
  const a = document.createElement('a');
  a.href = 'search.html';
  a.className = 'btn btn-outline';
  a.textContent = 'Log a Movie';
  div.appendChild(p);
  div.appendChild(a);
  return div;
}

function buildReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.style.cursor = 'pointer';

  // Poster
  const posterDiv = document.createElement('div');
  posterDiv.className = 'movie-poster';

  if (review.posterPath) {
    const img = document.createElement('img');
    img.src = `${TMDB_IMAGE_BASE}${review.posterPath}`;
    img.alt = `${review.title} poster`;
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
  title.textContent = review.title;

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'rating-display';
  ratingDiv.setAttribute('aria-label', `Rated ${review.rating} out of 5 hats`);
  for (let i = 1; i <= 5; i++) {
    const hat = document.createElement('span');
    hat.className = i <= review.rating ? 'hat' : 'hat hat-empty';
    hat.textContent = '🤠';
    ratingDiv.appendChild(hat);
  }

  const date = document.createElement('p');
  date.className = 'review-date';
  const parsedDate = new Date(review.loggedAt);
  date.textContent = isNaN(parsedDate)
    ? 'Unknown date'
    : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const snippet = document.createElement('p');
  snippet.className = 'movie-overview';
  snippet.textContent = review.reviewText;

  infoDiv.appendChild(title);
  infoDiv.appendChild(ratingDiv);
  infoDiv.appendChild(date);
  infoDiv.appendChild(snippet);

  card.appendChild(posterDiv);
  card.appendChild(infoDiv);

  return card;
}

// ===== WATCHLIST SECTION =====

function renderWatchlist() {
  const watchlist = getWatchlist();
  const section = document.getElementById('watchlist');
  if (!section) return;

  const container = section.querySelector('.container');
  const emptyState = container.querySelector('.empty-state');

  if (watchlist.length === 0) {
    const existingGrid = container.querySelector('.results-grid');
    if (existingGrid) existingGrid.remove();
    if (!emptyState) {
      container.appendChild(buildWatchlistEmptyState());
    }
    return;
  }

  if (emptyState) emptyState.remove();

  const existingGrid = container.querySelector('.results-grid');
  if (existingGrid) existingGrid.remove();

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
    renderWatchlist();
  });

  cardActions.appendChild(removeBtn);
  infoDiv.appendChild(title);
  infoDiv.appendChild(cardActions);
  card.appendChild(posterDiv);
  card.appendChild(infoDiv);

  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target === removeBtn) return;
    openLogModal(item);
  });

  return card;
}

function buildWatchlistEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  const p = document.createElement('p');
  p.textContent = 'Your watchlist is empty. Add movies you want to watch later.';
  const a = document.createElement('a');
  a.href = 'search.html';
  a.className = 'btn btn-outline';
  a.textContent = 'Browse Movies';
  div.appendChild(p);
  div.appendChild(a);
  return div;
}

// ===== EDIT MODAL =====

let editingReview = null;
let editSelectedRating = 0;

const editModal = document.getElementById('edit-modal');
const editModalClose = document.getElementById('edit-modal-close');
const editModalCancel = document.getElementById('edit-modal-cancel');
const editModalSave = document.getElementById('edit-modal-save');
const editModalDelete = document.getElementById('edit-modal-delete');
const editReviewTextarea = document.getElementById('edit-review-text');
const editFormError = document.getElementById('edit-form-error');
const editHatButtons = document.querySelectorAll('#edit-hat-rating .hat-btn');

editModalClose.addEventListener('click', closeEditModal);
editModalCancel.addEventListener('click', closeEditModal);
editModalSave.addEventListener('click', saveEditedReview);
editModalDelete.addEventListener('click', deleteEditedReview);

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.hidden) closeEditModal();
});

editHatButtons.forEach((btn, index) => {
  btn.addEventListener('mouseenter', () => highlightEditHats(index + 1));
  btn.addEventListener('mouseleave', () => highlightEditHats(editSelectedRating));
  btn.addEventListener('click', () => {
    editSelectedRating = index + 1;
    highlightEditHats(editSelectedRating);
  });
});

function highlightEditHats(count) {
  editHatButtons.forEach((btn, index) => {
    btn.classList.toggle('hat-active', index < count);
  });
}

function openEditModal(review) {
  editingReview = review;
  editSelectedRating = review.rating;

  document.getElementById('edit-modal-title').textContent = review.title;
  document.getElementById('edit-modal-overview').textContent = review.overview || 'No description available.';

  const posterImg = document.getElementById('edit-modal-poster-img');
  const posterPlaceholder = document.getElementById('edit-modal-poster-placeholder');

  if (review.posterPath) {
    posterImg.src = `${TMDB_IMAGE_BASE}${review.posterPath}`;
    posterImg.alt = `${review.title} poster`;
    posterImg.hidden = false;
    posterPlaceholder.hidden = true;
  } else {
    posterImg.hidden = true;
    posterPlaceholder.hidden = false;
  }

  editReviewTextarea.value = review.reviewText;
  highlightEditHats(editSelectedRating);
  hideEditError();
  editModal.hidden = false;
  document.body.style.overflow = 'hidden';
  editReviewTextarea.focus();
}

function closeEditModal() {
  editModal.hidden = true;
  document.body.style.overflow = '';
  editingReview = null;
  editSelectedRating = 0;
  highlightEditHats(0);
}

function saveEditedReview() {
  if (editSelectedRating === 0) {
    showEditError('Please select a rating.');
    return;
  }
  if (!editReviewTextarea.value.trim()) {
    showEditError('Please write a review before saving.');
    return;
  }

  updateReview(editingReview.id, {
    rating: editSelectedRating,
    reviewText: editReviewTextarea.value.trim()
  });

  closeEditModal();
  renderMyReviews();
}

function deleteEditedReview() {
  deleteReview(editingReview.id);
  closeEditModal();
  renderMyReviews();
}

function showEditError(message) {
  editFormError.textContent = message;
  editFormError.hidden = false;
}

function hideEditError() {
  editFormError.textContent = '';
  editFormError.hidden = true;
}

// ===== LOG MODAL (from watchlist) =====

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
  renderMyReviews();
  renderWatchlist();
}

function showLogError(message) {
  logFormError.textContent = message;
  logFormError.hidden = false;
}

function hideLogError() {
  logFormError.textContent = '';
  logFormError.hidden = true;
}
