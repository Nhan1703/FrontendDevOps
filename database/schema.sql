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
-- 6. CHÈN DỮ LIỆU ĐỒNG BỘ 100% VỚI APP.TSX (USERS, PRODUCTS, ORDERS)
-- =======================================================================

-- 6.1. Danh mục
INSERT INTO dbo.Categories (name, slug) VALUES 
(N'Tai nghe & Loa', 'tai-nghe-loa'),
(N'Bàn phím & Chuột', 'ban-phim-chuot'),
(N'Củ cáp sạc', 'cu-cap-sac'),
(N'Giá đỡ & Phụ kiện bàn', 'gia-do-phu-kien');

-- 6.2. Tài khoản chuẩn chỉ: Admin đầu tàu không có đơn, Khách hàng mới có đơn
INSERT INTO dbo.Users (id, name, email, password, phone, role, status, created_at, orders_count) VALUES 
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', '0900 000 001', 'admin', 'active', '01/01/2026', 0),
('USR-002', N'Nguyễn Văn An', 'nguyenvanan@gmail.com', 'kh123', '0912 345 678', 'customer', 'active', '15/05/2026', 3),
('USR-003', N'Trần Thị Bích', 'bich.tran@gmail.com', 'kh123', '0988 765 432', 'customer', 'active', '22/07/2026', 1),
('USR-004', N'Lê Hoàng Long', 'long.le@gmail.com', 'kh123', '0903 112 233', 'customer', 'active', '10/08/2026', 2),
('USR-005', N'Phạm Minh Đức', 'duc.pham@outlook.com', 'kh123', '0934 556 778', 'customer', 'active', '28/08/2026', 1),
('USR-006', N'Vũ Hải Nam', 'hainam.vu@yahoo.com', 'kh123', '0977 889 900', 'customer', 'active', '02/09/2026', 0),
('USR-007', N'Thế Nhân', 'thenhan', 'admin123', '0917 714 595', 'admin', 'active', '08/09/2026', 0);

-- 6.3. Sản phẩm phong phú (10 sản phẩm công nghệ hot)
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
),
(
    N'Giá đỡ Laptop nhôm nguyên khối xoay 360 độ', 4, N'Giá đỡ & Phụ kiện bàn', 225000, 320000, 4.9, 215,
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    N'Hot Deal',
    N'Giá đỡ nhôm cao cấp chịu tải 10kg, trục xoay 360 độ êm ái, tản nhiệt tối ưu cho MacBook và Laptop 11-17 inch.',
    N'["Hợp kim nhôm nguyên khối", "Khớp xoay 360 độ", "Đệm silicon chống trượt", "Gấp gọn mang đi"]',
    N'["Bạc Ánh Kim", "Xám Không Gian"]'
),
(
    N'Đèn LED thanh treo màn hình chống mỏi mắt Smart Bar', 4, N'Giá đỡ & Phụ kiện bàn', 310000, 450000, 4.8, 168,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    N'Khuyên dùng',
    N'Đèn kẹp màn hình chiếu sáng bàn làm việc không gây chói mắt, tùy chỉnh 3 nhiệt độ màu (3000K-6500K) và độ sáng cảm ứng.',
    N'["Chiếu sáng bất đối xứng", "Cảm ứng chạm", "Nguồn USB 5V", "3 chế độ ánh sáng"]',
    N'["Đen Nhám"]'
),
(
    N'Loa Bluetooth Mini chống nước IPX7 Bass Boost', 1, N'Tai nghe & Loa', 259000, 380000, 4.7, 310,
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    N'Bán chạy',
    N'Loa Bluetooth cầm tay công suất 10W, màng loa thụ động cho âm bass mạnh mẽ, chống nước ngâm IPX7 đi mưa thoải mái.',
    N'["Công suất 10W", "Chống nước IPX7", "Pin 12 tiếng liên tục", "Hỗ trợ thẻ nhớ & AUX"]',
    N'["Xanh Rêu", "Đen", "Đỏ Rực Rỡ"]'
),
(
    N'Hub Type-C 7 trong 1 đa năng cho Laptop / iPad', 3, N'Củ cáp sạc', 345000, 490000, 4.9, 440,
    'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
    N'Yêu thích',
    N'Bộ chia cổng kết nối gồm HDMI 4K@30Hz, 3 cổng USB 3.0, khe thẻ nhớ SD/TF và cổng sạc nhanh Type-C PD 100W.',
    N'["HDMI 4K sắc nét", "Sạc nhanh PD 100W", "USB 3.0 tốc độ 5Gbps", "Vỏ nhôm tản nhiệt"]',
    N'["Xám Titan"]'
),
(
    N'Thảm da lót bàn làm việc Deskpad 2 mặt chống nước 80x40cm', 4, N'Giá đỡ & Phụ kiện bàn', 89000, 150000, 4.8, 620,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    N'Giá tốt',
    N'Lót chuột cỡ lớn chất liệu da PU cao cấp mềm mịn, chống nước chống bám bẩn dễ lau chùi, sử dụng được cả 2 mặt 2 màu khác nhau.',
    N'["Kích thước 80x40cm", "Da PU cao cấp 2 mặt", "Chống thấm nước tuyệt đối", "Tặng kèm dây cuộn da"]',
    N'["Đen - Đỏ", "Xanh Navy - Vàng Bò", "Hồng - Xám"]'
);

-- 6.4. Đơn hàng (Khách hàng đặt đơn, không phải Admin đặt)
INSERT INTO dbo.Orders (id, user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, status, note, created_at) VALUES
('DH-1001', 'USR-002', N'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0912 345 678', N'123 Cầu Giấy, Hà Nội', 248000, 'pending', N'Giao giờ hành chính, gọi trước khi đến', '07/09/2026 14:30'),
('DH-1002', 'USR-003', N'Trần Thị Bích', 'bich.tran@gmail.com', '0988 765 432', N'45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', 489000, 'shipping', N'Giao buổi chiều sau 17h', '06/09/2026 09:15'),
('DH-1003', 'USR-004', N'Lê Hoàng Long', 'long.le@gmail.com', '0903 112 233', N'78 Nguyễn Huệ, Đà Nẵng', 310000, 'delivered', N'Để ở quầy lễ tân giúp mình', '05/09/2026 10:00');

-- 6.5. Chi tiết các mặt hàng trong từng đơn hàng
INSERT INTO dbo.OrderItems (order_id, product_id, product_name, price, quantity, selected_color, image) VALUES
('DH-1001', 1, N'Tai nghe Bluetooth True Wireless Mini V5.3', 189000, 1, N'Trắng Tinh Khôi', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'),
('DH-1001', 5, N'Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W', 59000, 1, N'Xám Titan', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'),
('DH-1002', 3, N'Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel', 489000, 1, N'Trắng Xám', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80'),
('DH-1003', 7, N'Đèn LED thanh treo màn hình chống mỏi mắt Smart Bar', 310000, 1, N'Đen Nhám', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80');
GO

-- 7. Kiểm tra dữ liệu hoàn tất
SELECT COUNT(*) AS UsersCount FROM dbo.Users;
SELECT COUNT(*) AS ProductsCount FROM dbo.Products;
SELECT COUNT(*) AS OrdersCount FROM dbo.Orders;
SELECT COUNT(*) AS OrderItemsCount FROM dbo.OrderItems;
GO
