// ===== APP ENTRY POINT =====
// IIFE (Immediately Invoked Function Expression):
// Wrapping everything in this pattern means none of our variables
// (like 'allRepos' below) leak into the global 'window' object.
// It runs itself immediately, once, when the script loads.

(function () {
  'use strict';

  // ===== STATE =====
  let allRepos = [];
  let currentLanguageFilter = 'all';
  let currentSort = 'stars-desc';

  const usernameInput = document.getElementById('usernameInput');
  const searchBtn = document.getElementById('searchBtn');
  const languageFilterSelect = document.getElementById('languageFilter');
  const sortSelect = document.getElementById('sortSelect');

  // ===== MAIN SEARCH LOGIC (with rate limiting) =====
  async function handleSearch() {
    const username = usernameInput.value.trim();

    if (!username) {
      showError('Please enter a GitHub username.');
      return;
    }

    // ---- RATE LIMIT CHECK (runs before we touch the API at all) ----
    const rateStatus = registerSearchAttempt(username); // from utils.js

    if (rateStatus.status === 'banned') {
      showWarning(null);
      showError(`Too many searches for "${username}". Try again in ${formatRemainingTime(rateStatus.remainingMs)}.`);
      return; // stop completely — no API call happens
    }

    showError(null);

    if (rateStatus.status === 'warning1') {
      showWarning(`⚠️ Notice: you've searched "${username}" 4 times. (1st warning)`);
    } else if (rateStatus.status === 'warning2') {
      showWarning(`⚠️ Final warning: one more search for "${username}" will block you for 40 minutes.`);
    } else {
      showWarning(null);
    }

    logApi(`Searching for user: ${username}`);
    showControls(false);
    showLoading(true);

    try {
      const repos = await fetchUserRepos(username);
      allRepos = repos;

      logApi(`Received ${repos.length} repos`);

      currentLanguageFilter = 'all';
      currentSort = 'stars-desc';
      sortSelect.value = 'stars-desc';

      const languages = getUniqueLanguages(getLanguageStats(allRepos));
      renderLanguageOptions(languages);

      applyFiltersAndRender();

      showControls(true);
    } catch (error) {
      showError(error.message);
      reposContainer.innerHTML = '';
    } finally {
      showLoading(false);
    }
  }

  // ===== FILTER + SORT PIPELINE =====
  function applyFiltersAndRender() {
    const filterFn = filterByLanguage(currentLanguageFilter);
    const filtered = filterFn(allRepos);

    const sorted = sortRepos(filtered, currentSort);

    logRender(`Rendering ${sorted.length} repos (filter: ${currentLanguageFilter}, sort: ${currentSort})`);

    renderRepos(sorted);

    const totalStars = getTotalStars(sorted);
    console.log(`Total stars in current view: ${totalStars}`);
  }

  // ===== EVENT LISTENERS =====
  searchBtn.addEventListener('click', handleSearch);

  usernameInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  const debouncedSearch = debounce(handleSearch, 500);
  usernameInput.addEventListener('input', debouncedSearch);

  languageFilterSelect.addEventListener('change', function (event) {
    currentLanguageFilter = event.target.value;
    applyFiltersAndRender();
  });

  sortSelect.addEventListener('change', function (event) {
    currentSort = event.target.value;
    applyFiltersAndRender();
  });

  // ===== ARGUMENTS vs PARAMETERS DEMO =====
  function demoArgsVsParams(a, b) {
    console.log('Parameters received:', a, b);
    console.log('Arguments object:', arguments);
    console.log('Total arguments passed:', arguments.length);
  }

  demoArgsVsParams(1, 2, 3, 4);

})(); // ← the ONLY closing brace+parens, at the very end of the file