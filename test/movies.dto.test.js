const assert = require('node:assert/strict');
const test = require('node:test');
const { BadRequestException } = require('@nestjs/common');
const { MoviesQueryDto } = require('../src/movies/movies.dto');

test('uses page one by default and accepts the TMDb page limit', () => {
  assert.equal(MoviesQueryDto.page(undefined), 1);
  assert.equal(MoviesQueryDto.page('500'), 500);
});

test('rejects invalid pages and movie IDs', () => {
  for (const page of ['0', '1.5', '501', 'nope']) {
    assert.throws(() => MoviesQueryDto.page(page), BadRequestException);
  }
  for (const id of ['0', '-1', '1.2', 'movie']) {
    assert.throws(() => MoviesQueryDto.movieId(id), BadRequestException);
  }
});

test('search requires a bounded non-empty title query', () => {
  assert.deepEqual(MoviesQueryDto.search({ query: '  Alien  ', page: '2' }), { query: 'Alien', page: 2 });
  assert.throws(() => MoviesQueryDto.search({ query: '   ' }), BadRequestException);
  assert.throws(() => MoviesQueryDto.search({ query: 'x'.repeat(201) }), BadRequestException);
});

test('discover validates filters and preserves a zero minimum rating', () => {
  assert.deepEqual(MoviesQueryDto.discover({
    page: '3', genre: '28', year: '2024', minRating: '0',
  }), { page: 3, genre: 28, year: 2024, minRating: 0 });
  assert.throws(() => MoviesQueryDto.discover({ genre: '0' }), BadRequestException);
  assert.throws(() => MoviesQueryDto.discover({ year: '999' }), BadRequestException);
  assert.throws(() => MoviesQueryDto.discover({ minRating: '10.1' }), BadRequestException);
});
