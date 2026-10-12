// Polyfill cho Promise.withResolvers nếu chạy trên Node.js < 22
if (!Promise.withResolvers) {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'backenddevops',
  password: process.env.DB_PASSWORD || 'Ht8MATB_?ZVG',
  server: process.env.DB_SERVER || 'den1.mssql8.gear.host',
  database: process.env.DB_DATABASE || 'backenddevops',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  connectionTimeout: 30000,
  requestTimeout: 30000,
  options: {
    port: parseInt(process.env.DB_PORT || '1433', 10),
    connectTimeout: 30000,
    requestTimeout: 30000,
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
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
