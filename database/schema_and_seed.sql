-- ==============================================================================
-- KỊCH BẢN TẠO BẢNG CƠ SỞ DỮ LIỆU & NẠP DỮ LIỆU BAN ĐẦU (DDL & SEED DML)
-- Học phần: DevOps ST23B - Nhóm 1 - Đề tài: Online Bookstore
-- Hệ quản trị cơ sở dữ liệu: Microsoft SQL Server (Tương thích PostgreSQL / MySQL)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PHẦN 1: XÓA CÁC BẢNG CŨ NẾU ĐÃ TỒN TẠI (THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI)
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.OrderDetails', 'U') IS NOT NULL DROP TABLE dbo.OrderDetails;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ------------------------------------------------------------------------------
-- PHẦN 2: TẠO BẢNG CƠ SỞ DỮ LIỆU (DDL)
-- ------------------------------------------------------------------------------

-- 1. BẢNG USERS (Người dùng & Quản trị viên)
CREATE TABLE dbo.Users (
    Id NVARCHAR(50) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(30) NOT NULL DEFAULT 'Customer', -- 'Admin', 'Customer'
    PhoneNumber NVARCHAR(20) NULL,
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_Users_Email ON dbo.Users(Email);
GO

-- 2. BẢNG CATEGORIES (Thể loại & Danh mục sách)
CREATE TABLE dbo.Categories (
    Id INT PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    Slug NVARCHAR(150) NULL
);
CREATE INDEX IX_Categories_Name ON dbo.Categories(Name);
GO

-- 3. BẢNG BOOKS (Sản phẩm sách trực tuyến)
CREATE TABLE dbo.Books (
    Id INT PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Author NVARCHAR(150) NOT NULL DEFAULT N'Nhiều tác giả',
    CategoryId INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(500) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Books_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Books_Price CHECK (Price >= 0),
    CONSTRAINT CHK_Books_Stock CHECK (StockQuantity >= 0)
);
CREATE INDEX IX_Books_CategoryId ON dbo.Books(CategoryId);
CREATE INDEX IX_Books_Price ON dbo.Books(Price);
GO

-- 4. BẢNG ORDERS (Hóa đơn đặt hàng)
CREATE TABLE dbo.Orders (
    Id NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NULL,
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL,
    ShippingAddress NVARCHAR(350) NOT NULL,
    CustomerName NVARCHAR(150) NOT NULL,
    CustomerEmail NVARCHAR(150) NOT NULL,
    CustomerPhone NVARCHAR(20) NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'COD',
    PaymentStatus NVARCHAR(30) DEFAULT 'Unpaid',
    Status NVARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipping', 'delivered', 'cancelled'
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_Orders_Total CHECK (TotalAmount >= 0)
);
CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE INDEX IX_Orders_OrderDate ON dbo.Orders(OrderDate);
GO

-- 5. BẢNG ORDER_DETAILS (Chi tiết mặt hàng trong đơn hàng)
CREATE TABLE dbo.OrderDetails (
    Id NVARCHAR(50) PRIMARY KEY,
    OrderId NVARCHAR(50) NOT NULL,
    BookId INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    SubTotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderDetails_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id),
    CONSTRAINT CHK_OrderDetails_Quantity CHECK (Quantity >= 1),
    CONSTRAINT CHK_OrderDetails_UnitPrice CHECK (UnitPrice >= 0)
);
CREATE INDEX IX_OrderDetails_OrderId ON dbo.OrderDetails(OrderId);
CREATE INDEX IX_OrderDetails_BookId ON dbo.OrderDetails(BookId);
GO

-- ------------------------------------------------------------------------------
-- PHẦN 3: NẠP DỮ LIỆU BAN ĐẦU CHUYỂN ĐỔI TỪ MONGODB (SEED DML)
-- ------------------------------------------------------------------------------

-- 1. Seed Dữ liệu Users (Bao gồm Quản trị viên Nhóm 1 và Khách hàng mẫu)
INSERT INTO dbo.Users (Id, FullName, Email, PasswordHash, Role, PhoneNumber, Status, CreatedAt) VALUES
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', 'Admin', '0900000001', 'active', '2026-01-01T00:00:00'),
('USR-002', N'Đinh Ngọc Thế Nhân (Nhóm trưởng)', 'thenhan', 'admin123', 'Admin', '0917714595', 'active', '2026-08-09T00:00:00'),
('USR-003', N'Hoàng Trường Ân (Nhóm 1)', 'truongan', 'admin123', 'Admin', '0901112233', 'active', '2026-08-09T00:00:00'),
('USR-004', N'Cao Đình Bảo (Nhóm 1)', 'dinhbao', 'admin123', 'Admin', '0902223344', 'active', '2026-08-09T00:00:00'),
('USR-005', N'Huỳnh Phước Quân (Nhóm 1)', 'phuocquan', 'admin123', 'Admin', '0903334455', 'active', '2026-08-09T00:00:00'),
('USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', 'kh123', 'Customer', '0912345678', 'active', '2026-05-15T00:00:00'),
('USR-007', N'Trần Thảo My', 'thaomy.tran@gmail.com', 'kh123', 'Customer', '0988765432', 'active', '2026-07-22T00:00:00');
GO

-- 2. Seed Dữ liệu Categories
INSERT INTO dbo.Categories (Id, Name, Description, Slug) VALUES
(1, N'Công nghệ & DevOps', N'Sách chuyên sâu về kiến trúc phần mềm, DevOps, CI/CD và Cloud.', 'cong-nghe-devops'),
(2, N'Kỹ năng sống', N'Phát triển bản thân, tư duy thấu cảm và năng suất làm việc.', 'ky-nang-song'),
(3, N'Kinh tế & Quản trị', N'Khởi nghiệp, quản trị dự án tinh gọn và tài chính đầu tư.', 'kinh-te-quan-tri'),
(4, N'Văn học & Nghệ thuật', N'Tiểu thuyết kinh điển và tác phẩm truyền cảm hứng thế giới.', 'van-hoc-nghe-thuat');
GO

-- 3. Seed Dữ liệu 10 Đầu Sách Ban Đầu từ MongoDB
INSERT INTO dbo.Books (Id, Title, Author, CategoryId, Price, StockQuantity, ImageUrl, IsActive, Description) VALUES
(1, N'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)', N'Gene Kim, Kevin Behr, George Spafford', 1, 168000, 45, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 1, N'Tác phẩm kinh điển gối đầu giường của mọi kỹ sư DevOps và quản lý CNTT thế giới.'),
(2, N'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập', N'Gene Kim, Jez Humble, Patrick Debois', 1, 215000, 30, 'https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80', 1, N'Cẩm nang toàn diện nhất hướng dẫn triển khai CI/CD, tự động hóa hạ tầng (IaC) và SRE.'),
(3, N'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu', N'Robert C. Martin (Uncle Bob)', 1, 195000, 25, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', 1, N'Quy chuẩn lập trình tối thượng giúp viết mã nguồn sạch, dễ mở rộng và bảo trì dài hạn.'),
(4, N'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', N'James Clear', 2, 149000, 80, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', 1, N'4 quy luật tâm lý học đơn giản để xây dựng thói quen tốt và loại bỏ thói quen xấu.'),
(5, N'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người', N'Dale Carnegie', 2, 88000, 120, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', 1, N'Cuốn sách bất hủ hướng dẫn nghệ thuật ứng xử và kết nối chân thành giữa người với người.'),
(6, N'Nhà Đầu Tư Thông Minh (The Intelligent Investor)', N'Benjamin Graham', 3, 235000, 18, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80', 1, N'Triết lý đầu tư giá trị kinh điển định hình tư duy của các nhà đầu tư vĩ đại nhất thế giới.'),
(7, N'Khởi Nghiệp Tinh Gọn (The Lean Startup)', N'Eric Ries', 3, 155000, 35, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80', 1, N'Phương pháp kiểm chứng giả định nhanh chóng và giảm thiểu rủi ro cho sản phẩm công nghệ.'),
(8, N'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm', N'Paulo Coelho', 4, 79000, 60, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', 1, N'Hành trình vượt sa mạc tìm kho báu và bài học lắng nghe ước mơ đích thực của tâm hồn.'),
(9, N'Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt', N'José Mauro de Vasconcelos', 4, 92000, 4, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', 1, N'Câu chuyện cảm động về sự đồng cảm và tình yêu thương của tuổi thơ ngây thơ trong sáng.'),
(10, N'Deep Work - Làm Ra Làm, Chơi Ra Chơi', N'Cal Newport', 2, 135000, 3, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', 1, N'Phương pháp tập trung cao độ để bứt phá năng suất lao động trí tuệ trong kỷ nguyên số.');
GO

-- 4. Seed Dữ liệu Đơn hàng mẫu (Orders)
INSERT INTO dbo.Orders (Id, UserId, OrderDate, TotalAmount, ShippingAddress, CustomerName, CustomerEmail, CustomerPhone, PaymentMethod, PaymentStatus, Status, Note) VALUES
('DH-1001', 'USR-006', '2026-09-07T14:30:00', 317000, N'123 Cầu Giấy, Hà Nội', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', '0912345678', 'COD', 'Unpaid', 'pending', N'Giao giờ hành chính, gọi trước khi đến'),
('DH-1002', 'USR-007', '2026-09-06T09:15:00', 195000, N'45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', N'Trần Thảo My', 'thaomy.tran@gmail.com', '0988765432', 'Banking', 'Paid', 'shipping', N'Giao buổi chiều sau 17h');
GO

-- 5. Seed Dữ liệu Chi tiết đơn hàng mẫu (OrderDetails)
INSERT INTO dbo.OrderDetails (Id, OrderId, BookId, UnitPrice, Quantity, SubTotal) VALUES
('DH-1001-D1', 'DH-1001', 1, 168000, 1, 168000),
('DH-1001-D2', 'DH-1001', 4, 149000, 1, 149000),
('DH-1002-D1', 'DH-1002', 3, 195000, 1, 195000);
GO
