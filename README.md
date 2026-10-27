# BookStore - Hệ Thống Quản Lý & Bán Sách Trực Tuyến

> **ĐỒ ÁN CUỐI KỲ MÔN DEVOPS - LỚP ST23B**  
> **Nhóm thực hiện:** Nhóm 1  
> **Tên đề tài:** BookStore  

---

## 👥 Danh Sách Thành Viên (Nhóm 1 - ST23B)

| STT | Họ và Tên | Vai trò | Email / Tài khoản Admin |
|:---:|:---|:---|:---|
| 1 | **Hoàng Trường Ân** | Thành viên Nhóm 1 | `truongan` (MK: `admin123`) |
| 2 | **Cao Đình Bảo** | Thành viên Nhóm 1 | `dinhbao` (MK: `admin123`) |
| 3 | **Đinh Ngọc Thế Nhân** | Nhóm trưởng | `thenhan` (MK: `admin123`) |
| 4 | **Huỳnh Phước Quân** | Thành viên Nhóm 1 | `phuocquan` (MK: `admin123`) |

---

## 🌟 Giới Thiệu Dự Án BookStore

**BookStore** là nền tảng thương mại điện tử chuyên cung cấp sách trực tuyến (Văn hóa đọc, Công nghệ thông tin & DevOps, Kỹ năng sống, Kinh tế - Quản trị và Văn học nghệ thuật). Dự án được thiết kế chuẩn chỉnh theo mô hình Microservices/Containerized, tích hợp quy trình CI/CD tự động hóa từ Git lên đám mây AWS EC2.

### Điểm nổi bật:
- 📚 **Danh mục sách phong phú:** Tích hợp các tựa sách kinh điển về CNTT & DevOps (*The Phoenix Project*, *The DevOps Handbook*, *Clean Code*), Kỹ năng sống (*Atomic Habits*, *Đắc Nhân Tâm*), Kinh tế & Văn học.
- 🎨 **Giao diện hiện đại & Tối ưu trải nghiệm:** Xây dựng bằng React 18, Vite, Tailwind CSS với hiệu năng cao, hỗ trợ xem thông tin xuất bản, tác giả, chọn phiên bản bìa sách (Bìa mềm, Bìa cứng, Bản đặc biệt) và giỏ hàng thời gian thực.
- 🛡️ **Hệ thống Quản trị (Admin Dashboard):**
  - Quản lý sách (CRUD: Thêm, sửa, xóa, tìm kiếm, lọc theo thể loại, phân trang).
  - Quản lý đơn hàng (theo dõi trạng thái duyệt đơn: Chờ xử lý, Đang giao, Đã giao, Hủy đơn).
  - Quản lý người dùng và phân quyền (Admin / Khách hàng, khóa/mở khóa tài khoản).
  - Đăng nhập nhanh cho cả 4 thành viên nhóm và giảng viên/người chấm bài.
- 🐳 **Đóng gói Docker & Nginx Reverse Proxy:** Toàn bộ ứng dụng bao gồm Frontend (Nginx Alpine), Backend (Node.js Express) và Database (MongoDB) được cô lập và chạy tự động thông qua `docker-compose`.
- 🚀 **CI/CD Tự động hóa qua GitHub Actions:** Tự động kích hoạt khi `git push` lên branch `main`, kết nối SSH vào máy chủ **AWS EC2** và deploy liền mạch không gián đoạn (Zero Downtime / Prune dangling images).

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend API:** Node.js, Express.js, Mongoose.
- **Database:** MongoDB (Containerized) & Kịch bản SQL Server (`database/schema.sql`).
- **Web Server / Reverse Proxy:** Nginx Alpine.
- **DevOps & Cloud:** Docker, Docker Compose, GitHub Actions, AWS EC2.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Chạy môi trường Local Development

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Chạy Frontend bằng Vite
npm run dev

# Mở trình duyệt truy cập: http://localhost:3000
```

### 2. Chạy toàn bộ hệ thống bằng Docker Compose

```bash
# Khởi động toàn bộ Frontend, Backend API và MongoDB
docker compose up -d --build

# Xem logs của các container
docker compose logs -f

# Truy cập ứng dụng:
# - Frontend: http://localhost
# - Backend Health Check: http://localhost:5000/api/health
# - Quản trị hệ thống: http://localhost/admin
```

---

## 🔐 Tài Khoản Kiểm Thử Hệ Thống

### 1. Quản trị viên (Admin Portal - `/admin`)
- **Tài khoản:** `admin` hoặc `thenhan` hoặc `truongan` hoặc `dinhbao` hoặc `phuocquan`
- **Mật khẩu:** `admin123`

### 2. Khách hàng mẫu (Mua sắm & Đặt hàng)
- **Tài khoản 1:** `hoangnam@gmail.com` | Mật khẩu: `kh123`
- **Tài khoản 2:** `thaomy.tran@gmail.com` | Mật khẩu: `kh123`

---

## 🌐 Cấu Hình Git & Triển Khai AWS EC2

- **Git Repository:** `https://github.com/Nhan1703/FrontendDevOps.git`
- **Quy trình CI/CD:** `.github/workflows/deploy.yml` tự động kết nối qua SSH vào thư mục `~/FrontendDevOps` trên AWS EC2, kéo code mới nhất và thực thi `docker compose up -d --build`.
