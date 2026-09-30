const { ConflictException, Injectable, UnauthorizedException } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const bcrypt = require('bcryptjs');
const { UsersService } = require('../users/users.service');
const { AuthCredentialsDto } = require('./auth.dto');

class AuthService {
  constructor(usersService, jwtService) { this.usersService = usersService; this.jwtService = jwtService; }
  validateCredentials(body) {
    return new AuthCredentialsDto(body).validate();
  }
  async register(body) {
    const { username, password } = this.validateCredentials(body);
    if (await this.usersService.findByUsername(username)) throw new ConflictException('Username is already in use');
    return this.createSession(await this.usersService.create(username, await bcrypt.hash(password, 10)));
  }
  async login(body) {
    const { username, password } = this.validateCredentials(body);
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.createSession(user);
  }
  createSession(user) {
    return { accessToken: this.jwtService.sign({ sub: user.id, username: user.username }), user: this.publicUser(user) };
  }
  publicUser(user) {
    return { id: user.id, username: user.username };
  }
}
Injectable()(AuthService);
Reflect.defineMetadata('design:paramtypes', [UsersService, JwtService], AuthService);

module.exports = { AuthService };
