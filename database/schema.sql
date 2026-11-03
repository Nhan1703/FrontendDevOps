-- =======================================================================
-- KIẾN TRÚC CƠ SỞ DỮ LIỆU CHUẨN HÓA 3NF - BOOKSTORE SYSTEM
-- Học phần: DevOps ST23B - Nhóm 1
-- Đề tài: Hệ Thống Quản Lý và Bán Sách Trực Tuyến (Bookstore System)
-- Thành viên:
--   1. Hoàng Trường Ân
--   2. Cao Đình Bảo
--   3. Đinh Ngọc Thế Nhân (Nhóm trưởng)
--   4. Huỳnh Phước Quân
-- Hệ quản trị: Microsoft SQL Server / Tương thích MongoDB & PostgreSQL
-- =======================================================================

-- Xóa các bảng cũ theo thứ tự ràng buộc khóa ngoại
IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Coupons', 'U') IS NOT NULL DROP TABLE dbo.Coupons;
IF OBJECT_ID('dbo.CartItems', 'U') IS NOT NULL DROP TABLE dbo.CartItems;
IF OBJECT_ID('dbo.Carts', 'U') IS NOT NULL DROP TABLE dbo.Carts;
IF OBJECT_ID('dbo.BookImages', 'U') IS NOT NULL DROP TABLE dbo.BookImages;
IF OBJECT_ID('dbo.BookCategories', 'U') IS NOT NULL DROP TABLE dbo.BookCategories;
IF OBJECT_ID('dbo.BookAuthors', 'U') IS NOT NULL DROP TABLE dbo.BookAuthors;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Publishers', 'U') IS NOT NULL DROP TABLE dbo.Publishers;
IF OBJECT_ID('dbo.Authors', 'U') IS NOT NULL DROP TABLE dbo.Authors;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.UserAddresses', 'U') IS NOT NULL DROP TABLE dbo.UserAddresses;
IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DROP TABLE dbo.UserRoles;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- =======================================================================
-- 1. BẢNG USERS (Người dùng hệ thống)
-- =======================================================================
CREATE TABLE dbo.Users (
    Id NVARCHAR(50) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_Users_Email ON dbo.Users(Email);
GO

-- =======================================================================
-- 2. BẢNG ROLES & USER_ROLES (Phân quyền RBAC)
-- =======================================================================
CREATE TABLE dbo.Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE -- 'Admin', 'Staff', 'Customer'
);

CREATE TABLE dbo.UserRoles (
    UserId NVARCHAR(50) NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE
);
GO

-- =======================================================================
-- 3. BẢNG USER_ADDRESSES (Sổ địa chỉ giao hàng của khách)
-- =======================================================================
CREATE TABLE dbo.UserAddresses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    RecipientName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    AddressLine NVARCHAR(255) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NOT NULL,
    IsDefault BIT DEFAULT 0,
    CONSTRAINT FK_UserAddresses_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserAddresses_UserId ON dbo.UserAddresses(UserId);
GO

-- =======================================================================
-- 4. BẢNG CATEGORIES (Thể loại sách - Hỗ trợ cây phân cấp Cha - Con)
-- =======================================================================
CREATE TABLE dbo.Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Slug NVARCHAR(120) NOT NULL UNIQUE,
    ParentId INT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentId) REFERENCES dbo.Categories(Id) ON DELETE NO ACTION
);
CREATE INDEX IX_Categories_ParentId ON dbo.Categories(ParentId);
GO

-- =======================================================================
-- 5. BẢNG AUTHORS (Tác giả)
-- =======================================================================
CREATE TABLE dbo.Authors (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Bio NVARCHAR(MAX) NULL,
    AvatarUrl NVARCHAR(500) NULL
);
GO

-- =======================================================================
-- 6. BẢNG PUBLISHERS (Nhà xuất bản)
-- =======================================================================
CREATE TABLE dbo.Publishers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL UNIQUE,
    Address NVARCHAR(255) NULL,
    Website NVARCHAR(255) NULL
);
GO

-- =======================================================================
-- 7. BẢNG BOOKS (Sách)
-- =======================================================================
CREATE TABLE dbo.Books (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(280) NOT NULL UNIQUE,
    ISBN NVARCHAR(30) NOT NULL UNIQUE,
    PublisherId INT NULL,
    PublicationYear INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    DiscountPrice DECIMAL(18,2) NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    Description NVARCHAR(MAX) NULL,
    CoverImageUrl NVARCHAR(500) NOT NULL,
    PageCount INT NOT NULL DEFAULT 0,
    Weight INT NOT NULL DEFAULT 350,               -- Đơn vị: gram
    Rating FLOAT DEFAULT 5.0,
    ReviewsCount INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Books_Publishers FOREIGN KEY (PublisherId) REFERENCES dbo.Publishers(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_Books_Stock CHECK (StockQuantity >= 0)
);
CREATE INDEX IX_Books_ISBN ON dbo.Books(ISBN);
CREATE INDEX IX_Books_Price ON dbo.Books(Price);
CREATE INDEX IX_Books_Rating ON dbo.Books(Rating);
GO

-- =======================================================================
-- 8. BẢNG BOOK_AUTHORS & BOOK_CATEGORIES (Quan hệ nhiều - nhiều N:N)
-- =======================================================================
CREATE TABLE dbo.BookAuthors (
    BookId INT NOT NULL,
    AuthorId INT NOT NULL,
    PRIMARY KEY (BookId, AuthorId),
    CONSTRAINT FK_BookAuthors_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookAuthors_Authors FOREIGN KEY (AuthorId) REFERENCES dbo.Authors(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.BookCategories (
    BookId INT NOT NULL,
    CategoryId INT NOT NULL,
    PRIMARY KEY (BookId, CategoryId),
    CONSTRAINT FK_BookCategories_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookCategories_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id) ON DELETE CASCADE
);
GO

-- =======================================================================
-- 9. BẢNG BOOK_IMAGES (Thư viện ảnh chi tiết / Preview)
-- =======================================================================
CREATE TABLE dbo.BookImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    DisplayOrder INT DEFAULT 0,
    CONSTRAINT FK_BookImages_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE CASCADE
);
GO

-- =======================================================================
-- 10. BẢNG CARTS & CART_ITEMS (Giỏ hàng người dùng)
-- =======================================================================
CREATE TABLE dbo.Carts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL UNIQUE,
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

CREATE TABLE dbo.CartItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CartId INT NOT NULL,
    BookId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartId) REFERENCES dbo.Carts(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Cart_Book UNIQUE (CartId, BookId)
);
GO

-- =======================================================================
-- 11. BẢNG COUPONS (Mã giảm giá & Khuyến mãi)
-- =======================================================================
CREATE TABLE dbo.Coupons (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    DiscountType NVARCHAR(20) NOT NULL,           -- 'Percentage' hoặc 'FixedAmount'
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinOrderAmount DECIMAL(18,2) DEFAULT 0,
    MaxDiscountAmount DECIMAL(18,2) NULL,
    UsageLimit INT DEFAULT 100,
    UsedCount INT DEFAULT 0,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    IsActive BIT DEFAULT 1
);
CREATE INDEX IX_Coupons_Code ON dbo.Coupons(Code);
GO

-- =======================================================================
-- 12. BẢNG ORDERS & ORDER_ITEMS (Quản lý đơn hàng & chi tiết)
-- =======================================================================
CREATE TABLE dbo.Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderCode NVARCHAR(50) NOT NULL UNIQUE,        -- vd: DH-9082
    UserId NVARCHAR(50) NULL,
    RecipientName NVARCHAR(150) NOT NULL,
    RecipientPhone NVARCHAR(20) NOT NULL,
    ShippingAddress NVARCHAR(350) NOT NULL,
    TotalBookAmount DECIMAL(18,2) NOT NULL,
    ShippingFee DECIMAL(18,2) DEFAULT 0,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    FinalAmount DECIMAL(18,2) NOT NULL,
    CouponId INT NULL,
    OrderStatus NVARCHAR(30) DEFAULT 'Pending',    -- 'Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'
    PaymentMethod NVARCHAR(50) DEFAULT 'COD',      -- 'COD', 'VNPay', 'MoMo', 'Banking'
    PaymentStatus NVARCHAR(30) DEFAULT 'Unpaid',   -- 'Unpaid', 'Paid', 'Refunded'
    Note NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Orders_Coupons FOREIGN KEY (CouponId) REFERENCES dbo.Coupons(Id) ON DELETE SET NULL
);
CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE INDEX IX_Orders_OrderCode ON dbo.Orders(OrderCode);

CREATE TABLE dbo.OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    BookId INT NULL,
    BookTitle NVARCHAR(255) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE SET NULL
);
GO

-- =======================================================================
-- 13. BẢNG REVIEWS (Đánh giá & Nhận xét từ khách hàng)
-- =======================================================================
CREATE TABLE dbo.Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    BookId INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX) NULL,
    IsApproved BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(Id) ON DELETE CASCADE
);
CREATE INDEX IX_Reviews_BookId ON dbo.Reviews(BookId);
GO

-- =======================================================================
-- 14. DỮ LIỆU KHỞI TẠO (SEED DATA)
-- =======================================================================

-- 14.1. Vai trò Roles
INSERT INTO dbo.Roles (RoleName) VALUES ('Admin'), ('Staff'), ('Customer');

-- 14.2. Người dùng & Phân quyền Nhóm 1 - DevOps ST23B
INSERT INTO dbo.Users (Id, FullName, Email, PasswordHash, PhoneNumber) VALUES
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', '0900000001'),
('USR-002', N'Đinh Ngọc Thế Nhân (Nhóm trưởng)', 'thenhan', 'admin123', '0917714595'),
('USR-003', N'Hoàng Trường Ân', 'truongan', 'admin123', '0901112233'),
('USR-004', N'Cao Đình Bảo', 'dinhbao', 'admin123', '0902223344'),
('USR-005', N'Huỳnh Phước Quân', 'phuocquan', 'admin123', '0903334455'),
('USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', 'kh123', '0912345678'),
('USR-007', N'Trần Thảo My', 'thaomy.tran@gmail.com', 'kh123', '0988765432');

INSERT INTO dbo.UserRoles (UserId, RoleId) VALUES
('USR-001', 1),
('USR-002', 1),
('USR-003', 1),
('USR-004', 1),
('USR-005', 1),
('USR-006', 3),
('USR-007', 3);

-- 14.3. Thể loại sách Categories (Hỗ trợ cha-con)
INSERT INTO dbo.Categories (Name, Slug, ParentId) VALUES
(N'Công nghệ & DevOps', 'cong-nghe-devops', NULL),
(N'Kỹ năng sống', 'ky-nang-song', NULL),
(N'Kinh tế & Quản trị', 'kinh-te-quan-tri', NULL),
(N'Văn học & Nghệ thuật', 'van-hoc-nghe-thuat', NULL);

-- 14.4. Nhà xuất bản Publishers
INSERT INTO dbo.Publishers (Name, Address, Website) VALUES
(N'NXB Thế Giới', N'Hà Nội', 'https://thegioipublishers.vn'),
(N'NXB Dân Trí', N'Hà Nội', 'https://nxbtriduc.com.vn'),
(N'NXB Thông Tin & Truyền Thông', N'Hà Nội', 'https://nxbthongtintruyenthong.vn'),
(N'NXB Tổng Hợp TP.HCM', N'TP. Hồ Chí Minh', 'https://nxbhcm.com.vn'),
(N'NXB Lao Động Xã Hội', N'Hà Nội', 'https://nxblaodong.vn'),
(N'NXB Hội Nhà Văn', N'Hà Nội', 'https://nxbhoinhavan.vn');

-- 14.5. Tác giả Authors
INSERT INTO dbo.Authors (Name, Bio) VALUES
(N'Gene Kim', N'Nhà tiên phong và tác giả hàng đầu thế giới về phong trào DevOps và chuyển đổi số.'),
(N'Robert C. Martin (Uncle Bob)', N'Huyền thoại kỹ nghệ phần mềm, đồng tác giả Tuyên ngôn Agile và Clean Architecture.'),
(N'James Clear', N'Chuyên gia tâm lý học hành vi và tác giả cuốn sách Atomic Habits bán chạy toàn cầu.'),
(N'Dale Carnegie', N'Bậc thầy vĩ đại về nghệ thuật đối nhân xử thế và giao tiếp truyền cảm hứng.'),
(N'Benjamin Graham', N'Cha đẻ của phương pháp đầu tư giá trị, người thầy huyền thoại của Warren Buffett.'),
(N'Paulo Coelho', N'Đại văn hào Brazil với tác phẩm Nhà Giả Kim được dịch ra hơn 80 thứ tiếng.');

-- 14.6. Mã giảm giá Coupons
INSERT INTO dbo.Coupons (Code, DiscountType, DiscountValue, MinOrderAmount, MaxDiscountAmount, UsageLimit, UsedCount, StartDate, EndDate, IsActive) VALUES
('DEVOPS20', 'Percentage', 20, 200000, 50000, 200, 0, '2026-01-01', '2026-12-31', 1),
('BOOKSTORE10', 'Percentage', 10, 100000, 30000, 500, 0, '2026-01-01', '2026-12-31', 1),
('BANMOI50K', 'FixedAmount', 50000, 300000, 50000, 100, 0, '2026-01-01', '2026-12-31', 1);

-- 14.7. Danh mục Sách Books
INSERT INTO dbo.Books (Title, Slug, ISBN, PublisherId, PublicationYear, Price, DiscountPrice, StockQuantity, Description, CoverImageUrl, PageCount, Weight) VALUES
(N'The Phoenix Project - Dự Án Phượng Hoàng', 'the-phoenix-project', '978-604-77-8491-1', 1, 2023, 220000, 168000, 45, N'Cuốn tiểu thuyết bất hủ về CNTT, văn hóa DevOps và phương pháp Lean IT giúp cứu nguy tổ chức trong kỷ nguyên số.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 440, 480),
(N'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập', 'the-devops-handbook', '978-604-88-9120-5', 2, 2024, 285000, 215000, 30, N'Hướng dẫn chi tiết triển khai CI/CD, tự động hóa hạ tầng IaC, độ tin cậy hệ thống và văn hóa phối hợp giữa Dev và Ops.', 'https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80', 520, 560),
(N'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ', 'clean-code', '978-604-80-3211-0', 3, 2023, 260000, 195000, 25, N'Quy chuẩn viết code sạch, dễ đọc, dễ kiểm thử và bảo trì dành cho mọi kỹ sư phần mềm chuyên nghiệp.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', 464, 520),
(N'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ', 'atomic-habits', '978-604-77-9812-3', 1, 2023, 199000, 149000, 80, N'Bốn quy luật đơn giản giúp xây dựng thói quen tốt bền vững và loại bỏ những thói quen tiêu cực.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', 380, 420),
(N'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người', 'dac-nhan-tam', '978-604-58-7124-9', 4, 2024, 120000, 88000, 120, N'Tác phẩm kinh điển thế giới về nghệ thuật kết nối, giao tiếp và truyền cảm hứng trong công việc và cuộc sống.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', 320, 350),
(N'Nhà Đầu Tư Thông Minh (The Intelligent Investor)', 'the-intelligent-investor', '978-604-59-9921-9', 5, 2023, 310000, 235000, 18, N'Triết lý đầu tư giá trị và kiểm soát cảm xúc tài chính trường tồn của người thầy huyền thoại Benjamin Graham.', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80', 640, 680),
(N'Khởi Nghiệp Tinh Gọn (The Lean Startup)', 'the-lean-startup', '978-604-96-8812-4', 1, 2023, 210000, 155000, 35, N'Phương pháp kiểm chứng nhanh sản phẩm với chu trình Build - Measure - Learn giúp tối ưu hóa chi phí và giảm thiểu rủi ro.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80', 370, 400),
(N'Nhà Giả Kim (The Alchemist) - Bản Kỷ Niệm', 'nha-gia-kim', '978-604-53-4819-2', 6, 2024, 105000, 79000, 60, N'Hành trình tìm kiếm kho báu và sứ mệnh cuộc đời: Khi bạn khao khát điều gì, cả vũ trụ sẽ hợp lực giúp bạn.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', 228, 280);
GO
