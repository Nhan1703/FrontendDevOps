import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool, sql } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Kiểm tra trạng thái Server & Database
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
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
    const pool = await getPool();
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
      specs: item.specs ? (typeof item.specs === 'string' ? JSON.parse(item.specs) : item.specs) : [],
      colors: item.colors ? (typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors) : [],
    }));

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Lấy danh sách người dùng từ database
app.get('/api/users', async (req, res) => {
  try {
    const pool = await getPool();
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

// 4. Thêm người dùng mới vào database
app.post('/api/users', async (req, res) => {
  const { id, name, email, password, phone, role, status, createdAt } = req.body;
  try {
    const pool = await getPool();
    
    // Kiểm tra email trùng
    const checkUser = await pool.request()
      .input('email', sql.NVarChar(150), email)
      .query('SELECT id FROM dbo.Users WHERE LOWER(email) = LOWER(@email)');
    
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống!' });
    }

    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(150), email)
      .input('password', sql.NVarChar(255), password || 'kh123')
      .input('phone', sql.NVarChar(20), phone || null)
      .input('role', sql.NVarChar(20), role || 'customer')
      .input('status', sql.NVarChar(20), status || 'active')
      .input('created_at', sql.NVarChar(50), createdAt || new Date().toLocaleDateString('vi-VN'))
      .query(`
        INSERT INTO dbo.Users (id, name, email, password, phone, role, status, created_at, orders_count)
        VALUES (@id, @name, @email, @password, @phone, @role, @status, @created_at, 0)
      `);

    res.status(201).json({ success: true, message: 'Thêm người dùng vào Database thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Cập nhật thông tin / trạng thái người dùng
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, role, status } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(150), email)
      .input('password', sql.NVarChar(255), password)
      .input('phone', sql.NVarChar(20), phone || null)
      .input('role', sql.NVarChar(20), role)
      .input('status', sql.NVarChar(20), status)
      .query(`
        UPDATE dbo.Users
        SET 
          name = COALESCE(@name, name),
          email = COALESCE(@email, email),
          password = COALESCE(@password, password),
          phone = COALESCE(@phone, phone),
          role = COALESCE(@role, role),
          status = COALESCE(@status, status)
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Cập nhật người dùng thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Xóa người dùng khỏi database
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('DELETE FROM dbo.Users WHERE id = @id');
    res.json({ success: true, message: 'Đã xóa người dùng khỏi Database!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Lấy danh sách đơn hàng kèm chi tiết mặt hàng (items)
app.get('/api/orders', async (req, res) => {
  try {
    const pool = await getPool();
    const ordersResult = await pool.request().query(`
      SELECT 
        id, user_id AS userId, customer_name AS customerName, customer_email AS customerEmail,
        customer_phone AS customerPhone, customer_address AS customerAddress,
        total_amount AS totalAmount, status, note, created_at AS createdAt
      FROM dbo.Orders
      ORDER BY created_at DESC
    `);

    const itemsResult = await pool.request().query(`
      SELECT 
        order_id AS orderId, product_id AS id, product_name AS name,
        price, quantity, selected_color AS selectedColor, image
      FROM dbo.OrderItems
    `);

    const orders = ordersResult.recordset.map((order) => {
      const items = itemsResult.recordset.filter((item) => item.orderId === order.id);
      return {
        ...order,
        items: items || [],
      };
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Tạo đơn hàng mới & lưu đầy đủ note, thông tin giao hàng
app.post('/api/orders', async (req, res) => {
  const { id, userId, customerName, customerEmail, customerPhone, customerAddress, totalAmount, items, note, createdAt } = req.body;
  const orderId = id || `DH-${Date.now().toString().slice(-4)}`;
  const orderDate = createdAt || new Date().toLocaleString('vi-VN');

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 8.1. Thêm vào bảng Orders
      await transaction.request()
        .input('id', sql.NVarChar(50), orderId)
        .input('user_id', sql.NVarChar(50), userId || null)
        .input('customer_name', sql.NVarChar(100), customerName)
        .input('customer_email', sql.NVarChar(150), customerEmail)
        .input('customer_phone', sql.NVarChar(20), customerPhone || 'Chưa cung cấp')
        .input('customer_address', sql.NVarChar(255), customerAddress || 'Giao toàn quốc')
        .input('total_amount', sql.Decimal(18, 2), totalAmount)
        .input('note', sql.NVarChar(500), note || null)
        .input('created_at', sql.NVarChar(50), orderDate)
        .query(`
          INSERT INTO dbo.Orders (id, user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, status, note, created_at)
          VALUES (@id, @user_id, @customer_name, @customer_email, @customer_phone, @customer_address, @total_amount, 'pending', @note, @created_at)
        `);

      // 8.2. Thêm từng sản phẩm vào bảng OrderItems
      if (Array.isArray(items)) {
        for (const item of items) {
          await transaction.request()
            .input('order_id', sql.NVarChar(50), orderId)
            .input('product_id', sql.Int, item.id || null)
            .input('product_name', sql.NVarChar(255), item.name)
            .input('price', sql.Decimal(18, 2), item.price)
            .input('quantity', sql.Int, item.quantity || 1)
            .input('selected_color', sql.NVarChar(50), item.selectedColor || null)
            .input('image', sql.NVarChar(500), item.image || null)
            .query(`
              INSERT INTO dbo.OrderItems (order_id, product_id, product_name, price, quantity, selected_color, image)
              VALUES (@order_id, @product_id, @product_name, @price, @quantity, @selected_color, @image)
            `);
        }
      }

      // 8.3. Tăng orders_count cho khách hàng nếu có tài khoản
      await transaction.request()
        .input('email', sql.NVarChar(150), customerEmail)
        .query(`
          UPDATE dbo.Users 
          SET orders_count = orders_count + 1 
          WHERE LOWER(email) = LOWER(@email)
        `);

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

// 9. Cập nhật trạng thái đơn hàng (Admin duyệt đơn: pending -> shipping -> delivered -> cancelled)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('status', sql.NVarChar(30), status)
      .query('UPDATE dbo.Orders SET status = @status WHERE id = @id');
    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Xóa đơn hàng khỏi Database
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    // Xóa OrderItems trước (nếu không có cascade) rồi xóa Orders
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query(`
        DELETE FROM dbo.OrderItems WHERE order_id = @id;
        DELETE FROM dbo.Orders WHERE id = @id;
      `);
    res.json({ success: true, message: 'Đã xóa đơn hàng khỏi Database!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});
