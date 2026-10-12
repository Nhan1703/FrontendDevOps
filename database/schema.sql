-- =======================================================================
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU & BẢNG CHO DỰ ÁN THENHANSHOP (DEV OPS)
-- Hệ quản trị: Microsoft SQL Server (den1.mssql8.gear.host)
-- Database: backenddevops
-- =======================================================================

-- Xóa các bảng cũ nếu đã tồn tại để tránh xung đột khóa ngoại
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- =======================================================================
-- 1. BẢNG USERS (Người dùng & Quản trị viên)
-- =======================================================================
CREATE TABLE dbo.Users (
    id NVARCHAR(50) PRIMARY KEY,                  -- Mã người dùng (vd: USR-001)
    name NVARCHAR(100) NOT NULL,                  -- Họ và tên
    email NVARCHAR(150) NOT NULL UNIQUE,          -- Email / Username đăng nhập
    password NVARCHAR(255) NOT NULL,              -- Mật khẩu
    phone NVARCHAR(20) NULL,                      -- Số điện thoại
    role NVARCHAR(20) DEFAULT 'customer',         -- 'admin' hoặc 'customer'
    status NVARCHAR(20) DEFAULT 'active',         -- 'active' hoặc 'locked'
    avatar NVARCHAR(500) NULL,                    -- Đường dẫn ảnh đại diện
    orders_count INT DEFAULT 0,                   -- Số lượng đơn hàng đã đặt
    created_at NVARCHAR(50) DEFAULT CONVERT(VARCHAR(10), GETDATE(), 103) -- Ngày tạo (dd/mm/yyyy)
);
GO

-- =======================================================================
-- 2. BẢNG CATEGORIES (Danh mục sản phẩm)
-- =======================================================================
CREATE TABLE dbo.Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    slug NVARCHAR(100) NULL,
    description NVARCHAR(255) NULL
);
GO

-- =======================================================================
-- 3. BẢNG PRODUCTS (Sản phẩm phụ kiện công nghệ TheNhanShop)
-- =======================================================================
CREATE TABLE dbo.Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category_id INT NULL,
    category NVARCHAR(100) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    original_price DECIMAL(18,2) NOT NULL,
    rating FLOAT DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    image NVARCHAR(500) NOT NULL,
    tag NVARCHAR(50) NULL,
    description NVARCHAR(MAX) NULL,
    specs NVARCHAR(MAX) NULL,                     -- Chuỗi JSON
    colors NVARCHAR(MAX) NULL,                    -- Chuỗi JSON
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES dbo.Categories(id) ON DELETE SET NULL
);
GO

-- =======================================================================
-- 4. BẢNG ORDERS (Đơn đặt hàng)
-- =======================================================================
CREATE TABLE dbo.Orders (
    id NVARCHAR(50) PRIMARY KEY,                  -- Mã đơn hàng (vd: DH-1001, DH-1002)
    user_id NVARCHAR(50) NULL,
    customer_name NVARCHAR(100) NOT NULL,
    customer_email NVARCHAR(150) NOT NULL,
    customer_phone NVARCHAR(20) NOT NULL,
    customer_address NVARCHAR(255) NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(30) DEFAULT 'pending',        -- 'pending', 'shipping', 'delivered', 'cancelled'
    note NVARCHAR(500) NULL,
    created_at NVARCHAR(50) DEFAULT CONVERT(VARCHAR(19), GETDATE(), 120),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE SET NULL
);
GO

-- =======================================================================
-- 5. BẢNG ORDER_ITEMS (Chi tiết mặt hàng trong đơn)
-- =======================================================================
CREATE TABLE dbo.OrderItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id NVARCHAR(50) NOT NULL,
    product_id INT NULL,
    product_name NVARCHAR(255) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_color NVARCHAR(50) NULL,
    image NVARCHAR(500) NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES dbo.Orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES dbo.Products(id) ON DELETE SET NULL
);
GO

-- =======================================================================
-- 6. CHÈN DỮ LIỆU ĐỒNG BỘ 100% VỚI APP.TSX (7 TÀI KHOẢN, SẢN PHẨM, ĐƠN HÀNG)
-- =======================================================================

-- 6.1. Danh mục
INSERT INTO dbo.Categories (name, slug) VALUES 
(N'Tai nghe & Loa', 'tai-nghe-loa'),
(N'Bàn phím & Chuột', 'ban-phim-chuot'),
(N'Củ cáp sạc', 'cu-cap-sac'),
(N'Giá đỡ & Phụ kiện bàn', 'gia-do-phu-kien');

-- 6.2. Đúng 7 Tài khoản trùng khớp 100% với màn hình Admin trên web
INSERT INTO dbo.Users (id, name, email, password, phone, role, status, created_at, orders_count) VALUES 
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', '0900 000 001', 'admin', 'active', '01/01/2026', 0),
('USR-002', N'Nguyễn Văn An', 'nguyenvanan@gmail.com', 'kh123', '0912 345 678', 'customer', 'active', '15/05/2026', 3),
('USR-003', N'Trần Thị Bích', 'bich.tran@gmail.com', 'kh123', '0988 765 432', 'customer', 'active', '22/07/2026', 1),
('USR-004', N'Lê Hoàng Long', 'long.le@gmail.com', 'kh123', '0903 112 233', 'customer', 'active', '10/08/2026', 2),
('USR-005', N'Phạm Minh Đức', 'duc.pham@outlook.com', 'kh123', '0934 556 778', 'customer', 'active', '28/08/2026', 1),
('USR-006', N'Vũ Hải Nam', 'hainam.vu@yahoo.com', 'kh123', '0977 889 900', 'customer', 'active', '02/09/2026', 0),
('USR-007', N'Thế Nhân', 'thenhan', 'admin123', '0917 714 595', 'admin', 'active', '08/09/2026', 0);

-- 6.3. Sản phẩm
INSERT INTO dbo.Products (name, category_id, category, price, original_price, rating, reviews_count, image, tag, description, specs, colors) VALUES
(
    N'Tai nghe Bluetooth True Wireless Mini V5.3', 1, N'Tai nghe & Loa', 189000, 280000, 4.8, 342,
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    N'Bán chạy',
    N'Tai nghe Bluetooth mini thiết kế nhỏ gọn, chống ồn đàm thoại ENC, thời lượng pin 24h kèm dock sạc, âm bass ấm, kết nối ổn định độ trễ thấp phù hợp nghe nhạc và học tập.',
    N'["Bluetooth 5.3", "Pin 24 tiếng", "Cảm ứng chạm đa điểm", "Chống nước IPX4"]',
    N'["Trắng Tinh Khôi", "Đen Nhám", "Hồng Pastel"]'
),
(
    N'Chuột không dây Silent Click công thái học', 2, N'Bàn phím & Chuột', 145000, 210000, 4.9, 520,
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    N'Yêu thích',
    N'Chuột không dây thiết kế công thái học cầm vừa tay, switch bấm êm ái hoàn toàn không gây tiếng ồn (Silent Click), kết nối kép 2.4Ghz USB và Bluetooth.',
    N'["Click chống ồn 99%", "DPI 800-1200-1600", "Pin sạc Type-C", "Trọng lượng 75g"]',
    N'["Xám Bạc", "Trắng Sữa", "Đen Tuyền"]'
),
(
    N'Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel', 2, N'Bàn phím & Chuột', 489000, 650000, 4.9, 189,
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    N'Hot Deal',
    N'Bàn phím cơ layout 87 phím nhỏ gọn, switch gõ cực êm mượt đã được lube sẵn, đèn Led màu pastel tinh tế, hỗ trợ kết nối Bluetooth / 2.4Ghz / Dây Type-C.',
    N'["Red Switch êm ái", "Keycap PBT chống bóng", "Hot-swap 3 pin", "Pin 3000mAh"]',
    N'["Trắng Xám", "Xanh Matcha", "Đen Huyền Bí"]'
),
(
    N'Củ sạc nhanh GaN 30W Type-C nhỏ gọn', 3, N'Củ cáp sạc', 165000, 250000, 4.8, 410,
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    N'Khuyên dùng',
    N'Củ sạc công nghệ GaN thế hệ mới kích thước siêu nhỏ, hỗ trợ sạc nhanh Power Delivery 30W cho iPhone, iPad, điện thoại Android và sạc phụ trợ MacBook Air.',
    N'["Công suất chuẩn 30W", "Chip GaN mát mẻ", "Bảo vệ quá dòng / quá nhiệt", "Chân cắm gập 90 độ"]',
    N'["Trắng", "Đen"]'
),
(
    N'Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W', 3, N'Củ cáp sạc', 59000, 99000, 4.7, 890,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    N'Giá tốt',
    N'Cáp bọc sợi dù Kevlar siêu bền chống đứt gãy, chiều dài 1.2m, hỗ trợ truyền tải dữ liệu và sạc nhanh công suất lên tới 60W.',
    N'["Bọc dù chống rối", "Đầu nhôm gia cố", "Công suất tối đa 60W", "Bảo hành 12 tháng"]',
    N'["Xám Titan", "Đen Đậm", "Đỏ Nổi Bật"]'
);

-- 6.4. Đơn hàng
INSERT INTO dbo.Orders (id, user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, status, note, created_at) VALUES
('DH-1001', 'USR-002', N'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0912 345 678', N'123 Cầu Giấy, Hà Nội', 248000, 'pending', N'Giao giờ hành chính, gọi trước khi đến', '07/09/2026 14:30'),
('DH-1002', 'USR-003', N'Trần Thị Bích', 'bich.tran@gmail.com', '0988 765 432', N'45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', 489000, 'shipping', N'Giao buổi chiều sau 17h', '06/09/2026 09:15');

-- 6.5. Chi tiết đơn hàng
INSERT INTO dbo.OrderItems (order_id, product_id, product_name, price, quantity, selected_color, image) VALUES
('DH-1001', 1, N'Tai nghe Bluetooth True Wireless Mini V5.3', 189000, 1, N'Trắng Tinh Khôi', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'),
('DH-1001', 5, N'Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W', 59000, 1, N'Xám Titan', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'),
('DH-1002', 3, N'Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel', 489000, 1, N'Trắng Xám', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80');
GO

-- 7. Kiểm tra dữ liệu
SELECT id, name, email, role, status, orders_count FROM dbo.Users ORDER BY id ASC;
GO
