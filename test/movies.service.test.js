const assert = require('node:assert/strict');
const test = require('node:test');
const {
  BadGatewayException, GatewayTimeoutException, NotFoundException, ServiceUnavailableException,
} = require('@nestjs/common');
const { MoviesService } = require('../src/movies/movies.service');

function createService() {
  return new MoviesService({
    getOrThrow: () => 'test-token',
    get: () => '1000',
  });
}

test('trending returns consistent pagination and preserves valid zero values', async () => {
  const service = createService();
  service.client.get = async () => ({ data: {
    page: 2, total_pages: 0, total_results: 0,
    results: [{
      id: 7, title: 'Zero', overview: '', poster_path: null, backdrop_path: null,
      release_date: '', genre_ids: [], vote_average: 0, vote_count: 0,
    }],
  } });

  const result = await service.trending(2);
  assert.deepEqual(result, {
    page: 2, totalPages: 0, totalResults: 0,
    results: [{
      id: 7, title: 'Zero', overview: '', posterPath: null, backdropPath: null,
      releaseDate: null, genreIds: [], voteAverage: 0, voteCount: 0,
    }],
  });
});

test('discover sends filters to TMDb, including a minimum rating of zero', async () => {
  const service = createService();
  let request;
  service.client.get = async (path, options) => {
    request = { path, options };
    return { data: { page: 1, total_pages: 1, total_results: 0, results: [] } };
  };

  await service.discover({ page: 1, genre: 28, year: 2024, minRating: 0 });
  assert.equal(request.path, '/discover/movie');
  assert.equal(request.options.params.with_genres, 28);
  assert.equal(request.options.params.primary_release_year, 2024);
  assert.equal(request.options.params['vote_average.gte'], 0);
});

test('details tolerates missing optional data and returns no trailer', async () => {
  const service = createService();
  service.client.get = async () => ({ data: {
    id: 12, title: 'Sparse', overview: '', release_date: '', runtime: 0,
    vote_average: 0, vote_count: 0,
  } });

  const result = await service.details(12);
  assert.equal(result.releaseDate, null);
  assert.equal(result.runtime, 0);
  assert.equal(result.voteAverage, 0);
  assert.deepEqual(result.genres, []);
  assert.deepEqual(result.cast, []);
  assert.equal(result.trailer, null);
});

test('details prefers an official YouTube trailer', async () => {
  const service = createService();
  service.client.get = async () => ({ data: {
    id: 12, title: 'Videos', videos: { results: [
      { site: 'Vimeo', type: 'Trailer', key: 'vimeo' },
      { site: 'YouTube', type: 'Trailer', key: 'unofficial', official: false },
      { site: 'YouTube', type: 'Trailer', key: 'official', official: true, name: 'Main trailer' },
    ] },
  } });

  const result = await service.details(12);
  assert.equal(result.trailer.key, 'official');
  assert.equal(result.trailer.url, 'https://www.youtube.com/watch?v=official');
});

for (const scenario of [
  [{ code: 'ECONNABORTED' }, GatewayTimeoutException],
  [{ response: { status: 401, data: { status_message: 'secret upstream detail' } } }, BadGatewayException],
  [{ response: { status: 429 } }, ServiceUnavailableException],
  [{ response: { status: 503 } }, ServiceUnavailableException],
]) {
  const [upstreamError, ExpectedException] = scenario;
  test(`maps upstream failure to ${ExpectedException.name}`, async () => {
    const service = createService();
    service.client.get = async () => { throw upstreamError; };
    await assert.rejects(() => service.trending(1), (error) => {
      assert.ok(error instanceof ExpectedException);
      assert.doesNotMatch(error.message, /secret upstream detail/);
      return true;
    });
  });
}

test('maps a missing movie to a safe not-found response', async () => {
  const service = createService();
  service.client.get = async () => { throw { response: { status: 404 } }; };
  await assert.rejects(() => service.details(999), NotFoundException);
});
