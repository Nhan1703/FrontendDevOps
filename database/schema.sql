-- =======================================================================
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU & BẢNG CHO DỰ ÁN BOOKSTORE (MÔN DEVOPS ST23B)
-- Nhóm thực hiện: Nhóm 1
-- Thành viên:
-- 1. Hoàng Trường Ân
-- 2. Cao Đình Bảo
-- 3. Đinh Ngọc Thế Nhân
-- 4. Huỳnh Phước Quân
-- Hệ quản trị: Microsoft SQL Server / Tương thích MongoDB
-- =======================================================================

-- Xóa các bảng cũ nếu đã tồn tại để tránh xung đột khóa ngoại
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- =======================================================================
-- 1. BẢNG USERS (Người dùng & Quản trị viên Nhóm 1)
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
-- 2. BẢNG CATEGORIES (Danh mục sách BookStore)
-- =======================================================================
CREATE TABLE dbo.Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    slug NVARCHAR(100) NULL,
    description NVARCHAR(255) NULL
);
GO

-- =======================================================================
-- 3. BẢNG PRODUCTS (Danh mục sách BookStore)
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
    specs NVARCHAR(MAX) NULL,                     -- Thông tin xuất bản (JSON)
    colors NVARCHAR(MAX) NULL,                    -- Phiên bản bìa sách (JSON)
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES dbo.Categories(id) ON DELETE SET NULL
);
GO

-- =======================================================================
-- 4. BẢNG ORDERS (Đơn đặt mua sách)
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
-- 5. BẢNG ORDER_ITEMS (Chi tiết tựa sách trong đơn hàng)
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
-- 6. DỮ LIỆU BAN ĐẦU ĐỒNG BỘ CHO BOOKSTORE (NHÓM 1 - DEVOPS ST23B)
-- =======================================================================

-- 6.1. Danh mục sách
INSERT INTO dbo.Categories (name, slug) VALUES 
(N'Công nghệ & DevOps', 'cong-nghe-devops'),
(N'Kỹ năng sống', 'ky-nang-song'),
(N'Kinh tế & Quản trị', 'kinh-te-quan-tri'),
(N'Văn học & Nghệ thuật', 'van-hoc-nghe-thuat');

-- 6.2. Tài khoản: Quản trị viên Nhóm 1 và Khách hàng
INSERT INTO dbo.Users (id, name, email, password, phone, role, status, created_at, orders_count) VALUES 
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', '0900 000 001', 'admin', 'active', '01/01/2026', 0),
('USR-002', N'Đinh Ngọc Thế Nhân (Nhóm 1)', 'thenhan', 'admin123', '0917 714 595', 'admin', 'active', '08/09/2026', 0),
('USR-003', N'Hoàng Trường Ân (Nhóm 1)', 'truongan', 'admin123', '0901 112 233', 'admin', 'active', '08/09/2026', 0),
('USR-004', N'Cao Đình Bảo (Nhóm 1)', 'dinhbao', 'admin123', '0902 223 344', 'admin', 'active', '08/09/2026', 0),
('USR-005', N'Huỳnh Phước Quân (Nhóm 1)', 'phuocquan', 'admin123', '0903 334 455', 'admin', 'active', '08/09/2026', 0),
('USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', 'kh123', '0912 345 678', 'customer', 'active', '15/05/2026', 2),
('USR-007', N'Trần Thảo My', 'thaomy.tran@gmail.com', 'kh123', '0988 765 432', 'customer', 'active', '22/07/2026', 1);

-- 6.3. Sản phẩm Sách
INSERT INTO dbo.Products (name, category_id, category, price, original_price, rating, reviews_count, image, tag, description, specs, colors) VALUES
(
    N'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)', 1, N'Công nghệ & DevOps', 168000, 220000, 4.9, 320,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    N'Khuyên đọc',
    N'Tác phẩm kinh điển gối đầu giường của mọi kỹ sư DevOps và quản lý CNTT thế giới. Cuốn sách kể về hành trình cứu vãn dự án công nghệ bờ vực sụp đổ thông qua phương pháp DevOps, Agile và Lean IT.',
    N'["Tác giả: Gene Kim, Kevin Behr, George Spafford", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 440 trang"]',
    N'["Bìa mềm tiêu chuẩn", "Bìa cứng (Hardcover)", "Bản đặc biệt kèm Bookmark"]'
),
(
    N'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập', 1, N'Công nghệ & DevOps', 215000, 285000, 5.0, 195,
    'https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80',
    N'Bán chạy',
    N'Cẩm nang toàn diện nhất hướng dẫn cách triển khai CI/CD, tự động hóa hạ tầng (IaC), văn hóa cộng tác Dev-Ops và đảm bảo độ tin cậy hệ thống trong kỷ nguyên điện toán đám mây.',
    N'["Tác giả: Gene Kim, Jez Humble, Patrick Debois", "NXB: NXB Dân Trí", "Năm XB: 2024", "Số trang: 520 trang"]',
    N'["Bìa mềm", "Bìa cứng cao cấp"]'
),
(
    N'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu', 1, N'Công nghệ & DevOps', 195000, 260000, 4.9, 450,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    N'Kinh điển',
    N'Cuốn sách bất hủ giúp mọi lập trình viên nâng tầm tư duy viết code: đặt tên có ý nghĩa, xây dựng hàm ngắn gọn, xử lý lỗi chuẩn mực và giữ kiến trúc mã nguồn luôn trong sáng dễ bảo trì.',
    N'["Tác giả: Robert C. Martin (Uncle Bob)", "NXB: NXB Thông Tin & Truyền Thông", "Năm XB: 2023", "Số trang: 464 trang"]',
    N'["Bìa mềm tiêu chuẩn", "Bìa cứng giới hạn"]'
),
(
    N'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', 2, N'Kỹ năng sống', 149000, 199000, 4.9, 880,
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    N'Bán chạy',
    N'Bí quyết thay đổi cuộc sống qua những thói quen nhỏ mỗi ngày. James Clear chỉ ra 4 quy luật đơn giản giúp bạn kiên trì xây dựng thói quen tốt và dễ dàng loại bỏ thói quen xấu.',
    N'["Tác giả: James Clear", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 380 trang"]',
    N'["Bìa mềm ép kim", "Bản bìa cứng có bookmark"]'
),
(
    N'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người', 2, N'Kỹ năng sống', 88000, 120000, 4.8, 1250,
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    N'Yêu thích',
    N'Tác phẩm bất hủ về nghệ thuật đối nhân xử thế và giao tiếp chân thành, giúp bạn xây dựng mối quan hệ tốt đẹp với bạn bè, đồng nghiệp và đối tác trong cuộc sống.',
    N'["Tác giả: Dale Carnegie", "NXB: NXB Tổng Hợp TP.HCM", "Năm XB: 2024", "Số trang: 320 trang"]',
    N'["Bìa mềm", "Bìa cứng mạ vàng"]'
),
(
    N'Nhà Đầu Tư Thông Minh (The Intelligent Investor)', 3, N'Kinh tế & Quản trị', 235000, 310000, 4.9, 310,
    'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80',
    N'Hot Deal',
    N'Kinh thánh về triết lý đầu tư giá trị của Benjamin Graham - người thầy vĩ đại của tỷ phú Warren Buffett. Cuốn sách định hình tư duy tài chính và quản trị rủi ro vững chắc.',
    N'["Tác giả: Benjamin Graham", "NXB: NXB Lao Động Xã Hội", "Năm XB: 2023", "Số trang: 640 trang"]',
    N'["Bìa mềm", "Bìa cứng gáy may"]'
),
(
    N'Khởi Nghiệp Tinh Gọn (The Lean Startup)', 3, N'Kinh tế & Quản trị', 155000, 210000, 4.8, 260,
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    N'Khuyên đọc',
    N'Mô hình phát triển sản phẩm đột phá với vòng lặp Build - Measure - Learn giúp startup và doanh nghiệp công nghệ kiểm chứng giả định nhanh chóng với chi phí tối thiểu.',
    N'["Tác giả: Eric Ries", "NXB: NXB Công Thương", "Năm XB: 2023", "Số trang: 370 trang"]',
    N'["Bìa mềm", "Bản bìa cứng"]'
),
(
    N'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm', 4, N'Văn học & Nghệ thuật', 79000, 105000, 4.9, 950,
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    N'Bán chạy',
    N'Hành trình vượt sa mạc đi tìm kho báu của chàng chăn cừu Santiago gửi gắm bức thông điệp sâu sắc: Khi bạn thực sự quyết tâm, cả vũ trụ sẽ hợp lực giúp bạn đạt được ước mơ.',
    N'["Tác giả: Paulo Coelho", "NXB: NXB Hội Nhà Văn", "Năm XB: 2024", "Số trang: 228 trang"]',
    N'["Bìa mềm kinh điển", "Bìa cứng minh họa"]'
),
(
    N'Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt', 4, N'Văn học & Nghệ thuật', 92000, 125000, 5.0, 780,
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    N'Yêu thích',
    N'Một trong những cuốn sách văn học Brazil xúc động nhất về tâm hồn trong trẻo, giàu lòng trắc ẩn của cậu bé năm tuổi Zezé và tình bạn ấm áp diệu kỳ.',
    N'["Tác giả: José Mauro de Vasconcelos", "NXB: NXB Hội Nhà Văn", "Năm XB: 2023", "Số trang: 244 trang"]',
    N'["Bìa mềm minh họa", "Bản bìa cứng kỷ niệm"]'
),
(
    N'Deep Work - Làm Ra Làm, Chơi Ra Chơi', 2, N'Kỹ năng sống', 135000, 180000, 4.8, 340,
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    N'Ưu đãi SV',
    N'Chiến lược rèn luyện khả năng tập trung cao độ trong thời đại bùng nổ thông tin và mạng xã hội. Phương pháp làm việc sâu giúp nâng cao chất lượng đầu ra vượt bậc.',
    N'["Tác giả: Cal Newport", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 350 trang"]',
    N'["Bìa mềm", "Bìa cứng"]'
);

-- 6.4. Đơn đặt sách mẫu
INSERT INTO dbo.Orders (id, user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, status, note, created_at) VALUES
('DH-1001', 'USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', '0912 345 678', N'123 Cầu Giấy, Hà Nội', 317000, 'pending', N'Giao giờ hành chính, gọi trước khi đến', '07/09/2026 14:30'),
('DH-1002', 'USR-007', N'Trần Thảo My', 'thaomy.tran@gmail.com', '0988 765 432', N'45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', 195000, 'shipping', N'Giao buổi chiều sau 17h', '06/09/2026 09:15'),
('DH-1003', 'USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', '0912 345 678', N'123 Cầu Giấy, Hà Nội', 79000, 'delivered', N'Để ở quầy lễ tân giúp mình', '05/09/2026 10:00');

-- 6.5. Chi tiết các tựa sách trong đơn hàng
INSERT INTO dbo.OrderItems (order_id, product_id, product_name, price, quantity, selected_color, image) VALUES
('DH-1001', 1, N'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)', 168000, 1, N'Bìa mềm tiêu chuẩn', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'),
('DH-1001', 4, N'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', 149000, 1, N'Bìa mềm ép kim', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'),
('DH-1002', 3, N'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu', 195000, 1, N'Bìa mềm tiêu chuẩn', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'),
('DH-1003', 8, N'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm', 79000, 1, N'Bìa mềm kinh điển', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80');
GO

-- 7. Kiểm tra dữ liệu hoàn tất
SELECT COUNT(*) AS UsersCount FROM dbo.Users;
SELECT COUNT(*) AS ProductsCount FROM dbo.Products;
SELECT COUNT(*) AS OrdersCount FROM dbo.Orders;
SELECT COUNT(*) AS OrderItemsCount FROM dbo.OrderItems;
GO
