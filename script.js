// POPCORN PARDNER — script.js

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  renderMyReviews();
});

// ===== MY REVIEWS SECTION =====

function renderMyReviews() {
  const reviews = getReviews().slice(0, 6);

  const section = document.getElementById('my-reviews');
  if (!section) return;

  const container = section.querySelector('.container');
  const emptyState = container.querySelector('.empty-state');

  if (reviews.length === 0) {
    if (!emptyState) {
      const empty = buildEmptyState();
      container.appendChild(empty);
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
