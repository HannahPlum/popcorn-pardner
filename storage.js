// POPCORN PARDNER — storage.js
// Shared localStorage helpers used across all pages.

const STORAGE_KEYS = {
  REVIEWS: 'popcornPardnerReviews',
  WATCHLIST: 'popcornPardnerWatchlist'
};

function getReviews() {
  try {
    const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    // Migrate old reviews that predate the unique id field
    return reviews.map(r => r.id ? r : { ...r, id: `review_${r.loggedAt || Date.now()}` });
  } catch {
    return [];
  }
}

function saveReview(reviewData) {
  const reviews = getReviews();
  reviews.unshift({
    ...reviewData,
    id: `review_${Date.now()}`,
    loggedAt: new Date().toISOString()
  });
  reviews.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

function updateReview(id, changes) {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === id);
  if (index >= 0) {
    reviews[index] = {
      ...reviews[index],
      rating: changes.rating ?? reviews[index].rating,
      reviewText: changes.reviewText ?? reviews[index].reviewText
    };
    reviews.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }
}

function deleteReview(id) {
  const reviews = getReviews().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

// ===== WATCHLIST =====

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
  } catch {
    return [];
  }
}

function addToWatchlist(movieData) {
  const watchlist = getWatchlist();
  if (watchlist.some(item => item.tmdbId === movieData.tmdbId)) return;
  watchlist.unshift({ ...movieData, addedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
}

function removeFromWatchlist(tmdbId) {
  const watchlist = getWatchlist().filter(item => item.tmdbId !== tmdbId);
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
}
