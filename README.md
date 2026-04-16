Initial ME FOR MIDTERM:
Popcorn Pardner is a movie reviewing app where users have the ability to search for a movie, add it to their watchlist, write a review for it that will be posted to their home page, assign the movie a rating, and show which movie they're actively watching. All from the comfort of a light or dark mode.

Primary features are:

1. Search - The user may search for a movie powered by The Movie Database API (TMDB)
2. Watchlist - The user may add movies they haven't seen yet to a watchlist
3. Movie review and rating - the user may "log" a movie, leaving a review with their thoughts to be posted to their account, at the same time, the user may assign the movie a rating 1-5 in cowboy hats (Yeehaw)
4. Currently watching - The user may select "currently watching" on a movie and this will show a live indicator on their profile.
5. Light mode - as the application naturally leans a little dark in styling, I added a light mode option

- The front end stack will consist of HTML for the structure, CSS for styling, and JS for any interactivity.

- Movie data comes from The Movie DataBase (TMDB) API

- For the scope of this base level assignment, data is stored in localStorage

- There are no known bugs. API keys are kept server-side via Vercel Edge Functions and are never exposed to the browser.

NEW ADDITIONS FOR API ASSIGNMENT: April 14-15

Two APIs have been added in these two most recent commits:

1. WatchMode API: provides streaming information for any search result, so the user may see where to access the film.

- The feature that utilizes this API is integrated into a modal popup that shows, as buttons, which services are streaming the film. Upon click, the user is taken to that streaming service.

2. OMDb API: provides rating information from Rotten Tomatoes and IMDB, as well as the age rating (G, PG, PG-13, R, etc..) from the MPAA, and the film runtime.

- The feature that utilizes this API is integrated into the same modal popup, this simply shows the user rating information curated by users of IMDB, and Rotten Tomatoes. It also informs the user of the MPAA age rating, and the film's runtime.

---

## Running Locally (Written by Claude Code)

This project uses Vercel Edge Functions to keep API keys server-side. Because of this, you cannot run it by simply opening the HTML files in a browser, you need the Vercel CLI to simulate the server environment locally.

**Prerequisites:** Node.js installed

**Steps:**

1. Clone the repository
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Log in to Vercel:
   ```
   vercel login
   ```
4. Link the project to your Vercel account:
   ```
   vercel link
   ```
5. Pull environment variables from Vercel (requires the API keys to already be set in your Vercel project dashboard):
   ```
   vercel env pull
   ```
6. Start the local dev server:
   ```
   vercel dev
   ```
7. Open the URL shown in the terminal (typically `http://localhost:3000`)

**Required environment variables** (set in Vercel dashboard, pulled via `vercel env pull`):

- `TMDB_READ_TOKEN` — TMDB API Read Access Token
- `OMDB_API_KEY` — OMDb API key
- `WATCHMODE_API_KEY` — WatchMode API key

## Deployment

Popcorn Pardner is deployed on Vercel. Pushing to the `main` branch on GitHub triggers an automatic redeploy. No build step is required — Vercel picks up the Edge Functions in the `api/` folder automatically.
