const { Controller, Get } = require('@nestjs/common');

class HealthController {
  check() {
    return { status: 'ok' };
  }
}

Controller('health')(HealthController);
Get()(HealthController.prototype, 'check', Object.getOwnPropertyDescriptor(HealthController.prototype, 'check'));

module.exports = { HealthController };
