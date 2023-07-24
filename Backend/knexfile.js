import config from 'config';

export const configurations = {
  client: config.get('DB.CLIENT'),
  connection: {
    database: config.get('DB.NAME'),
    user: config.get('DB.USER'),
    password: config.get('DB.PASSWORD'),
  },
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations' },
};
