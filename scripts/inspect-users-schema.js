const fs = require('fs');
const { DataSource } = require('typeorm');

function loadEnv() {
  const env = {};
  for (const file of ['.env.local', '.env']) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=]+)=(.*)\s*$/);
      if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const dataSource = new DataSource({
    type: 'mysql',
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 3306),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  });

  await dataSource.initialize();
  const rows = await dataSource.query(
    "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' ORDER BY ORDINAL_POSITION",
  );
  console.log(JSON.stringify(rows, null, 2));
  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exitCode = 1;
});
