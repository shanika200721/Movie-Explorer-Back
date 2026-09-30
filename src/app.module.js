const { Module } = require('@nestjs/common');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { AuthModule } = require('./auth/auth.module');
const { MoviesModule } = require('./movies/movies.module');
const { User } = require('./users/user.entity');
const { UsersModule } = require('./users/users.module');

class AppModule {}
Module({ imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (config) => ({
    type: 'mysql',
    host: config.getOrThrow('DB_HOST'),
    port: Number(config.get('DB_PORT') || 3306),
    username: config.getOrThrow('DB_USERNAME'),
    password: config.getOrThrow('DB_PASSWORD'),
    database: config.getOrThrow('DB_DATABASE'),
    entities: [User],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  }) }),
  AuthModule, UsersModule, MoviesModule,
] })(AppModule);

module.exports = { AppModule };
