const { Body, Controller, Get, Post, Request, UseGuards } = require('@nestjs/common');
const { AuthService } = require('./auth.service');
const { JwtAuthGuard } = require('./jwt-auth.guard');

class AuthController {
  constructor(authService) { this.authService = authService; }
  register(body) { return this.authService.register(body); }
  login(body) { return this.authService.login(body); }
  me(request) { return { user: request.user }; }
}
Controller('auth')(AuthController);
Reflect.defineMetadata('design:paramtypes', [AuthService], AuthController);
Post('register')(AuthController.prototype, 'register', Object.getOwnPropertyDescriptor(AuthController.prototype, 'register'));
Body()(AuthController.prototype, 'register', 0);
Post('login')(AuthController.prototype, 'login', Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'));
Body()(AuthController.prototype, 'login', 0);
Get('me')(AuthController.prototype, 'me', Object.getOwnPropertyDescriptor(AuthController.prototype, 'me'));
UseGuards(JwtAuthGuard)(AuthController.prototype, 'me', Object.getOwnPropertyDescriptor(AuthController.prototype, 'me'));
Request()(AuthController.prototype, 'me', 0);

module.exports = { AuthController };
