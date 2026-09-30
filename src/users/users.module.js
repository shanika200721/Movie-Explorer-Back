const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { User } = require('./user.entity');
const { UsersService } = require('./users.service');

class UsersModule {}
Module({ imports: [TypeOrmModule.forFeature([User])], providers: [UsersService], exports: [UsersService] })(UsersModule);

module.exports = { UsersModule };
