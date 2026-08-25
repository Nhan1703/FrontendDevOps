# TheNhanShop - Phụ Kiện & Đồ Chơi Công Nghệ Tối Giản (React SPA)

Dự án Frontend thương mại điện tử **TheNhanShop** được xây dựng với **React 18**, **Vite**, **TypeScript**, **Tailwind CSS** và đóng gói Container qua **Docker (Nginx Alpine)** cùng quy trình **CI/CD GitHub Actions**.

---

## 🌟 Điểm Nổi Bật Của TheNhanShop
- 🎨 **Thiết kế Minimalist Tinh Tế:** Tone màu trắng - xám - đen tối giản, hiện đại, chuẩn phong cách setup công nghệ.
- 🔍 **Xem Chi Tiết Sản Phẩm (Product Modal):** Bấm vào bất kỳ sản phẩm nào để xem ảnh lớn, thông số chi tiết, bảo hành, chọn màu sắc/phân loại và số lượng.
- 💰 **Mức Giá Bình Dân & Hợp Lý:** Sản phẩm đa dạng từ 59.000đ đến 489.000đ phù hợp sinh viên và người dùng văn phòng.
- 🛒 **Giỏ Hàng Tương Tác:** Thêm sản phẩm theo từng phân loại màu sắc, tăng/giảm số lượng, tính tổng tiền và thanh toán giả lập.
- ⚡ **Siêu Nhẹ & Nhanh:** Được build bằng Vite và phục vụ qua Nginx Alpine chỉ ~25MB.

---

## 📁 Cấu Trúc Dự Án

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD Workflow tự động build & push Docker image
├── src/
│   ├── App.tsx               # Component chính TheNhanShop (Shop, Modal, Cart, Filter)
│   ├── main.tsx              # Khởi tạo React App
│   └── index.css             # CSS Tailwind & Custom Scrollbar
├── Dockerfile                # Multi-stage Docker build (Node 18 -> Nginx Alpine)
├── nginx.conf                # Cấu hình Nginx phục vụ SPA trên port 80 & 3000
├── docker-compose.yml        # Chạy dự án qua Docker Compose
├── index.html                # HTML entry point
├── package.json              # Khai báo React 18, Vite, Tailwind CSS
├── tailwind.config.ts        # Cấu hình Tailwind CSS
├── tsconfig.json             # Cấu hình TypeScript
└── vite.config.ts            # Cấu hình Vite
```

---

## 🚀 Hướng Dẫn Chạy Local

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy môi trường Dev
npm run dev

# Mở trình duyệt truy cập: http://localhost:3000
```
