const { BadRequestException } = require('@nestjs/common');

class AuthCredentialsDto {
  constructor(body = {}) {
    this.username = typeof body.username === 'string' ? body.username.trim() : '';
    this.password = typeof body.password === 'string' ? body.password : '';
  }

  validate() {
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!this.username || this.username.length < 3 || this.username.length > 80 || !usernamePattern.test(this.username)) {
      throw new BadRequestException('Username must be 3-80 characters and contain only letters, numbers, and underscores');
    }
    if (!this.password || this.password.length < 8 || this.password.length > 128) {
      throw new BadRequestException('Password must be 8-128 characters');
    }
    return { username: this.username, password: this.password };
  }
}

module.exports = { AuthCredentialsDto };
