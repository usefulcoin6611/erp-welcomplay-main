import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    await pool.end();
  }
}

checkTables();
