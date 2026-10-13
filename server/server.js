import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, User, Product, Order } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB
connectDB().catch((err) => {
  console.error('Không thể kết nối ban đầu tới MongoDB:', err.message);
});

// 1. Kiểm tra trạng thái Server & Database
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server và MongoDB kết nối bình thường!',
    db: 'Connected',
  });
});

// 2. Lấy danh sách sản phẩm từ MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.1. Thêm sản phẩm mới vào MongoDB
app.post('/api/products', async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      price,
      originalPrice,
      rating,
      reviewsCount,
      image,
      tag,
      description,
      specs,
      colors,
    } = req.body || {};

    let prodId = id;
    if (!prodId) {
      const maxProd = await Product.findOne().sort({ id: -1 }).lean();
      prodId = maxProd ? maxProd.id + 1 : 1;
    }

    const newProduct = await Product.create({
      id: Number(prodId),
      name,
      category: category || 'Phụ kiện',
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      rating: Number(rating) || 5.0,
      reviewsCount: Number(reviewsCount) || 0,
      image:
        image ||
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      tag: tag || null,
      description: description || name,
      specs: Array.isArray(specs) ? specs : [],
      colors: Array.isArray(colors) ? colors : [],
    });

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm vào MongoDB thành công!',
      data: newProduct,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.2. Cập nhật sản phẩm trong MongoDB
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      reviewsCount,
      image,
      tag,
      description,
      specs,
      colors,
    } = req.body || {};
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (rating !== undefined) updateData.rating = Number(rating);
    if (reviewsCount !== undefined) updateData.reviewsCount = Number(reviewsCount);
    if (image !== undefined) updateData.image = image;
    if (tag !== undefined) updateData.tag = tag;
    if (description !== undefined) updateData.description = description;
    if (specs !== undefined) updateData.specs = Array.isArray(specs) ? specs : [];
    if (colors !== undefined) updateData.colors = Array.isArray(colors) ? colors : [];

    const updated = await Product.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.3. Xóa sản phẩm khỏi MongoDB
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await Product.findOneAndDelete({ id });
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi Database!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Lấy danh sách người dùng từ MongoDB
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ id: 1 }).lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Thêm người dùng mới vào MongoDB
app.post('/api/users', async (req, res) => {
  const { id, name, email, password, phone, role, status, createdAt } = req.body;
  try {
    const existing = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã tồn tại trong hệ thống!',
      });
    }

    const newUser = await User.create({
      id,
      name,
      email: email.toLowerCase(),
      password: password || 'kh123',
      phone: phone || null,
      role: role || 'customer',
      status: status || 'active',
      createdAt: createdAt || new Date().toLocaleDateString('vi-VN'),
      ordersCount: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Thêm người dùng vào Database thành công!',
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Cập nhật thông tin / trạng thái người dùng
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, role, status } = req.body;
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (password !== undefined) updateData.password = password;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    await User.findOneAndUpdate({ id }, { $set: updateData });
    res.json({ success: true, message: 'Cập nhật người dùng thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Xóa người dùng khỏi MongoDB
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findOneAndDelete({ id });
    res.json({ success: true, message: 'Đã xóa người dùng khỏi Database!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Lấy danh sách đơn hàng kèm chi tiết mặt hàng
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Tạo đơn hàng mới & lưu vào MongoDB
app.post('/api/orders', async (req, res) => {
  const {
    id,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    totalAmount,
    items,
    note,
    createdAt,
  } = req.body;

  const orderId = id || `DH-${Date.now().toString().slice(-4)}`;

  try {
    const newOrder = await Order.create({
      id: orderId,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone: customerPhone || 'Chưa cung cấp',
      customerAddress: customerAddress || 'Giao toàn quốc',
      totalAmount,
      status: 'pending',
      note: note || null,
      createdAt:
        createdAt ||
        new Date().toLocaleDateString('vi-VN') +
          ' ' +
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      items: Array.isArray(items) ? items : [],
    });

    // Tăng số đơn hàng của khách hàng nếu có tài khoản
    await User.findOneAndUpdate(
      { email: new RegExp(`^${customerEmail}$`, 'i') },
      { $inc: { ordersCount: 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công!',
      orderId,
      data: newOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Cập nhật trạng thái đơn hàng (Admin duyệt đơn)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await Order.findOneAndUpdate({ id }, { status });
    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Xóa đơn hàng khỏi MongoDB
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Order.findOneAndDelete({ id });
    res.json({ success: true, message: 'Đã xóa đơn hàng khỏi Database!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});
