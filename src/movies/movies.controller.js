const { Controller, Get, Param, Query, UseGuards } = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { MoviesService } = require('./movies.service');

class MoviesController {
  constructor(moviesService) { this.moviesService = moviesService; }
  trending(page = '1') { return this.moviesService.trending(page); }
  search(query, page = '1', genre, year, rating) { return this.moviesService.search({ query, page, genre, year, rating }); }
  genres() { return this.moviesService.genres(); }
  details(id) { return this.moviesService.details(id); }
}
Controller('movies')(MoviesController);
UseGuards(JwtAuthGuard)(MoviesController);
Reflect.defineMetadata('design:paramtypes', [MoviesService], MoviesController);
Get('trending')(MoviesController.prototype, 'trending', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'trending'));
Query('page')(MoviesController.prototype, 'trending', 0);
Get('search')(MoviesController.prototype, 'search', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'search'));
Query('query')(MoviesController.prototype, 'search', 0);
Query('page')(MoviesController.prototype, 'search', 1);
Query('genre')(MoviesController.prototype, 'search', 2);
Query('year')(MoviesController.prototype, 'search', 3);
Query('rating')(MoviesController.prototype, 'search', 4);
Get('genres')(MoviesController.prototype, 'genres', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'genres'));
Get(':id')(MoviesController.prototype, 'details', Object.getOwnPropertyDescriptor(MoviesController.prototype, 'details'));
Param('id')(MoviesController.prototype, 'details', 0);

module.exports = { MoviesController };
