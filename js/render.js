// ===== RENDER LAYER =====
// This file only touches the DOM. It receives already-processed data
// (filtered/sorted/calculated) and displays it. No API calls, no data logic here.

const reposContainer = document.getElementById('reposContainer');

function renderRepos(repos) {
  // Clear previous results before rendering new ones
  reposContainer.innerHTML = '';

  if (repos.length === 0) {
    reposContainer.innerHTML = `<p class="no-results">No repositories match this filter.</p>`;
    return;
  }

  // for...of: loops over ARRAY VALUES directly (cleaner than a classic for-loop
  // when you don't need the index)
  for (const repo of repos) {
    const card = createRepoCard(repo); // build one card
    reposContainer.appendChild(card);  // add it to the page
  }
}

// Builds a single repo card element using a template literal
function createRepoCard(repo) {
  const card = document.createElement('div');
  card.className = 'repo-card';

  // Template literal: lets us embed variables directly with ${} instead of
  // messy string concatenation ('...' + repo.name + '...')
  card.innerHTML = `
    <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
    <p>${repo.description ? repo.description : 'No description provided.'}</p>
    <div class="repo-meta">
      <span>⭐ ${repo.stargazers_count}</span>
      <span>🍴 ${repo.forks_count}</span>
      <span>${repo.language ? repo.language : 'Unknown'}</span>
    </div>
  `;

  return card;
}

// Populates the <select id="languageFilter"> options based on available languages
function renderLanguageOptions(languages) {
  const select = document.getElementById('languageFilter');

  // reset to just the "All" option before repopulating
  select.innerHTML = `<option value="all">All</option>`;

  // forEach: another way to loop over an array, when we don't need to
  // return anything - just perform an action per item
  languages.forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    select.appendChild(option);
  });
}

// ===== UI STATE HELPERS =====
// Small, single-purpose functions for toggling visibility.
// Kept here since they directly manipulate the DOM.

function showLoading(isLoading) {
  const loadingEl = document.getElementById('loadingMsg');
  loadingEl.classList.toggle('hidden', !isLoading);
}

function showError(message) {
  const errorEl = document.getElementById('errorMsg');
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  } else {
    errorEl.classList.add('hidden');
  }
}

function showControls(shouldShow) {
  const controls = document.getElementById('controls');
  controls.classList.toggle('hidden', !shouldShow);
}

function showWarning(message) {
  const warningEl = document.getElementById('warningMsg');
  if (message) {
    warningEl.textContent = message;
    warningEl.classList.remove('hidden');
  } else {
    warningEl.classList.add('hidden');
  }
}