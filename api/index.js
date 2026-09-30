require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../src/app.module');
const { configureApp } = require('../src/main');

let server;

async function getServer() {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server;
}

module.exports = async function handler(request, response) {
  const originalPath = request.query?.path;
  if (originalPath) {
    const url = new URL(request.url, 'http://localhost');
    url.pathname = `/${originalPath}`;
    url.searchParams.delete('path');
    request.url = `${url.pathname}${url.search}`;
  }
  const nestServer = await getServer();
  return nestServer(request, response);
};
