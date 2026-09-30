const { BadRequestException, Injectable } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const axios = require('axios');

class MoviesService {
  constructor(config) { this.baseUrl = 'https://api.themoviedb.org/3'; this.apiKey = config.getOrThrow('TMDB_API_KEY'); }
  trending(page) { return this.get('/trending/movie/week', { page }); }
  async search(params) {
    const query = params.query?.trim();
    if (!query) throw new BadRequestException('Search query is required');
    const data = await this.get('/search/movie', { query, page: params.page, primary_release_year: params.year || undefined });
    const genre = Number(params.genre) || 0;
    const rating = Number(params.rating) || 0;
    return { ...data, results: data.results.filter((movie) =>
      (!genre || movie.genre_ids?.includes(genre)) && (movie.vote_average || 0) >= rating) };
  }
  details(id) { return this.get(`/movie/${id}`, { append_to_response: 'credits,videos' }); }
  genres() { return this.get('/genre/movie/list'); }
  async get(path, params = {}) {
    const response = await axios.get(`${this.baseUrl}${path}`, {
      params: { api_key: this.apiKey, language: 'en-US', include_adult: false, ...params },
    });
    return response.data;
  }
}
Injectable()(MoviesService);
Reflect.defineMetadata('design:paramtypes', [ConfigService], MoviesService);

module.exports = { MoviesService };
