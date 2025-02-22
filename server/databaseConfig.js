import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg
const pool = new Pool({
  user: 'joaco',
  host: 'dpg-cusgqqjqf0us739k9g4g-a',
  database: 'database_41qg',
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false },
})

export default pool


