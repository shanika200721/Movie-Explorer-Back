const { BadRequestException } = require('@nestjs/common');

class MoviesQueryDto {
  static page(value) { return this.integer(value, 'page', { defaultValue: 1, min: 1, max: 500 }); }
  static movieId(value) { return this.integer(value, 'movie ID', { min: 1 }); }

  static search({ query, page }) {
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    if (!normalizedQuery) throw new BadRequestException('Search query is required');
    if (normalizedQuery.length > 200) throw new BadRequestException('Search query must be 200 characters or fewer');
    return { query: normalizedQuery, page: this.page(page) };
  }

  static discover({ page, genre, year, minRating }) {
    return {
      page: this.page(page),
      genre: this.optionalInteger(genre, 'genre', { min: 1 }),
      year: this.optionalInteger(year, 'year', { min: 1000, max: 9999 }),
      minRating: this.optionalNumber(minRating, 'minimum rating', { min: 0, max: 10 }),
    };
  }

  static optionalInteger(value, name, limits) {
    return value === undefined || value === '' ? undefined : this.integer(value, name, limits);
  }

  static integer(value, name, { defaultValue, min, max }) {
    if ((value === undefined || value === '') && defaultValue !== undefined) return defaultValue;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < min || (max !== undefined && parsed > max)) {
      throw new BadRequestException(`${name} must be an integer between ${min} and ${max ?? 'the supported maximum'}`);
    }
    return parsed;
  }

  static optionalNumber(value, name, { min, max }) {
    if (value === undefined || value === '') return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(`${name} must be a number between ${min} and ${max}`);
    }
    return parsed;
  }
}

module.exports = { MoviesQueryDto };
