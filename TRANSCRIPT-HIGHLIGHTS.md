1. Deciding how to best approach the API key and token from TMDB (session 1, early)

Prompt:
"Okay, I subscribed to the movie database(TMDB) and have the API read access token, as well as the API key. These should not be committed to the repo or hardcoded in any way. Should a .env file be created to store them in? What would you recommend?"

Due to past assignments, my first route was to create a .env file so the key could be hidden. However, Claude walked me through my options, explaining that since we are storing everything strictly on client side, the key is technically exposed in the browser, and a .env file would not work. To best remedy this, Claude recommended a gitignored config.js file, in addition to monitoring usage in the TMDB dashboard, and regenerating the key before making the repo public. Claude determined this would be the best approach for the scope of this project.

2. Directing Claude to allow the user to review the same movie twice (as it's common for users to rewatch movies at some point)

Prompt:
"right now, the review shows up under recently watched, however it does not allow for clicking on the review which means it cannot be edited. Also, it should be considered that a user may rewatch the movie and create a second review, they should not be limited to editing the same review again and again, they should be able to log every watch with new insight and a new review" (session 1, middle)

As I was testing the website, I noticed that I could not review the same movie twice. If I clicked on a movie that had already been reviewed, it would show the edit screen for that previous review. This is not standard as many movie review websites allow the user to review the same movie on each rewatch. Claude determined that these two corrections could be updated in the same breath by ensuring that each review has a unique ID, and by removing the "already reviewed" pre-fill on search.

3. Updating the watchlist so the user can log a movie directly from the watchlist without having to search for it again

Prompt:
"It would be nice if the user could create a review by selecting the movie in their watchlist instead of having to search for it again, is that possible?"

Previously, the movie cards in the watchlist were static (aside from the delete option), this created an issue where the user would have to make another search for the movie that was already in their watchlist in order to review it. I had Claude update the watchlist so it could accomodate the user making a review by selecting the movie card directly from the watchlist. Along with this, I had Claude make it so that the movie card is removed from the watchlist once it has been reviewed.
