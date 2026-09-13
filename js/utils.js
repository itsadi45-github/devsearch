// ===== PURE FUNCTIONS =====
// A pure function: given the same input, ALWAYS returns the same output,
// and does NOT modify anything outside itself (no side effects).

// Calculates total stars across an array of repos
function getTotalStars(repos) {
  // reduce: takes an array and "reduces" it down to a single value
  // accumulator (total) starts at 0, we add each repo's stars to it
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

// Returns a NEW sorted array (does not mutate the original 'repos' array)
function sortRepos(repos, sortType) {
  // spread operator [...repos] copies the array so .sort() doesn't mutate the original
  // this is important for a pure function - never mutate the input
  const sorted = [...repos];

  switch (sortType) {
    case "stars-desc":
      return sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    case "stars-asc":
      return sorted.sort((a, b) => a.stargazers_count - b.stargazers_count);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

// ===== CURRYING =====
// Currying: instead of one function taking multiple arguments at once,
// we take them ONE AT A TIME, each call returning a new function,
// until all arguments are collected.
//
// Why useful here? We can create a reusable "filter by language" function
// pre-configured for a specific language, without rewriting filter logic each time.

function filterByLanguage(language) {
  // this OUTER function takes the language first...
  return function (repos) {
    // ...and returns an INNER function that takes the repos array
    if (language === "all") return repos; // no filtering needed
    return repos.filter((repo) => repo.language === language);
  };
}

// USAGE EXAMPLE (for when we wire this up in app.js):
// const filterJS = filterByLanguage('JavaScript');   // returns a function
// const jsRepos = filterJS(allRepos);                // now call it with repos

// ===== CALL, BIND, APPLY =====
// These control what "this" refers to inside a function.
// Real use case here: a small logger utility, so every log message
// automatically includes a "context" (like a namespace/module name).

function logMessage(message) {
  // 'this' here will refer to whatever object we call/bind/apply with
  console.log(`[${this.context}] ${message}`);
}

const apiLogger = { context: "API" };
const renderLogger = { context: "RENDER" };

// call(): invokes the function immediately, passing 'this' as first argument
// logMessage.call(apiLogger, 'Fetching user data...');
// → logs: "[API] Fetching user data..."

// apply(): same as call, but arguments are passed as an ARRAY
// logMessage.apply(apiLogger, ['Fetching user data...']);
// → same output as above, difference only matters with multiple arguments

// bind(): does NOT invoke immediately — returns a NEW function with 'this' locked in
const logApi = logMessage.bind(apiLogger);
const logRender = logMessage.bind(renderLogger);
// later: logApi('Data received') → "[API] Data received"
//        logRender('Card created') → "[RENDER] Card created"

// ===== HIGHER ORDER FUNCTION: DEBOUNCE =====
// A higher-order function is a function that takes another function as an
// argument and/or RETURNS a function. Debounce does both patterns here.
//
// Why we need it: if a user types fast in the search box, we don't want
// to fire an API call on every keystroke. Debounce waits until the user
// STOPS typing for a bit, then runs the function once.

function debounce(callback, delay) {
  let timerId; // kept alive via closure between calls

  // this returned function is what actually gets attached to the input's event listener
  return function (...args) {
    // arguments vs parameters note:
    // '...args' here is a REST PARAMETER (modern syntax) that collects
    // whatever arguments are passed in, as a real array.
    // Older JS code used the special 'arguments' object instead, which behaves
    // similar but is NOT a real array and doesn't exist in arrow functions.

    clearTimeout(timerId); // cancel the previous pending call
    timerId = setTimeout(() => {
      callback.apply(this, args); // run the actual function after the delay
    }, delay);
  };
}

// ===== EXTRACTING LANGUAGE STATS =====
// Builds an object like: { JavaScript: 5, Python: 2, HTML: 1 }

function getLanguageStats(repos) {
  return repos.reduce((stats, repo) => {
    const lang = repo.language || "Unknown"; // some repos have no language set
    stats[lang] = (stats[lang] || 0) + 1;
    return stats;
  }, {});
}

// Example of 'for...in' loop usage (iterates over OBJECT keys):
function getUniqueLanguages(languageStats) {
  const languages = [];
  for (const lang in languageStats) {
    // 'for...in' loops over the KEYS of an object (not arrays!)
    languages.push(lang);
  }
  return languages;
}

// ===== SEARCH RATE LIMITER (using localStorage) =====
// Tracks how many times someone searches the SAME username repeatedly,
// to protect our limited 60 req/hour GitHub quota from being wasted.

const RATE_LIMIT_KEY = "devsearch_rate_limit";
const BAN_DURATION_MS = 40 * 60 * 1000; // 40 minutes in milliseconds

// Reads the whole tracking object from localStorage (or {} if nothing saved yet)
function getRateLimitData() {
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  return raw ? JSON.parse(raw) : {};
}

// Saves the tracking object back to localStorage
function saveRateLimitData(data) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

// Call this EVERY TIME a search is attempted for a username.
// Returns { status: 'ok' | 'warning1' | 'warning2' | 'banned', remainingMs? }
function registerSearchAttempt(username) {
  const key = username.toLowerCase(); // so "Torvalds" and "torvalds" count as the same
  const data = getRateLimitData();
  const now = Date.now();

  let record = data[key] || { count: 0, bannedUntil: null };

  // Already banned and ban hasn't expired yet — block immediately
  if (record.bannedUntil && now < record.bannedUntil) {
    return { status: "banned", remainingMs: record.bannedUntil - now };
  }

  // Ban existed but has expired — reset their record clean
  if (record.bannedUntil && now >= record.bannedUntil) {
    record = { count: 0, bannedUntil: null };
  }

  record.count += 1;
  let status = "ok";

  if (record.count === 4) {
    status = "warning1";
  } else if (record.count === 5) {
    status = "warning2";
  } else if (record.count >= 6) {
    record.bannedUntil = now + BAN_DURATION_MS;
    record.count = 0; // reset so it's clean once the ban lifts
    status = "banned";
  }

  data[key] = record;
  saveRateLimitData(data);

  return status === "banned"
    ? { status, remainingMs: BAN_DURATION_MS }
    : { status };
}

// Formats milliseconds into "MM:SS" for display, e.g. 2400000ms → "40:00"
function formatRemainingTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
