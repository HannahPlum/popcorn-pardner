// POPCORN PARDNER — fanart.js
// Shared poster picker (TMDB alternate images) — loaded on index.html and reviews.html

const TMDB_IMAGE_BASE_FANART = 'https://image.tmdb.org/t/p/w500';

function getPosterUrl(posterPath) {
  if (!posterPath) return null;
  return posterPath.startsWith('http')
    ? posterPath
    : `${TMDB_IMAGE_BASE_FANART}${posterPath}`;
}

// ===== FANART PICKER MODAL =====

let fanartReview = null;
let fanartOnSave = null;

const fanartModal = document.getElementById('fanart-modal');
const fanartModalClose = document.getElementById('fanart-modal-close');
const fanartModalBody = document.getElementById('fanart-modal-body');
const fanartModalTitle = document.getElementById('fanart-modal-title');

fanartModalClose.addEventListener('click', closeFanartPicker);
fanartModal.addEventListener('click', (e) => {
  if (e.target === fanartModal) closeFanartPicker();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !fanartModal.hidden) closeFanartPicker();
});

function openFanartPicker(review, onSave) {
  fanartReview = review;
  fanartOnSave = onSave;
  fanartModalTitle.textContent = review.title;
  fanartModalBody.innerHTML = '<p class="streaming-loading">Fetchin\' some art, pardner...</p>';
  fanartModal.hidden = false;
  document.body.style.overflow = 'hidden';

  fetchFanartPosters(review.tmdbId).then(posters => {
    renderFanartPosters(posters);
  }).catch(() => {
    renderFanartPosters(null);
  });
}

function closeFanartPicker() {
  fanartModal.hidden = true;
  document.body.style.overflow = '';
  fanartReview = null;
  fanartOnSave = null;
}

async function fetchFanartPosters(tmdbId) {
  const cacheKey = `fanart_posters_${tmdbId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { posters, cachedAt } = JSON.parse(cached);
      if (Date.now() - cachedAt < 24 * 60 * 60 * 1000) return posters;
    } catch {
      // corrupted cache — fall through to fetch
    }
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/images`,
    { headers: { Authorization: `Bearer ${CONFIG.TMDB_READ_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`TMDB images failed: ${res.status}`);
  const data = await res.json();

  const posters = (data.posters || [])
    .sort((a, b) => b.vote_average - a.vote_average)
    .map(p => `${TMDB_IMAGE_BASE_FANART}${p.file_path}`);

  localStorage.setItem(cacheKey, JSON.stringify({ posters, cachedAt: Date.now() }));
  return posters;
}

function renderFanartPosters(posters) {
  if (posters === null) {
    fanartModalBody.innerHTML = '<p class="streaming-message">Couldn\'t wrangle any art right now, pardner.</p>';
    return;
  }
  if (posters.length === 0) {
    fanartModalBody.innerHTML = '<p class="streaming-message">No alternative posters found for this film.</p>';
    return;
  }

  const subtitle = document.createElement('p');
  subtitle.className = 'fanart-subtitle';
  subtitle.textContent = 'Pick a poster from the fan artwork below:';

  const grid = document.createElement('div');
  grid.className = 'fanart-grid';

  posters.forEach(url => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fanart-option';
    btn.setAttribute('aria-label', 'Select this poster');

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';

    btn.appendChild(img);
    btn.addEventListener('click', () => selectFanartPoster(url));
    grid.appendChild(btn);
  });

  fanartModalBody.innerHTML = '';
  fanartModalBody.appendChild(subtitle);
  fanartModalBody.appendChild(grid);
}

function selectFanartPoster(url) {
  updateReview(fanartReview.id, { posterPath: url });
  const onSave = fanartOnSave;
  closeFanartPicker();
  if (onSave) onSave();
}
