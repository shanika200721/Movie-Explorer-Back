const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: Number, primary: true, generated: true },
    username: { type: String, unique: true, length: 80 },
    passwordHash: { type: String, length: 255 },
    createdAt: { type: 'timestamp', createDate: true },
  },
});

module.exports = { User };
