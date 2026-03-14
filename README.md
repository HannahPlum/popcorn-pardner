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

-There are no known bugs, the only issue I could foresee is that the API key for TMDB can be accessed in the browser. This is not typically an issue, as the key is open source and not hiding any vital secrets, however it is worth noting. There is no way around this for the scope of this base level assignment, as everything is done client-side.

What I Learned:
Working with Claude throughout this project I learned about a few things:
First, Claude does not immediately account for accessiblity standards, when I asked Claude to assess the "light mode" version of the website specifically with accessibility in mind, it came back with a few colors that didn't meet standard contrast levels. In addition to this, there were a few features that did not have labelling, so a user using tab would not be able to find them.

Second, I learned about .env files and what it actually takes to use them. That when your project is completely based in the client-side, using localStorage, env files don't work and there is practically nothing that can be done to hide the API key other than putting it into git.ignore, which still doesn't hide it from the browser. In the future, if this website is ever further developed and connected to a database, the API key and token can certainly be added to an env file and properly hidden.

Third, this one feels like common sense, but I truly didn't think of it until this project: connecting to Vercel and Github from the very start. There was one issue that only occurred on Vercel that I was able to fix in real time, instead of waiting until it was published to notice any issues. This is a practice I would like to keep up with.
