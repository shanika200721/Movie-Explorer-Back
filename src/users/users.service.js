const { Injectable } = require('@nestjs/common');
const { InjectRepository } = require('@nestjs/typeorm');
const { User } = require('./user.entity');

class UsersService {
  constructor(usersRepository) { this.usersRepository = usersRepository; }
  findByUsername(username) { return this.usersRepository.findOne({ where: { username } }); }
  create(username, passwordHash) {
    return this.usersRepository.save(this.usersRepository.create({ username, passwordHash }));
  }
}
Injectable()(UsersService);
InjectRepository(User)(UsersService, undefined, 0);

module.exports = { UsersService };
