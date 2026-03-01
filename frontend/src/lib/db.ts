import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'SQL@123PPa',
  database: 'interview_app_database',
  waitForConnections: true,
  connectionLimit: 10,
})