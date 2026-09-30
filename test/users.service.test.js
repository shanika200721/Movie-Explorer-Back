const assert = require('node:assert/strict');
const test = require('node:test');
const { ConflictException } = require('@nestjs/common');
const { UsersService } = require('../src/users/users.service');

test('maps a MySQL duplicate-key race to a safe conflict error', async () => {
  const repository = {
    create: (user) => user,
    save: async () => { throw Object.assign(new Error('raw database detail'), { code: 'ER_DUP_ENTRY', errno: 1062 }); },
  };
  const service = new UsersService(repository);
  await assert.rejects(() => service.create('viewer', 'hash'), (error) => {
    assert.ok(error instanceof ConflictException);
    assert.equal(error.message, 'Username is already in use');
    assert.doesNotMatch(error.message, /raw database detail/);
    return true;
  });
});
