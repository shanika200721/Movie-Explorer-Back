const { Injectable } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { PassportStrategy } = require('@nestjs/passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow('JWT_SECRET') });
  }
  validate(payload) { return { id: payload.sub, username: payload.username }; }
}
Injectable()(JwtStrategy);
Reflect.defineMetadata('design:paramtypes', [ConfigService], JwtStrategy);

module.exports = { JwtStrategy };
