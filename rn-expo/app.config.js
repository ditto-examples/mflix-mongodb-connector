const path = require('node:path');

try {
  process.loadEnvFile(path.resolve(__dirname, '../.env'));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    ditto: {
      databaseID: process.env.DITTO_DATABASE_ID ?? '',
      developmentToken: process.env.DITTO_DEVELOPMENT_TOKEN ?? '',
      serverURL: process.env.DITTO_SERVER_URL ?? '',
    },
  },
});
