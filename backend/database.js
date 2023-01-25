const Pool = require('pg').Pool
const pool = new Pool({
  user: 'gigverseadmin',
  host: 'localhost',
  database: 'gigverse_postgres',
  password: 'gigverse',
  port: 5432,
})

module.exports = pool 