// ==============================================================================
// SCRIPT SINH KỊCH BẢN SQL SERVER VỚI ĐẦY ĐỦ 5 DANH MỤC THỰC TẾ & 300 SÁCH
// ==============================================================================
import fs from 'fs';

const books = JSON.parse(fs.readFileSync('server/seed/books-300.json', 'utf8'));

const sqlHeader = `-- ==============================================================================
-- KỊCH BẢN TẠO BẢNG CƠ SỞ DỮ LIỆU & NẠP DỮ LIỆU BAN ĐẦU (DDL & SEED DML 300 SÁCH)
-- Học phần: DevOps ST23B - Nhóm 1 - Đề tài: Online Bookstore
-- Hệ quản trị cơ sở dữ liệu: Microsoft SQL Server (Tương thích PostgreSQL / MySQL)
-- ==============================================================================

IF OBJECT_ID('dbo.OrderDetails', 'U') IS NOT NULL DROP TABLE dbo.OrderDetails;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id NVARCHAR(50) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(30) NOT NULL DEFAULT 'Customer',
    PhoneNumber NVARCHAR(20) NULL,
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_Users_Email ON dbo.Users(Email);
GO

CREATE TABLE dbo.Categories (
    Id INT PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    Slug NVARCHAR(150) NULL
);
CREATE INDEX IX_Categories_Name ON dbo.Categories(Name);
GO

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
    Status NVARCHAR(30) NOT NULL DEFAULT 'pending',
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_Orders_Total CHECK (TotalAmount >= 0)
);
CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE INDEX IX_Orders_OrderDate ON dbo.Orders(OrderDate);
GO

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

-- SEED USERS
INSERT INTO dbo.Users (Id, FullName, Email, PasswordHash, Role, PhoneNumber, Status, CreatedAt) VALUES
('USR-001', N'Quản trị viên (Admin)', 'admin', 'admin123', 'Admin', '0900000001', 'active', '2026-01-01T00:00:00'),
('USR-002', N'Đinh Ngọc Thế Nhân (Nhóm trưởng)', 'thenhan', 'admin123', 'Admin', '0917714595', 'active', '2026-08-09T00:00:00'),
('USR-003', N'Hoàng Trường Ân (Nhóm 1)', 'truongan', 'admin123', 'Admin', '0901112233', 'active', '2026-08-09T00:00:00'),
('USR-004', N'Cao Đình Bảo (Nhóm 1)', 'dinhbao', 'admin123', 'Admin', '0902223344', 'active', '2026-08-09T00:00:00'),
('USR-005', N'Huỳnh Phước Quân (Nhóm 1)', 'phuocquan', 'admin123', 'Admin', '0903334455', 'active', '2026-08-09T00:00:00'),
('USR-006', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', 'kh123', 'Customer', '0912345678', 'active', '2026-05-15T00:00:00'),
('USR-007', N'Trần Thảo My', 'thaomy.tran@gmail.com', 'kh123', 'Customer', '0988765432', 'active', '2026-07-22T00:00:00');
GO

-- SEED 5 DANH MỤC THỰC TẾ CỦA NHÀ SÁCH
INSERT INTO dbo.Categories (Id, Name, Description, Slug) VALUES
(1, N'Công nghệ thông tin', N'Sách giáo trình, lập trình, khoa học máy tính, trí tuệ nhân tạo và an toàn thông tin.', 'cong-nghe-thong-tin'),
(2, N'Kỹ năng sống', N'Phát triển bản thân, tư duy thấu cảm, tâm lý học ứng dụng và quản lý thời gian.', 'ky-nang-song'),
(3, N'Kinh tế & Quản trị', N'Khởi nghiệp, quản trị doanh nghiệp, tài chính, đầu tư chứng khoán và marketing.', 'kinh-te-quan-tri'),
(4, N'Văn học & Nghệ thuật', N'Tiểu thuyết kinh điển, văn học Việt Nam, truyện ngắn và tác phẩm nghệ thuật thế giới.', 'van-hoc-nghe-thuat'),
(5, N'Ngoại ngữ & Từ điển', N'Sách học tiếng Anh, TOEIC, IELTS, tiếng Nhật, tiếng Hàn, tiếng Trung và từ điển chuyên ngành.', 'ngoai-ngu-tu-dien');
GO
`;

let bookInserts = '-- SEED 300 BOOKS THỰC TẾ\n';
for (let i = 0; i < books.length; i += 50) {
  const chunk = books.slice(i, i + 50);
  bookInserts += 'INSERT INTO dbo.Books (Id, Title, Author, CategoryId, Price, StockQuantity, ImageUrl, IsActive, Description) VALUES\n';
  const rows = chunk.map((b) => {
    const titleEscaped = b.title.replace(/'/g, "''");
    const authorEscaped = b.author.replace(/'/g, "''");
    const descEscaped = b.description.replace(/'/g, "''");
    return `(${b.id}, N'${titleEscaped}', N'${authorEscaped}', ${b.categoryId}, ${b.price}, ${b.stockQuantity}, '${b.imageUrl}', 1, N'${descEscaped}')`;
  });
  bookInserts += rows.join(',\n') + ';\nGO\n\n';
}

const sqlOrders = `
-- SEED MẪU ORDERS & ORDER_DETAILS
INSERT INTO dbo.Orders (Id, UserId, OrderDate, TotalAmount, ShippingAddress, CustomerName, CustomerEmail, CustomerPhone, PaymentMethod, PaymentStatus, Status, Note) VALUES
('DH-1001', 'USR-006', '2026-09-07T14:30:00', 317000, N'123 Cầu Giấy, Hà Nội', N'Nguyễn Hoàng Nam', 'hoangnam@gmail.com', '0912345678', 'COD', 'Unpaid', 'pending', N'Giao giờ hành chính, gọi trước khi đến'),
('DH-1002', 'USR-007', '2026-09-06T09:15:00', 195000, N'45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', N'Trần Thảo My', 'thaomy.tran@gmail.com', '0988765432', 'Banking', 'Paid', 'shipping', N'Giao buổi chiều sau 17h');
GO

INSERT INTO dbo.OrderDetails (Id, OrderId, BookId, UnitPrice, Quantity, SubTotal) VALUES
('DH-1001-D1', 'DH-1001', 1, 168000, 1, 168000),
('DH-1001-D2', 'DH-1001', 4, 149000, 1, 149000),
('DH-1002-D1', 'DH-1002', 3, 195000, 1, 195000);
GO
`;

fs.writeFileSync('database/schema_and_seed.sql', sqlHeader + bookInserts + sqlOrders, 'utf8');
console.log('✅ Đã cập nhật thành công database/schema_and_seed.sql chứa 5 danh mục thực tế và 300 sản phẩm!');
