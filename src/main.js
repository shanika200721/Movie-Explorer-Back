require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { BadRequestException } = require('@nestjs/common');
const { AppModule } = require('./app.module');

function configureApp(app) {
  const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new BadRequestException('Origin is not allowed by CORS'), false);
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(Number(process.env.PORT) || 4000);
}

if (require.main === module) bootstrap();

module.exports = { configureApp };
