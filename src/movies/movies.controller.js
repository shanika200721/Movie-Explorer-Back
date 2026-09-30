const { Controller, Get, Param, Query, UseGuards } = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { MoviesQueryDto } = require('./movies.dto');
const { MoviesService } = require('./movies.service');

class MoviesController {
  constructor(moviesService) { this.moviesService = moviesService; }
  trending(page) { return this.moviesService.trending(MoviesQueryDto.page(page)); }
  search(query, page) {
    const values = MoviesQueryDto.search({ query, page });
    return this.moviesService.search(values.query, values.page);
  }
  discover(page, genre, year, minRating) {
    return this.moviesService.discover(MoviesQueryDto.discover({ page, genre, year, minRating }));
  }
  genres() { return this.moviesService.genres(); }
  details(id) { return this.moviesService.details(MoviesQueryDto.movieId(id)); }
}

Controller('movies')(MoviesController);
UseGuards(JwtAuthGuard)(MoviesController);
Reflect.defineMetadata('design:paramtypes', [MoviesService], MoviesController);
Get('trending')(MoviesController.prototype, 'trending', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'trending'));
Query('page')(MoviesController.prototype, 'trending', 0);
Get('search')(MoviesController.prototype, 'search', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'search'));
Query('query')(MoviesController.prototype, 'search', 0);
Query('page')(MoviesController.prototype, 'search', 1);
Get('discover')(MoviesController.prototype, 'discover', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'discover'));
Query('page')(MoviesController.prototype, 'discover', 0);
Query('genre')(MoviesController.prototype, 'discover', 1);
Query('year')(MoviesController.prototype, 'discover', 2);
Query('minRating')(MoviesController.prototype, 'discover', 3);
Get('genres')(MoviesController.prototype, 'genres', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'genres'));
Get(':id')(MoviesController.prototype, 'details', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'details'));
Param('id')(MoviesController.prototype, 'details', 0);
module.exports = { MoviesController };
