const { Module } = require('@nestjs/common');
const { MoviesController } = require('./movies.controller');
const { MoviesService } = require('./movies.service');

class MoviesModule {}
Module({ controllers: [MoviesController], providers: [MoviesService] })(MoviesModule);

module.exports = { MoviesModule };
