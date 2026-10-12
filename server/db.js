import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'backenddevops',
  password: process.env.DB_PASSWORD || 'Ht8MATB_?ZVG',
  server: process.env.DB_SERVER || 'den1.mssql8.gear.host',
  database: process.env.DB_DATABASE || 'backenddevops',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

export async function getPool() {
  if (pool) return pool;
  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('✅ Đã kết nối thành công đến Microsoft SQL Server (den1.mssql8.gear.host)!');
    return pool;
  } catch (err) {
    console.error('❌ Lỗi kết nối đến SQL Server:', err.message);
    throw new Error(`Lỗi kết nối SQL Server: ${err.message}`);
  }
}

export { sql };
