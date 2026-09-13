// ===== API LAYER =====
// This file is the ONLY place allowed to talk to the network (fetch).
// Keeping fetch isolated here means if GitHub's API ever changes,
// we only need to update code in ONE file.

const BASE_URL = 'https://api.github.com';

// async/await: this is "syntactic sugar" over Promises.
// It lets us write asynchronous code that READS like synchronous code,
// instead of chaining .then().then().then()
async function fetchUserRepos(username) {
  try {
    // fetch() returns a PROMISE that resolves once headers arrive
    // (the body isn't parsed yet at this point!)
    const response = await fetch(`${BASE_URL}/users/${username}/repos?per_page=100`);

    // fetch does NOT throw an error for 404 etc. We have to check manually.
    if (!response.ok) {
      // response.status will be 404 if username doesn't exist
      throw new Error(
        response.status === 404
          ? `User "${username}" not found`
          : `GitHub API error: ${response.status}`
      );
    }

    // .json() ALSO returns a promise (parsing the body takes time),
    // so we await it too
    const data = await response.json();
    return data; // array of repo objects

  } catch (error) {
    // this catches BOTH network failures AND the errors we threw above
    // re-throw so the caller (app.js) can decide how to show it in the UI
    throw error;
  }
}

// ===== THE SAME FUNCTION, BUT WITH .then()/.catch() =====
// Left here ONLY as a reference/comment to show the equivalent promise-chain style.
// We are NOT using this version in the app — async/await above is cleaner.
//
// function fetchUserReposPromiseStyle(username) {
//   return fetch(`${BASE_URL}/users/${username}/repos?per_page=100`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(
//           response.status === 404
//             ? `User "${username}" not found`
//             : `GitHub API error: ${response.status}`
//         );
//       }
//       return response.json();
//     })
//     .then((data) => data)
//     .catch((error) => {
//       throw error;
//     });
// }

// ===== EVENT LOOP NOTE (microtasks vs macrotasks) =====
// When we call fetch() and await it, here's what actually happens:
//
// 1. fetch() starts a network request (this is handled by the browser, NOT JS's call stack)
// 2. JS does NOT wait around — the call stack is freed to do other work
// 3. When the response arrives, the .then() callback (or the code after 'await')
//    is placed in the MICROTASK QUEUE (Promises always use microtasks)
// 4. Microtasks run BEFORE the browser repaints and BEFORE any macrotask
//    (like setTimeout callbacks, which go in the MACROTASK queue)
//
// Practical effect: if we did
//   setTimeout(() => console.log('macrotask'), 0);
//   fetchUserRepos('x').then(() => console.log('microtask'));
// 'microtask' would log BEFORE 'macrotask', even though setTimeout has 0ms delay,
// because ALL pending microtasks are drained before the next macrotask runs.