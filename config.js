const env = process.env;

const config = {
  db: { /* don’t expose password or any sensitive info, done only for demo */
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '12345',
    database: env.DB_NAME || 'PrimaryApp',
  },
  listPerPage: env.LIST_PER_PAGE || 100,
};
  
module.exports = config;
