const { Body, Controller, Post } = require('@nestjs/common');
const { AuthService } = require('./auth.service');

class AuthController {
  constructor(authService) { this.authService = authService; }
  register(body) { return this.authService.register(body); }
  login(body) { return this.authService.login(body); }
}
Controller('auth')(AuthController);
Reflect.defineMetadata('design:paramtypes', [AuthService], AuthController);
Post('register')(AuthController.prototype, 'register', Object.getOwnPropertyDescriptor(AuthController.prototype, 'register'));
Body()(AuthController.prototype, 'register', 0);
Post('login')(AuthController.prototype, 'login', Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'));
Body()(AuthController.prototype, 'login', 0);

module.exports = { AuthController };
