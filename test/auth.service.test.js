const test = require('node:test');
const assert = require('node:assert/strict');
const { BadRequestException, ConflictException, UnauthorizedException } = require('@nestjs/common');
const { AuthService } = require('../src/auth/auth.service');

function makeService(users = []) {
  const records = [...users];
  const usersService = {
    findByUsername: async (username) => records.find((user) => user.username === username) || null,
    create: async (username, passwordHash) => {
      if (records.some((user) => user.username === username)) throw new ConflictException('Username is already in use');
      const user = { id: records.length + 1, username, passwordHash };
      records.push(user);
      return user;
    },
  };
  const jwtService = { sign: (payload) => `signed:${payload.sub}:${payload.username}` };
  return new AuthService(usersService, jwtService);
}

test('register hashes passwords and returns a public user with a token', async () => {
  const service = makeService();
  const result = await service.register({ username: 'movie_user', password: 'strongpass' });

  assert.equal(result.user.username, 'movie_user');
  assert.equal(result.accessToken, 'signed:1:movie_user');
  assert.equal(Object.hasOwn(result.user, 'passwordHash'), false);
});

test('login rejects invalid credentials', async () => {
  const service = makeService();
  await service.register({ username: 'viewer', password: 'strongpass' });

  await assert.rejects(() => service.login({ username: 'viewer', password: 'wrongpass' }), UnauthorizedException);
});

test('login returns a session for valid credentials', async () => {
  const service = makeService();
  await service.register({ username: 'viewer', password: 'strongpass' });
  const result = await service.login({ username: 'viewer', password: 'strongpass' });
  assert.equal(result.user.username, 'viewer');
  assert.equal(result.accessToken, 'signed:1:viewer');
});

test('registration rejects duplicate usernames', async () => {
  const service = makeService();
  await service.register({ username: 'viewer', password: 'strongpass' });
  await assert.rejects(() => service.register({ username: 'viewer', password: 'anotherpass' }), ConflictException);
});

test('credentials are validated consistently', async () => {
  const service = makeService();

  await assert.rejects(() => service.register({ username: 'no spaces', password: 'strongpass' }), BadRequestException);
  await assert.rejects(() => service.login({ username: 'ok_user', password: 'short' }), BadRequestException);
  await assert.rejects(() => service.register(null), BadRequestException);
});
