import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình kết nối SQL Server chuẩn xác theo thông số trên host GearHost
const dbConfig = {
  user: process.env.DB_USER || 'backenddevops',
  password: process.env.DB_PASSWORD || 'your_password_here',
  server: process.env.DB_SERVER || 'den1.mssql8.gear.host',
  database: process.env.DB_DATABASE || 'backenddevops',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false, // Tương ứng 'Optional' trên Azure Data Studio / SSMS
    trustServerCertificate: true, // Tương ứng tick 'Trust Server Certificate'
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Khởi tạo Connection Pool
export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('✅ Đã kết nối thành công đến Microsoft SQL Server (den1.mssql8.gear.host)!');
    return pool;
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối đến SQL Server:', err.message);
  });

export { sql };
