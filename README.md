# Movie Explorer Backend

Backend API for Movie Explorer. It handles accounts and movie data.

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Copy `.env.example` to `.env` and add your database and TMDb API credentials.
3. Start the development server:

	```bash
	npm run start:dev
	```

The API runs at `http://localhost:4000` by default.

## Main Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /movies/trending`
- `GET /movies/search?query=batman&page=1`
- `GET /movies/discover?genre=28&year=2024&minRating=7&page=1`
- `GET /movies/genres`
- `GET /movies/:id`

Movie routes require a bearer token from login.

Movie title searches use TMDb search. Genre, release-year, and minimum-rating
browsing uses TMDb discover, whose pagination represents the complete filtered
result set rather than only the currently loaded page.
