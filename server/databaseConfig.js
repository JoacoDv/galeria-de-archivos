import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg
const pool = new Pool({
  user: 'joaco',
  host: 'localhost',
  database: 'usuarios',
  password: process.env.PGPASSWORD,
  port: 5432
})

export default pool


