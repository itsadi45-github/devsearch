# DevSearch 🔍

A frontend web app to search any GitHub username and explore their public repositories — filter by language, sort by stars, and view quick stats. Built with vanilla JavaScript (no frameworks) as a hands-on project to practice core JS concepts.

🔗 Live Demo: [https://YOUR_USERNAME.github.io/devsearch/](https://YOUR_USERNAME.github.io/devsearch/)  
(update this link once deployed via GitHub Pages)

---

## Features

- 🔎 Search any public GitHub username
- 📦 View all public repositories with stars, forks, and language
- 🎯 Filter repos by programming language
- ↕️ Sort by stars (asc/desc) or name
- ⌨️ Debounced live search (waits until you stop typing)
- ⚠️ Built-in rate limiter — warns and temporarily blocks repeated searches for the same username, protecting GitHub's API quota
- 🚫 Graceful error handling for invalid usernames or API failures

---

## Tech Stack

- HTML5
- CSS3 (Grid layout, no frameworks)
- Vanilla JavaScript (ES6+)
- [GitHub REST API](https://docs.github.com/en/rest) (unauthenticated)

No build tools, no bundlers, no dependencies — pure JS, intentionally, to focus on fundamentals.

---

## Concepts Practiced

This project was built specifically to apply core JavaScript concepts in a real, working context rather than in isolation:

| Concept | Where it's used |
|---|---|
| `let` / `const` / data types | Throughout — state management in `app.js` |
| Promises, `async/await` | `api.js` — fetching data from GitHub's API |
| Microtasks vs Macrotasks (event loop) | Documented in `api.js`, demonstrates why Promise callbacks run before `setTimeout` |
| `map` / `filter` / `reduce` | `utils.js` — language stats, total star calculation, filtering repos |
| `for...of`, `for...in`, `forEach` | `render.js` / `utils.js` — rendering repo cards, iterating language stats |
| Callbacks | `app.js` — event listeners (click, keydown, input, change) |
| Template literals | `render.js` — building repo card HTML dynamically |
| `call` / `bind` / `apply` | `utils.js` — a context-aware logger utility (`logApi`, `logRender`) |
| IIFE | `app.js` — wraps the entire app to avoid polluting the global scope |
| Arguments vs Parameters | `app.js` — dedicated demo function showing the difference |
| Higher-order functions | `utils.js` — `debounce()` takes and returns a function |
| Pure functions | `utils.js` — `sortRepos()`, `getTotalStars()` (no side effects, no mutation) |
| Currying | `utils.js` — `filterByLanguage(lang)(repos)` |

---

## Project Structure

devsearch/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── app.js # entry point, IIFE, event listeners, state
│ ├── api.js # fetch logic (promises/async-await)
│ ├── utils.js # pure functions, currying, debounce, rate limiter
│ └── render.js # DOM rendering functions
└── README.md


---

## Running Locally

1. Clone the repo:
```bash
   git clone https://github.com/YOUR_USERNAME/devsearch.git
   cd devsearch
```
2. Open `index.html` with a local server (recommended: VS Code's Live Server extension), since `fetch` can behave inconsistently on `file://` URLs in some browsers.

No `npm install` needed — zero dependencies.

---

## Known Limitations

- GitHub API rate limit: Unauthenticated requests are limited to 60/hour per IP by GitHub itself. This app adds its own client-side limiter (max 5 searches per username before a 40-minute cooldown) to reduce the chance of hitting that ceiling.
- Rate limiter is per-browser: Since there's no backend, the limiter uses `localStorage`, so it can be bypassed by clearing browser storage or using incognito mode. A production version would move this enforcement server-side.
- Future improvement: Route API calls through a serverless function (e.g. Vercel/Cloudflare Workers) holding a personal access token, raising the real limit to 5,000 requests/hour and making rate-limiting genuinely enforceable per-user rather than per-browser.

---

## Author

Built by [ADITYA KUMAR SONI](https://github.com/itsadi45-github) as a practice project to solidify core JavaScript fundamentals through a real, functioning application.