const {
  BadGatewayException, GatewayTimeoutException, Injectable, NotFoundException, ServiceUnavailableException,
} = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const axios = require('axios');

class MoviesService {
  constructor(config) {
    const token = config.getOrThrow('TMDB_ACCESS_TOKEN');
    const timeout = Number(config.get('TMDB_TIMEOUT_MS')) || 5000;
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3', timeout,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
  }

  async trending(page) { return this.toPage(await this.get('/trending/movie/week', { page })); }

  async search(query, page) {
    return this.toPage(await this.get('/search/movie', { query, page, include_adult: false }));
  }

  async discover({ page, genre, year, minRating }) {
    return this.toPage(await this.get('/discover/movie', {
      page, with_genres: genre, primary_release_year: year, 'vote_average.gte': minRating,
      include_adult: false, include_video: false, sort_by: 'popularity.desc',
    }));
  }

  async details(id) {
    const movie = await this.get(`/movie/${id}`, { append_to_response: 'credits,videos' }, {
      notFoundMessage: 'Movie not found',
    });
    const trailer = this.selectTrailer(movie.videos?.results);
    return {
      id: movie.id,
      title: movie.title || movie.original_title || '',
      overview: movie.overview || '',
      posterPath: movie.poster_path ?? null,
      backdropPath: movie.backdrop_path ?? null,
      releaseDate: movie.release_date || null,
      runtime: movie.runtime ?? null,
      voteAverage: movie.vote_average ?? null,
      voteCount: movie.vote_count ?? 0,
      genres: (movie.genres || []).map(({ id: genreId, name }) => ({ id: genreId, name })),
      cast: (movie.credits?.cast || []).slice(0, 12).map((person) => ({
        id: person.id, name: person.name, character: person.character || '',
        profilePath: person.profile_path ?? null,
      })),
      trailer: trailer ? {
        key: trailer.key, name: trailer.name || 'Trailer',
        url: `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`,
      } : null,
    };
  }

  async genres() {
    const data = await this.get('/genre/movie/list');
    return { genres: (data.genres || []).map(({ id, name }) => ({ id, name })) };
  }

  selectTrailer(videos = []) {
    const youtube = videos.filter((video) => video.site === 'YouTube' && video.key);
    return youtube.find((video) => video.type === 'Trailer' && video.official)
      || youtube.find((video) => video.type === 'Trailer') || null;
  }

  toPage(data) {
    return {
      page: data.page ?? 1,
      totalPages: data.total_pages ?? 0,
      totalResults: data.total_results ?? 0,
      results: (data.results || []).map((movie) => this.toMovieSummary(movie)),
    };
  }

  toMovieSummary(movie) {
    return {
      id: movie.id,
      title: movie.title || movie.original_title || '',
      overview: movie.overview || '',
      posterPath: movie.poster_path ?? null,
      backdropPath: movie.backdrop_path ?? null,
      releaseDate: movie.release_date || null,
      genreIds: movie.genre_ids || [],
      voteAverage: movie.vote_average ?? null,
      voteCount: movie.vote_count ?? 0,
    };
  }

  async get(path, params = {}, options = {}) {
    try {
      const response = await this.client.get(path, {
        params: { language: 'en-US', ...this.withoutUndefined(params) },
      });
      return response.data;
    } catch (error) {
      this.throwUpstreamError(error, options);
    }
  }

  withoutUndefined(values) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
  }

  throwUpstreamError(error, options) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new GatewayTimeoutException('The movie service took too long to respond');
    }
    const status = error.response?.status;
    if (status === 404) throw new NotFoundException(options.notFoundMessage || 'Movie data not found');
    if (status === 401 || status === 403) {
      throw new BadGatewayException('The movie service could not authenticate the request');
    }
    if (status === 429) {
      throw new ServiceUnavailableException('The movie service is busy. Please try again shortly');
    }
    throw new ServiceUnavailableException('Movie data is temporarily unavailable');
  }
}

Injectable()(MoviesService);
Reflect.defineMetadata('design:paramtypes', [ConfigService], MoviesService);
module.exports = { MoviesService };
