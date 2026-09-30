const { Module } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { UsersModule } = require('../users/users.module');
const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');
const { JwtStrategy } = require('./jwt.strategy');

class AuthModule {}
Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config) => ({ secret: config.getOrThrow('JWT_SECRET'), signOptions: { expiresIn: '1d' } }),
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})(AuthModule);

module.exports = { AuthModule };
