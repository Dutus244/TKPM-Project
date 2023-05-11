import knexObj from 'knex';
import * as dotenv from 'dotenv'
dotenv.config()

export default knexObj({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    timezone: '+00:00',
  }
});