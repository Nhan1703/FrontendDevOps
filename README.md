# TechZone - Website Bán Đồ Công Nghệ & CI/CD Pipeline (Docker & GitHub Actions)

Dự án Frontend bán đồ công nghệ cao cấp (Laptop, Smartphone, Tai nghe, Gaming Gear, Smartwatch) được xây dựng bằng **Next.js 14**, **Tailwind CSS**, **TypeScript** và được cấu hình quy trình CI/CD hoàn chỉnh theo tài liệu hướng dẫn DevOps.

---

## 🌟 Tính Năng Frontend (TechZone)
- 🛍️ **Danh mục sản phẩm đa dạng**: Laptop, Điện thoại, Tai nghe & Loa, Gaming Gear, Smartwatch.
- 🔍 **Tìm kiếm & Bộ lọc tức thì**: Tìm kiếm theo tên sản phẩm, lọc theo danh mục.
- 🛒 **Giỏ hàng tương tác**: Thêm sản phẩm vào giỏ, điều chỉnh số lượng, tính tổng tiền, đặt hàng giả lập.
- ⚡ **Giao diện hiện đại, tối ưu UX/UI**: Responsive toàn diện trên Mobile, Tablet, Desktop.

---

## 📁 Cấu Trúc Dự Án

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # Workflow CI/CD tự động build & push Docker image lên Docker Hub
├── src/
│   └── app/
│       ├── globals.css       # File CSS cấu hình Tailwind
│       ├── layout.tsx        # Root layout Next.js
│       └── page.tsx          # Giao diện chính cửa hàng công nghệ TechZone
├── .dockerignore             # Bỏ qua các tệp không cần thiết khi build Docker image
├── .gitignore                # Bỏ qua node_modules, build cache khi push Git
├── Dockerfile                # Cấu hình Multi-stage Docker build (builder & runner)
├── docker-compose.yml        # Khởi chạy ứng dụng dễ dàng qua Docker Compose
├── next.config.mjs           # Cấu hình Next.js
├── package.json              # Khai báo dependencies và scripts
├── postcss.config.mjs        # Cấu hình PostCSS
├── tailwind.config.ts        # Cấu hình Tailwind CSS
└── tsconfig.json             # Cấu hình TypeScript
```

---

## 🚀 Hướng Dẫn Chạy Tại Môi Trường Local

### Cách 1: Chạy trực tiếp bằng Node.js / npm
```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy môi trường phát triển (Development)
npm run dev

# Mở trình duyệt truy cập: http://localhost:3000
```

### Cách 2: Chạy với Docker & Docker Compose
```bash
# Build và khởi chạy container
docker-compose up --build -d

# Xem log container
docker-compose logs -f

# Dừng container
docker-compose down
```

---

## 🛠️ Hướng Dẫn CI/CD & Triển Khai (Theo Hướng Dẫn Bài Học)

### Bước 1: Khởi tạo Git và Push lên GitHub
```bash
git init
git add .
git commit -m "feat: init techzone frontend store with docker & github actions"
git branch -M main
git remote add origin git@github.com:<your-username>/<your-repo-name>.git
git push -u origin main
```

### Bước 2: Cấu hình GitHub Secrets
Vào GitHub Repository của bạn:
👉 **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ Chọn **New repository secret**:
- `DOCKER_USERNAME`: Username hoặc Docker ID trên Docker Hub.
- `DOCKER_PASSWORD`: Personal Access Token trên Docker Hub.

### Bước 3: Triển khai lên Render (Web Service)
1. Đăng nhập [Render Dashboard](https://dashboard.render.com/).
2. Chọn **+ New** ➔ **Web Service**.
3. Kết nối với Repository GitHub của bạn.
4. Chọn gói **Free ($0/month)**.
5. Render sẽ tự động build từ Dockerfile hoặc mã nguồn và cung cấp URL truy cập web.
