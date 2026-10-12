import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { poolPromise, sql } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Kiểm tra trạng thái Server & Database
app.get('/api/health', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT 1 AS status');
    res.json({
      status: 'OK',
      message: 'Server và Database kết nối bình thường!',
      db: result.recordset[0].status === 1 ? 'Connected' : 'Error',
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// 2. Lấy danh sách sản phẩm từ database
app.get('/api/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id, name, category, price, original_price AS originalPrice,
        rating, reviews_count AS reviewsCount, image, tag, description,
        specs, colors
      FROM dbo.Products
      ORDER BY id ASC
    `);

    const products = result.recordset.map((item) => ({
      ...item,
      specs: item.specs ? JSON.parse(item.specs) : [],
      colors: item.colors ? JSON.parse(item.colors) : [],
    }));

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Lấy danh sách người dùng từ database
app.get('/api/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id, name, email, password, phone, role, status,
        created_at AS createdAt, orders_count AS ordersCount
      FROM dbo.Users
      ORDER BY id ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Lấy danh sách đơn hàng
app.get('/api/orders', async (req, res) => {
  try {
    const pool = await poolPromise;
    const ordersResult = await pool.request().query(`
      SELECT 
        id, customer_name AS customerName, customer_email AS customerEmail,
        customer_phone AS customerPhone, customer_address AS customerAddress,
        total_amount AS totalAmount, status, note, created_at AS createdAt
      FROM dbo.Orders
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: ordersResult.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Tạo đơn hàng mới
app.post('/api/orders', async (req, res) => {
  const { customerName, customerEmail, customerPhone, customerAddress, totalAmount, items, note } = req.body;
  const orderId = `DH-${Date.now().toString().slice(-4)}`;

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await transaction.request()
        .input('id', sql.NVarChar(50), orderId)
        .input('customer_name', sql.NVarChar(100), customerName)
        .input('customer_email', sql.NVarChar(150), customerEmail)
        .input('customer_phone', sql.NVarChar(20), customerPhone)
        .input('customer_address', sql.NVarChar(255), customerAddress)
        .input('total_amount', sql.Decimal(18, 2), totalAmount)
        .input('note', sql.NVarChar(500), note || null)
        .query(`
          INSERT INTO dbo.Orders (id, customer_name, customer_email, customer_phone, customer_address, total_amount, note)
          VALUES (@id, @customer_name, @customer_email, @customer_phone, @customer_address, @total_amount, @note)
        `);

      if (Array.isArray(items)) {
        for (const item of items) {
          await transaction.request()
            .input('order_id', sql.NVarChar(50), orderId)
            .input('product_id', sql.Int, item.id || null)
            .input('product_name', sql.NVarChar(255), item.name)
            .input('price', sql.Decimal(18, 2), item.price)
            .input('quantity', sql.Int, item.quantity)
            .input('selected_color', sql.NVarChar(50), item.selectedColor || null)
            .input('image', sql.NVarChar(500), item.image || null)
            .query(`
              INSERT INTO dbo.OrderItems (order_id, product_id, product_name, price, quantity, selected_color, image)
              VALUES (@order_id, @product_id, @product_name, @price, @quantity, @selected_color, @image)
            `);
        }
      }

      await transaction.commit();
      res.status(201).json({ success: true, message: 'Tạo đơn hàng thành công!', orderId });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});
