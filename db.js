const Pool = require("pg").Pool;

// to be modified
const pool = new Pool({
    user: "postgres",
    database: "impact",
    host: "localhost",
    port: 5432
})

module.exports = pool;