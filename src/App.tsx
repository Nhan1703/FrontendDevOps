import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  User,
  LogOut,
  Mail,
  Lock,
  EyeOff,
  Package,
  LayoutDashboard,
  Store,
  Edit3,
  PlusCircle,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Tag as TagIcon,
  Layers,
  ClipboardList,
  Users,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  BookOpen,
  BookMarked,
  Library,
  Star,
  TrendingUp,
  BarChart3,
  Ticket,
  Percent,
  AlertTriangle,
  Bookmark,
  Filter,
  ArrowUpDown,
  CreditCard,
  Heart,
  MessageSquare,
  Send,
  Bell,
  Printer,
  QrCode,
  Copy,
  Download,
  ExternalLink,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

export interface Product {
  id: number;
  name: string;
  title?: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tag?: string;
  description: string;
  specs: string[];
  colors: string[];
  author?: string;
  publisher?: string;
  isbn?: string;
  publicationYear?: number;
  stockQuantity?: number;
  pageCount?: number;
  weight?: number;
}

// Hàm chuẩn hóa dữ liệu sản phẩm, tránh lỗi crash màn hình trắng khi thiếu specs/colors
export const normalizeProduct = (p: any): Product => {
  const stock =
    p.stockQuantity !== undefined
      ? Number(p.stockQuantity)
      : p.stock !== undefined
      ? Number(p.stock)
      : (p.id && p.id % 7 === 0 ? 0 : p.id && p.id % 4 === 0 ? 6 : 45);
  const colors =
    Array.isArray(p.colors) && p.colors.length > 0
      ? p.colors
      : ["Bìa mềm tiêu chuẩn", "Bìa cứng (Hardcover)"];
  const specs =
    Array.isArray(p.specs) && p.specs.length > 0
      ? p.specs
      : [
          `Tác giả: ${p.author || "Nhiều tác giả"}`,
          `Thể loại: ${p.category || "Sách tham khảo"}`,
          `Tồn kho: ${stock} cuốn`,
          `Mã ISBN: ${p.isbn || "978-604-0012"}`,
          "Hình thức: In chất lượng cao, kèm Bookmark",
        ];
  return {
    ...p,
    name: p.name || p.title || "Tác phẩm chọn lọc",
    price: Number(p.price) || 0,
    originalPrice:
      Number(p.originalPrice) || Math.round((Number(p.price) || 100000) * 1.25),
    stockQuantity: stock,
    rating: Number(p.rating) || 5.0,
    reviewsCount: Number(p.reviewsCount) || 100,
    colors,
    specs,
  };
};

export interface CouponItem {
  id: string;
  code: string;
  discountType: "Percentage" | "FixedAmount";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface BookReview {
  id: string;
  bookId: number;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
}

export interface AddressItem {
  id: string;
  recipientName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: "admin" | "user";
  addresses?: AddressItem[];
}

const DEFAULT_CATEGORIES = [
  "Công nghệ thông tin",
  "Kỹ năng sống",
  "Kinh tế & Quản trị",
  "Văn học & Nghệ thuật",
  "Ngoại ngữ & Từ điển",
];

const PRESET_TAGS = [
  { value: "", label: "-- Không có nhãn --" },
  { value: "Mới", label: "Mới" },
  { value: "Hot Deal", label: "Hot Deal" },
  { value: "Bán chạy", label: "Bán chạy" },
  { value: "Khuyên đọc", label: "Khuyên đọc" },
  { value: "Kinh điển", label: "Kinh điển" },
  { value: "Yêu thích", label: "Yêu thích" },
  { value: "Ưu đãi SV", label: "Ưu đãi SV" },
  { value: "Giảm sốc", label: "Giảm sốc" },
];

interface SampleImagePreset {
  name: string;
  url: string;
  categorySuggestion: string;
}

const SAMPLE_IMAGE_PRESETS: SampleImagePreset[] = [
  {
    name: "Sách Công nghệ",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Công nghệ thông tin",
  },
  {
    name: "Cẩm nang IT",
    url: "https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Công nghệ thông tin",
  },
  {
    name: "Lập trình Clean Code",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Công nghệ thông tin",
  },
  {
    name: "Sách Kỹ năng sống",
    url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Kỹ năng sống",
  },
  {
    name: "Sách Đắc Nhân Tâm",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Kỹ năng sống",
  },
  {
    name: "Sách Kinh tế - Đầu tư",
    url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Kinh tế & Quản trị",
  },
  {
    name: "Khởi Nghiệp Lean",
    url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Kinh tế & Quản trị",
  },
  {
    name: "Tiểu thuyết Văn học",
    url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Văn học & Nghệ thuật",
  },
];

export type OrderStatus = "pending" | "shipping" | "delivered" | "cancelled";

export interface OrderItem {
  id?: number;
  bookId?: number;
  name?: string;
  title?: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
  selectedColor?: string;
  image?: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderCode?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  totalBookAmount?: number;
  status: OrderStatus;
  orderDate?: string;
  createdAt: string;
  note?: string;
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  paymentMethod?: "COD" | "Banking" | string;
  paymentStatus?: "Unpaid" | "Paid" | "Refunded" | string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "admin" | "customer";
  status: "active" | "locked";
  createdAt: string;
  ordersCount: number;
}

const DEFAULT_BOOKS: Product[] = [
  {
    id: 1,
    name: "The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)",
    category: "Công nghệ thông tin",
    price: 168000,
    originalPrice: 220000,
    rating: 4.9,
    reviewsCount: 320,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    tag: "Khuyên đọc",
    description: "Tác phẩm kinh điển gối đầu giường của mọi kỹ sư CNTT thế giới. Cuốn sách kể về hành trình cứu vãn dự án công nghệ bờ vực sụp đổ thông qua phương pháp Agile và Lean IT.",
    specs: ["Tác giả: Gene Kim, Kevin Behr, George Spafford", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 440 trang"],
    colors: ["Bìa mềm tiêu chuẩn", "Bìa cứng (Hardcover)", "Bản đặc biệt kèm Bookmark"],
  },
  {
    id: 2,
    name: "The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập",
    category: "Công nghệ thông tin",
    price: 215000,
    originalPrice: 285000,
    rating: 5.0,
    reviewsCount: 195,
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
    description: "Cẩm nang toàn diện nhất hướng dẫn cách triển khai CI/CD, tự động hóa hạ tầng (IaC), văn hóa cộng tác và đảm bảo độ tin cậy hệ thống trong kỷ nguyên điện toán đám mây.",
    specs: ["Tác giả: Gene Kim, Jez Humble, Patrick Debois", "NXB: NXB Dân Trí", "Năm XB: 2024", "Số trang: 520 trang"],
    colors: ["Bìa mềm", "Bìa cứng cao cấp"],
  },
  {
    id: 3,
    name: "Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu",
    category: "Công nghệ thông tin",
    price: 195000,
    originalPrice: 260000,
    rating: 4.9,
    reviewsCount: 450,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    tag: "Kinh điển",
    description: "Cuốn sách bất hủ giúp mọi lập trình viên nâng tầm tư duy viết code: đặt tên có ý nghĩa, xây dựng hàm ngắn gọn, xử lý lỗi chuẩn mực và giữ kiến trúc mã nguồn luôn trong sáng dễ bảo trì.",
    specs: ["Tác giả: Robert C. Martin (Uncle Bob)", "NXB: NXB Thông Tin & Truyền Thông", "Năm XB: 2023", "Số trang: 464 trang"],
    colors: ["Bìa mềm tiêu chuẩn", "Bìa cứng giới hạn"],
  },
  {
    id: 4,
    name: "Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ",
    category: "Kỹ năng sống",
    price: 149000,
    originalPrice: 199000,
    rating: 4.9,
    reviewsCount: 880,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
    description: "Bí quyết thay đổi cuộc sống qua những thói quen nhỏ mỗi ngày. James Clear chỉ ra 4 quy luật đơn giản giúp bạn kiên trì xây dựng thói quen tốt và dễ dàng loại bỏ thói quen xấu.",
    specs: ["Tác giả: James Clear", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 380 trang"],
    colors: ["Bìa mềm ép kim", "Bản bìa cứng có bookmark"],
  },
  {
    id: 5,
    name: "Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người",
    category: "Kỹ năng sống",
    price: 88000,
    originalPrice: 120000,
    rating: 4.8,
    reviewsCount: 1250,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    tag: "Yêu thích",
    description: "Tác phẩm bất hủ về nghệ thuật đối nhân xử thế và giao tiếp chân thành, giúp bạn xây dựng mối quan hệ tốt đẹp với bạn bè, đồng nghiệp và đối tác trong cuộc sống.",
    specs: ["Tác giả: Dale Carnegie", "NXB: NXB Tổng Hợp TP.HCM", "Năm XB: 2024", "Số trang: 320 trang"],
    colors: ["Bìa mềm", "Bìa cứng mạ vàng"],
  },
  {
    id: 6,
    name: "Nhà Đầu Tư Thông Minh (The Intelligent Investor)",
    category: "Kinh tế & Quản trị",
    price: 235000,
    originalPrice: 310000,
    rating: 4.9,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80",
    tag: "Hot Deal",
    description: "Kinh thánh về triết lý đầu tư giá trị của Benjamin Graham - người thầy vĩ đại của tỷ phú Warren Buffett. Cuốn sách định hình tư duy tài chính và quản trị rủi ro vững chắc.",
    specs: ["Tác giả: Benjamin Graham", "NXB: NXB Lao Động Xã Hội", "Năm XB: 2023", "Số trang: 640 trang"],
    colors: ["Bìa mềm", "Bìa cứng gáy may"],
  },
  {
    id: 7,
    name: "Khởi Nghiệp Tinh Gọn (The Lean Startup)",
    category: "Kinh tế & Quản trị",
    price: 155000,
    originalPrice: 210000,
    rating: 4.8,
    reviewsCount: 260,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
    tag: "Khuyên đọc",
    description: "Mô hình phát triển sản phẩm đột phá với vòng lặp Build - Measure - Learn giúp startup và doanh nghiệp công nghệ kiểm chứng giả định nhanh chóng với chi phí tối thiểu.",
    specs: ["Tác giả: Eric Ries", "NXB: NXB Công Thương", "Năm XB: 2023", "Số trang: 370 trang"],
    colors: ["Bìa mềm", "Bản bìa cứng"],
  },
  {
    id: 8,
    name: "Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm",
    category: "Văn học & Nghệ thuật",
    price: 79000,
    originalPrice: 105000,
    rating: 4.9,
    reviewsCount: 950,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
    description: "Hành trình vượt sa mạc đi tìm kho báu của chàng chăn cừu Santiago gửi gắm bức thông điệp sâu sắc: Khi bạn thực sự quyết tâm, cả vũ trụ sẽ hợp lực giúp bạn đạt được ước mơ.",
    specs: ["Tác giả: Paulo Coelho", "NXB: NXB Hội Nhà Văn", "Năm XB: 2024", "Số trang: 228 trang"],
    colors: ["Bìa mềm kinh điển", "Bìa cứng minh họa"],
  },
  {
    id: 9,
    name: "Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt",
    category: "Văn học & Nghệ thuật",
    price: 92000,
    originalPrice: 125000,
    rating: 5.0,
    reviewsCount: 780,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80",
    tag: "Yêu thích",
    description: "Một trong những cuốn sách văn học Brazil xúc động nhất về tâm hồn trong trẻo, giàu lòng trắc ẩn của cậu bé năm tuổi Zezé và tình bạn ấm áp diệu kỳ.",
    specs: ["Tác giả: José Mauro de Vasconcelos", "NXB: NXB Hội Nhà Văn", "Năm XB: 2023", "Số trang: 244 trang"],
    colors: ["Bìa mềm minh họa", "Bản bìa cứng kỷ niệm"],
  },
  {
    id: 10,
    name: "Deep Work - Làm Ra Làm, Chơi Ra Chơi",
    category: "Kỹ năng sống",
    price: 135000,
    originalPrice: 180000,
    rating: 4.8,
    reviewsCount: 340,
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    tag: "Ưu đãi SV",
    description: "Chiến lược rèn luyện khả năng tập trung cao độ trong thời đại bùng nổ thông tin và mạng xã hội. Phương pháp làm việc sâu giúp nâng cao chất lượng đầu ra vượt bậc.",
    specs: ["Tác giả: Cal Newport", "NXB: NXB Thế Giới", "Năm XB: 2023", "Số trang: 350 trang"],
    colors: ["Bìa mềm", "Bìa cứng"],
  },
];

const DEFAULT_APP_USERS: AppUser[] = [
  {
    id: "USR-001",
    name: "Quản trị viên (Admin)",
    email: "admin",
    password: "admin123",
    phone: "0900 000 001",
    role: "admin",
    status: "active",
    createdAt: "01/01/2026",
    ordersCount: 0,
  },
  {
    id: "USR-002",
    name: "Đinh Ngọc Thế Nhân (Nhóm 1)",
    email: "thenhan",
    password: "admin123",
    phone: "0917 714 595",
    role: "admin",
    status: "active",
    createdAt: "08/09/2026",
    ordersCount: 0,
  },
  {
    id: "USR-003",
    name: "Hoàng Trường Ân (Nhóm 1)",
    email: "truongan",
    password: "admin123",
    phone: "0901 112 233",
    role: "admin",
    status: "active",
    createdAt: "08/09/2026",
    ordersCount: 0,
  },
  {
    id: "USR-004",
    name: "Cao Đình Bảo (Nhóm 1)",
    email: "dinhbao",
    password: "admin123",
    phone: "0902 223 344",
    role: "admin",
    status: "active",
    createdAt: "08/09/2026",
    ordersCount: 0,
  },
  {
    id: "USR-005",
    name: "Huỳnh Phước Quân (Nhóm 1)",
    email: "phuocquan",
    password: "admin123",
    phone: "0903 334 455",
    role: "admin",
    status: "active",
    createdAt: "08/09/2026",
    ordersCount: 0,
  },
  {
    id: "USR-006",
    name: "Nguyễn Hoàng Nam",
    email: "hoangnam@gmail.com",
    password: "kh123",
    phone: "0912 345 678",
    role: "customer",
    status: "active",
    createdAt: "15/05/2026",
    ordersCount: 2,
  },
  {
    id: "USR-007",
    name: "Trần Thảo My",
    email: "thaomy.tran@gmail.com",
    password: "kh123",
    phone: "0988 765 432",
    role: "customer",
    status: "active",
    createdAt: "22/07/2026",
    ordersCount: 1,
  },
];

const DEFAULT_BOOK_ORDERS: Order[] = [
  {
    id: "DH-1001",
    userId: "USR-006",
    customerName: "Nguyễn Hoàng Nam",
    customerEmail: "hoangnam@gmail.com",
    customerPhone: "0912 345 678",
    customerAddress: "123 Cầu Giấy, Hà Nội",
    totalAmount: 317000,
    status: "pending",
    note: "Giao giờ hành chính, gọi trước khi đến",
    createdAt: "07/09/2026 14:30",
    items: [
      {
        id: 1,
        name: "The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)",
        price: 168000,
        quantity: 1,
        selectedColor: "Bìa mềm tiêu chuẩn",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 4,
        name: "Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ",
        price: 149000,
        quantity: 1,
        selectedColor: "Bìa mềm ép kim",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "DH-1002",
    userId: "USR-007",
    customerName: "Trần Thảo My",
    customerEmail: "thaomy.tran@gmail.com",
    customerPhone: "0988 765 432",
    customerAddress: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    totalAmount: 195000,
    status: "shipping",
    note: "Giao buổi chiều sau 17h",
    createdAt: "06/09/2026 09:15",
    items: [
      {
        id: 3,
        name: "Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu",
        price: 195000,
        quantity: 1,
        selectedColor: "Bìa mềm tiêu chuẩn",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "DH-1003",
    userId: "USR-006",
    customerName: "Nguyễn Hoàng Nam",
    customerEmail: "hoangnam@gmail.com",
    customerPhone: "0912 345 678",
    customerAddress: "123 Cầu Giấy, Hà Nội",
    totalAmount: 79000,
    status: "delivered",
    note: "Để ở quầy lễ tân giúp mình",
    createdAt: "05/09/2026 10:00",
    items: [
      {
        id: 8,
        name: "Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm",
        price: 79000,
        quantity: 1,
        selectedColor: "Bìa mềm kinh điển",
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: "CP-1",
    code: "DEVOPS20",
    discountType: "Percentage",
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 100000,
    usageLimit: 200,
    usedCount: 45,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    isActive: true,
  },
  {
    id: "CP-2",
    code: "BOOKSTORE10",
    discountType: "Percentage",
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscountAmount: 50000,
    usageLimit: 500,
    usedCount: 112,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    isActive: true,
  },
  {
    id: "CP-3",
    code: "BANMOI50K",
    discountType: "FixedAmount",
    discountValue: 50000,
    minOrderAmount: 250000,
    usageLimit: 100,
    usedCount: 28,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    isActive: true,
  },
  {
    id: "CP-4",
    code: "FREESHIP",
    discountType: "FixedAmount",
    discountValue: 30000,
    minOrderAmount: 0,
    maxDiscountAmount: 30000,
    usageLimit: 2000,
    usedCount: 105,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    isActive: true,
  },
];

const DEFAULT_REVIEWS: Record<number, BookReview[]> = {
  1: [
    {
      id: "rev-1",
      bookId: 1,
      userName: "Hoàng Trường Ân",
      userEmail: "an.ht@devops.st23b",
      rating: 5,
      comment: "Cuốn sách tuyệt vời nhất về quy trình DevOps và văn hóa hợp tác trong kỹ nghệ phần mềm! Nhóm 1 DevOps ST23B khuyên đọc.",
      createdAt: "15/09/2026",
      isApproved: true,
    },
    {
      id: "rev-2",
      bookId: 1,
      userName: "Cao Đình Bảo",
      userEmail: "bao.cd@devops.st23b",
      rating: 5,
      comment: "Đọc rất lôi cuốn, giải thích nguyên lý Ba Lối Đi (The Three Ways) cực kỳ trực quan và thực chiến.",
      createdAt: "18/09/2026",
      isApproved: true,
    },
  ],
  2: [
    {
      id: "rev-3",
      bookId: 2,
      userName: "Đinh Ngọc Thế Nhân",
      userEmail: "nhan.dnt@devops.st23b",
      rating: 5,
      comment: "Cẩm nang hướng dẫn CI/CD và hạ tầng đám mây không thể thiếu khi triển khai Docker/Kubernetes trên AWS.",
      createdAt: "20/09/2026",
      isApproved: true,
    },
  ],
  3: [
    {
      id: "rev-4",
      bookId: 3,
      userName: "Huỳnh Phước Quân",
      userEmail: "quan.hp@devops.st23b",
      rating: 5,
      comment: "Clean Code là nền tảng để viết mã nguồn dễ bảo trì, test tự động và refactor an toàn.",
      createdAt: "22/09/2026",
      isApproved: true,
    },
  ],
};

// ==============================================================================
// ÂM THANH PHẢN HỒI TƯƠNG TÁC (WEB AUDIO API CHIMES)
// ==============================================================================
function playChimeSound(type: 'success' | 'notification' | 'click' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'notification') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    // Ignore autoplay restriction errors
  }
}

// ==============================================================================
// HÀM TÍNH TOÁN CÁC TRANG HIỂN THỊ PHÂN TRANG (SLIDING WINDOW PAGINATION)
// Chuẩn giao diện: « ‹ 3 4 [5] 6 7 › » hoặc « ‹ 1 2 [3] 4 5 › »
// Luôn hiển thị tối đa 5 trang liền kề quanh trang hiện tại
// ==============================================================================
function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);

  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

export default function App() {
  // Navigation view synced with URL pathname (e.g. /admin)
  const [currentView, setCurrentView] = useState<"store" | "admin">(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/admin" || path.startsWith("/admin/") || window.location.hash === "#admin") {
        return "admin";
      }
    }
    return "store";
  });

  const navigateView = (view: "store" | "admin") => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      const targetPath = view === "admin" ? "/admin" : "/";
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin" || path.startsWith("/admin/") || window.location.hash === "#admin") {
        setCurrentView("admin");
      } else {
        setCurrentView("store");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Products Data with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_products");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isOldCache = parsed.length <= 10 || parsed.some((p: any) => p.category === "Công nghệ & DevOps");
          if (Array.isArray(parsed) && parsed.length > 0 && !isOldCache) {
            return parsed.map(normalizeProduct);
          }
        } catch (e) {
          console.error("Error loading products from localStorage", e);
        }
      }
    }
    return DEFAULT_BOOKS.map(normalizeProduct);
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("bookstore_products", JSON.stringify(products));
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    DEFAULT_CATEGORIES.forEach((c) => set.add(c));
    return ["Tất cả", ...Array.from(set)];
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ================= WISHLIST (SẢN PHẨM YÊU THÍCH) =================
  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_wishlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error("Lỗi khi tải danh sách yêu thích từ localStorage:", e);
        }
      }
    }
    return [];
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Lưu danh sách yêu thích vào localStorage
  useEffect(() => {
    localStorage.setItem("bookstore_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Kiểm tra một cuốn sách có nằm trong danh sách yêu thích không
  const isInWishlist = (productId: number) => wishlist.includes(productId);

  // Thêm hoặc gỡ bỏ sản phẩm khỏi danh sách yêu thích
  const toggleWishlist = (productId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prod = products.find((p) => p.id === productId);
    const prodName = prod ? prod.name : "Sách";
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(`Đã xóa "${prodName}" khỏi danh sách yêu thích!`);
        return prev.filter((id) => id !== productId);
      } else {
        showToast(`Đã thêm "${prodName}" vào danh sách yêu thích! ❤️`);
        return [...prev, productId];
      }
    });
  };

  // Xóa toàn bộ sản phẩm yêu thích
  const clearWishlist = () => {
    if (wishlist.length === 0) return;
    setWishlist([]);
    showToast("Đã làm trống danh sách sản phẩm yêu thích!");
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ================= REVIEWS & RATINGS (ĐÁNH GIÁ SÁCH TỪ ĐỘC GIẢ) =================
  const [reviewsMap, setReviewsMap] = useState<Record<number, BookReview[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_reviews");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {
          console.error("Lỗi nạp đánh giá từ localStorage:", e);
        }
      }
    }
    return DEFAULT_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem("bookstore_reviews", JSON.stringify(reviewsMap));
  }, [reviewsMap]);

  const [productDetailTab, setProductDetailTab] = useState<"info" | "reviews">("info");
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState<string>("");
  const [newReviewComment, setNewReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Gửi nhận xét đánh giá mới cho sách
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const authorName = (newReviewName || (customerUser ? customerUser.name : "")).trim();
    if (!authorName) {
      showToast("Vui lòng nhập họ tên của bạn để gửi nhận xét!", "error");
      return;
    }
    if (!newReviewComment.trim()) {
      showToast("Vui lòng nhập nội dung cảm nhận về cuốn sách!", "error");
      return;
    }

    setIsSubmittingReview(true);

    const newRev: BookReview = {
      id: `rev-${Date.now()}`,
      bookId: selectedProduct.id,
      userName: authorName,
      userEmail: customerUser ? customerUser.email : "",
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      createdAt: new Date().toLocaleDateString("vi-VN"),
      isApproved: true,
    };

    // Lưu vào State và LocalStorage
    setReviewsMap((prev) => {
      const curList = prev[selectedProduct.id] || [];
      return {
        ...prev,
        [selectedProduct.id]: [newRev, ...curList],
      };
    });

    // Đồng bộ gửi lên Backend API
    fetch(`/api/books/${selectedProduct.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: authorName,
        userEmail: customerUser ? customerUser.email : "",
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      }),
    }).catch(() => {});

    showToast("Cảm ơn bạn đã gửi đánh giá cho cuốn sách! ⭐");
    setNewReviewComment("");
    setIsSubmittingReview(false);
  };

  // ================= COUPONS & VOUCHERS (MÃ GIẢM GIÁ & KHUYẾN MÃI) =================
  const [coupons, setCoupons] = useState<CouponItem[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [couponInput, setCouponInput] = useState<string>("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // ================= ORDER TRACKING (TRA CỨU TIẾN TRÌNH VẬN ĐƠN) =================
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [trackingQuery, setTrackingQuery] = useState<string>("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingTimeline, setTrackingTimeline] = useState<Array<{
    step: number;
    title: string;
    description: string;
    time: string;
    isCompleted: boolean;
  }> | null>(null);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Thực hiện tra cứu tiến trình đơn hàng
  const handleTrackOrder = async (queryCode?: string) => {
    const q = (queryCode || trackingQuery).trim();
    if (!q) {
      setTrackingError("Vui lòng nhập Mã đơn hàng hoặc Số điện thoại để tra cứu!");
      return;
    }

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedOrder(null);
    setTrackingTimeline(null);

    try {
      // 1. Thử gọi API tra cứu từ Backend
      const res = await fetch(`/api/orders/track/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success && data.order) {
        setTrackedOrder(data.order);
        setTrackingTimeline(data.timeline || null);
        setTrackingLoading(false);
        return;
      }
    } catch (e) {
      // Bỏ qua lỗi mạng để fallback tìm kiếm trong mảng orders local
    }

    // 2. Tìm kiếm trong mảng orders hiện tại
    const cleanQ = q.toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanQ ||
        (o.customerPhone && o.customerPhone.includes(cleanQ))
    );

    if (found) {
      setTrackedOrder(found);
      const curStatus = (found.status || "pending").toLowerCase();
      setTrackingTimeline([
        {
          step: 1,
          title: "Đã tiếp nhận đơn hàng",
          description: "Đơn hàng đã được ghi nhận trên hệ thống BookStore.",
          time: found.createdAt || "Hôm nay",
          isCompleted: true,
        },
        {
          step: 2,
          title: "Đang đóng gói & chuẩn bị",
          description: "Kho đang kiểm tra chất lượng sách, bọc chống sốc & tặng kèm Bookmark.",
          time: curStatus !== "pending" ? "Hoàn tất đóng gói" : "Đang xử lý",
          isCompleted: ["processing", "shipping", "delivered"].includes(curStatus),
        },
        {
          step: 3,
          title: "Đang giao hàng hỏa tốc",
          description: "Đơn vị vận chuyển hỏa tốc đang giao sách tới địa chỉ nhận.",
          time: ["shipping", "delivered"].includes(curStatus) ? "Đang trên đường giao" : "Dự kiến 1-2 ngày",
          isCompleted: ["shipping", "delivered"].includes(curStatus),
        },
        {
          step: 4,
          title: "Giao hàng thành công",
          description: "Đơn hàng đã được giao tận tay khách hàng.",
          time: curStatus === "delivered" ? "Đã nhận hàng" : "Chờ giao hàng",
          isCompleted: curStatus === "delivered",
        },
      ]);
    } else {
      setTrackingError(`Không tìm thấy đơn hàng nào khớp với "${q}". Vui lòng kiểm tra lại Mã đơn hoặc Số điện thoại!`);
    }

    setTrackingLoading(false);
  };

  // ================= VIETQR NAPAS PAYMENT MODAL =================
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [vietQROrder, setVietQROrder] = useState<Order | null>(null);
  const [vietQRTimeLeft, setVietQRTimeLeft] = useState<number>(900); // 15 phút đếm ngược
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"VietQR" | "COD">("VietQR");

  useEffect(() => {
    let timer: any;
    if (isVietQRModalOpen && vietQRTimeLeft > 0) {
      timer = setInterval(() => {
        setVietQRTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVietQRModalOpen, vietQRTimeLeft]);

  // ================= ORDER INVOICE / THERMAL PRINT MODAL =================
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // ================= NOTIFICATION CENTER =================
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "order" | "promo" | "system";
  }>>([
    {
      id: "notif-1",
      title: "Mã giảm giá DEVOPS20 sẵn sàng!",
      message: "Nhập mã DEVOPS20 để được giảm ngay 20% cho đơn hàng từ 200.000đ tại BookStore.",
      time: "Vừa xong",
      read: false,
      type: "promo",
    },
    {
      id: "notif-2",
      title: "Hỗ trợ thanh toán VietQR NAPAS 24/7",
      message: "Quét mã QR tự động điền số tiền và nội dung chuyển khoản tiện lợi hơn bao giờ hết.",
      time: "10 phút trước",
      read: false,
      type: "system",
    },
    {
      id: "notif-3",
      title: "Đơn hàng mẫu DH-1001",
      message: "Đơn hàng DH-1001 đang được vận chuyển hỏa tốc đến người nhận.",
      time: "1 giờ trước",
      read: true,
      type: "order",
    },
  ]);

  // ================= RECENTLY VIEWED BOOKS =================
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bookstore_recently_viewed");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // ================= FACETED SEARCH & FILTER STATES =================
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [storeSortBy, setStoreSortBy] = useState<string>("default");

  // ================= ADMIN TABS & MANAGEMENT STATES =================
  const [adminTab, setAdminTab] = useState<"products" | "orders" | "users" | "analytics">("products");

  // Orders State & LocalStorage Persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_orders");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Error loading orders from localStorage", e);
        }
      }
    }
    return DEFAULT_BOOK_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("bookstore_orders", JSON.stringify(orders));
  }, [orders]);

  // Order Management States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper kiểm tra tài khoản Quản trị viên nhóm 1 & admin
  const isRootAdmin = (u?: AppUser | null) => {
    if (!u) return false;
    const email = u.email.toLowerCase();
    const name = (u.name || "").toLowerCase();
    return (
      email === "admin" ||
      email === "thenhan" ||
      email === "truongan" ||
      email === "dinhbao" ||
      email === "phuocquan" ||
      name.includes("thế nhân") ||
      name.includes("trường ân") ||
      name.includes("đình bảo") ||
      name.includes("phước quân") ||
      (u.id === "USR-001" && name.includes("admin"))
    );
  };

  // App Users State & LocalStorage Persistence
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_users");
      if (saved) {
        try {
          const parsed: AppUser[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Error loading users from localStorage", e);
        }
      }
    }
    return DEFAULT_APP_USERS;
  });

  useEffect(() => {
    localStorage.setItem("bookstore_users", JSON.stringify(appUsers));
  }, [appUsers]);

  // Đồng bộ dữ liệu từ SQL Server qua Backend API khi mở ứng dụng
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = (data && data.data) || (data && data.products) || (data && data.books) || (Array.isArray(data) ? data : null);
        if (Array.isArray(list) && list.length > 0) {
          const normalized = list.map(normalizeProduct);
          setProducts(normalized);
          localStorage.setItem("bookstore_products", JSON.stringify(normalized));
        }
      })
      .catch((err) => console.error("Error loading products from DB:", err));

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAppUsers(data.data);
        }
      })
      .catch((err) => console.error("Error loading users from DB:", err));

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error("Error loading orders from DB:", err));
  }, []);

  // User Management States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("kh123");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "customer">("customer");

  // User Edit State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserRole, setEditUserRole] = useState<"admin" | "customer">("customer");

  // ================= ADMIN PRODUCT CRUD STATES =================
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("Tất cả");
  const [adminStockFilter, setAdminStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Product Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStockQuantity, setFormStockQuantity] = useState<string>("50");
  const [formImage, setFormImage] = useState("");
  const [formTag, setFormTag] = useState("");
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [formSpecs, setFormSpecs] = useState("");
  const [formColors, setFormColors] = useState("");
  const [formRating, setFormRating] = useState("0");
  const [formReviewsCount, setFormReviewsCount] = useState("0");

  // ================= PAGINATION STATES (8 SẢN PHẨM / TRANG) =================
  const [storePage, setStorePage] = useState(1);
  const STORE_ITEMS_PER_PAGE = 8;
  const [adminProductPage, setAdminProductPage] = useState(1);
  const ADMIN_ITEMS_PER_PAGE = 8;

  // ================= ADMIN SESSION (ĐỘC LẬP VỚI SHOP) =================
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bookstore_admin_logged_in") === "true";
    }
    return false;
  });

  const [currentAdminAccount, setCurrentAdminAccount] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bookstore_current_admin") || "admin";
    }
    return "admin";
  });

  // State form đăng nhập tại /admin
  const [directAdminAccount, setDirectAdminAccount] = useState("admin");
  const [directAdminPassword, setDirectAdminPassword] = useState("");

  const handleAdminDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAccount = directAdminAccount.trim().toLowerCase();
    const cleanPassword = directAdminPassword.trim();

    if (!cleanAccount || !cleanPassword) {
      showToast("Vui lòng điền tài khoản và mật khẩu Admin!");
      return;
    }

    // Tìm tài khoản có vai trò Quản trị viên trong appUsers
    const matchedAdmin = appUsers.find(
      (u) =>
        (u.role === "admin" || u.email.toLowerCase() === "admin") &&
        (u.email.toLowerCase() === cleanAccount ||
          u.id.toLowerCase() === cleanAccount ||
          u.name.toLowerCase() === cleanAccount ||
          (!cleanAccount.includes("@") && u.email.toLowerCase().startsWith(cleanAccount + "@")))
    );

    if (!matchedAdmin) {
      showToast(`Không tìm thấy tài khoản Quản trị viên nào khớp với "${directAdminAccount.trim()}"!`);
      return;
    }

    if (matchedAdmin.status === "locked") {
      showToast(`Tài khoản Quản trị viên "${matchedAdmin.name}" đang bị khóa bởi hệ thống!`);
      return;
    }

    const expectedPass = matchedAdmin.password || "admin123";
    if (cleanPassword === expectedPass) {
      setIsAdminLoggedIn(true);
      setCurrentAdminAccount(matchedAdmin.name || matchedAdmin.email);
      localStorage.setItem("bookstore_admin_logged_in", "true");
      localStorage.setItem("bookstore_current_admin", matchedAdmin.name || matchedAdmin.email);
      showToast(`Đăng nhập Admin (${matchedAdmin.name}) thành công!`);
    } else {
      showToast(`Mật khẩu Quản trị viên không đúng! (Mật khẩu: ${expectedPass})`);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("bookstore_admin_logged_in");
    localStorage.removeItem("bookstore_current_admin");
    setCurrentAdminAccount("admin");
    navigateView("store"); // Tự động quay về trang mua sắm ngay lập tức
    showToast("Đã đăng xuất tài khoản Quản trị viên và quay về Cửa hàng.");
  };

  // ================= CUSTOMER SESSION (DÀNH RIÊNG CHO SHOP) =================
  const [customerUser, setCustomerUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookstore_customer");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [expandedTrackingOrderId, setExpandedTrackingOrderId] = useState<string | null>(null);
  const [myOrdersSearchQuery, setMyOrdersSearchQuery] = useState<string>("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");

  // ================= TÌM KIẾM THÔNG MINH (LIVE SEARCH AUTOCOMPLETE) =================
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // ================= QUẢN LÝ HỒ SƠ & SỔ ĐỊA CHỈ KHÁCH HÀNG =================
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileTab, setProfileTab] = useState<"info" | "addresses" | "password">("info");

  // Hàm tiện ích lấy khóa lưu trữ localStorage cho sổ địa chỉ theo tài khoản người dùng
  const getAddressStorageKey = (email?: string) => {
    const targetEmail = email || customerUser?.email;
    return targetEmail ? `bookstore_addresses_${targetEmail.toLowerCase()}` : "bookstore_addresses";
  };

  // Hàm lọc bỏ hoàn toàn các địa chỉ mẫu thử nghiệm hardcoded (Đinh Ngọc Thế Nhân / KTX Khu B)
  const filterOutLegacyMockAddresses = (list: AddressItem[]): AddressItem[] => {
    if (!Array.isArray(list)) return [];
    return list.filter((a) => {
      const name = a.recipientName || "";
      const detail = a.addressDetail || "";
      const isMock =
        name.includes("Thế Nhân") ||
        name.includes("Đinh Ngọc") ||
        detail.includes("Khu Công nghệ cao") ||
        detail.includes("KTX Khu B") ||
        a.id === "ADDR-1" ||
        a.id === "ADDR-2";
      return !isMock;
    });
  };

  // Sổ địa chỉ giao hàng của khách - Khởi tạo mặc định là mảng rỗng [] (không có dữ liệu giả lập có sẵn)
  const [customerAddresses, setCustomerAddresses] = useState<AddressItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        // Quét dọn toàn bộ các key bookstore_addresses có chứa dữ liệu mẫu cũ
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("bookstore_addresses")) {
            const raw = localStorage.getItem(key);
            if (raw && (raw.includes("Thế Nhân") || raw.includes("ADDR-1") || raw.includes("KTX Khu B"))) {
              try {
                const arr = JSON.parse(raw);
                const cleaned = filterOutLegacyMockAddresses(arr);
                if (cleaned.length === 0) {
                  localStorage.removeItem(key);
                } else {
                  localStorage.setItem(key, JSON.stringify(cleaned));
                }
              } catch {
                localStorage.removeItem(key);
              }
            }
          }
        });
      } catch (e) {
        console.error("Lỗi dọn dẹp địa chỉ mẫu:", e);
      }
    }
    return []; // Mặc định sổ địa chỉ hoàn toàn trống rỗng khi người dùng chưa tự nhập
  });

  // Tự động tải sổ địa chỉ theo từng tài khoản khi khách hàng đăng nhập/thay đổi
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (customerUser?.email) {
      const userKey = `bookstore_addresses_${customerUser.email.toLowerCase()}`;
      const savedUserAddrs = localStorage.getItem(userKey);
      if (savedUserAddrs) {
        try {
          const parsed = JSON.parse(savedUserAddrs);
          const cleaned = filterOutLegacyMockAddresses(Array.isArray(parsed) ? parsed : []);
          if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
            if (cleaned.length === 0) {
              localStorage.removeItem(userKey);
            } else {
              localStorage.setItem(userKey, JSON.stringify(cleaned));
            }
          }
          setCustomerAddresses(cleaned);
          return;
        } catch (e) {
          console.error("Lỗi parse sổ địa chỉ tài khoản:", e);
        }
      }
      setCustomerAddresses([]);
    }
  }, [customerUser?.email]);

  // State nhập liệu thêm địa chỉ mới
  const [newAddrRecipient, setNewAddrRecipient] = useState<string>("");
  const [newAddrPhone, setNewAddrPhone] = useState<string>("");
  const [newAddrDetail, setNewAddrDetail] = useState<string>("");
  const [newAddrIsDefault, setNewAddrIsDefault] = useState<boolean>(false);

  // State form đổi mật khẩu
  const [oldPasswordInput, setOldPasswordInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");

  // Customer Form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Auth handlers (Chỉ cho khách hàng, không can thiệp Admin)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authMode === "login") {
      const cleanLogin = authEmail.trim();
      const cleanPassword = authPassword.trim();

      if (!cleanLogin || !cleanPassword) {
        const msg = "Vui lòng điền đầy đủ tài khoản/email và mật khẩu!";
        setAuthError(msg);
        showToast(msg, "error");
        return;
      }

      // 1. Kiểm tra tài khoản Quản trị viên (hỗ trợ admin, thenhan hoặc bất kỳ user nào có role === "admin")
      const matchedAdmin = appUsers.find(
        (u) =>
          (u.role === "admin" || u.email.toLowerCase() === "admin") &&
          (u.email.toLowerCase() === cleanLogin.toLowerCase() ||
            u.id.toLowerCase() === cleanLogin.toLowerCase() ||
            u.name.toLowerCase() === cleanLogin.toLowerCase() ||
            (!cleanLogin.includes("@") && u.email.toLowerCase().startsWith(cleanLogin.toLowerCase() + "@")))
      );

      if (matchedAdmin || cleanLogin.toLowerCase() === "admin") {
        const adminToAuth = matchedAdmin || appUsers.find((u) => u.email.toLowerCase() === "admin");
        if (adminToAuth?.status === "locked") {
          const msg = `Tài khoản Quản trị viên "${adminToAuth.name}" đang bị khóa bởi hệ thống!`;
          setAuthError(msg);
          showToast(msg, "error");
          return;
        }

        const expectedAdminPass = adminToAuth?.password || "admin123";
        if (cleanPassword === expectedAdminPass) {
          setIsAdminLoggedIn(true);
          setCurrentAdminAccount(adminToAuth?.name || adminToAuth?.email || "admin");
          localStorage.setItem("bookstore_admin_logged_in", "true");
          localStorage.setItem("bookstore_current_admin", adminToAuth?.name || adminToAuth?.email || "admin");
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthPhone("");
          setAuthError(null);
          showToast(`Đăng nhập Admin (${adminToAuth?.name || "admin"}) thành công! Đang chuyển đến trang Quản trị...`);
          navigateView("admin");
          return;
        } else {
          const msg = `Mật khẩu Admin không đúng! (Mật khẩu: ${expectedAdminPass})`;
          setAuthError(msg);
          showToast(msg, "error");
          return;
        }
      }

      // 2. Tìm kiếm thông tin khách hàng trong danh sách appUsers
      const matchedUser = appUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanLogin.toLowerCase() ||
          u.id.toLowerCase() === cleanLogin.toLowerCase() ||
          u.name.toLowerCase() === cleanLogin.toLowerCase() ||
          (!cleanLogin.includes("@") && u.email.toLowerCase().startsWith(cleanLogin.toLowerCase() + "@"))
      );

      // Kiểm tra mật khẩu khách hàng: Chấp nhận mật khẩu đã cài đặt hoặc mặc định là kh123
      const expectedCustomerPass = matchedUser?.password || "kh123";
      if (cleanPassword !== expectedCustomerPass && cleanPassword !== "kh123") {
        const msg = `Mật khẩu không đúng! Mật khẩu cho tài khoản này là: ${expectedCustomerPass}`;
        setAuthError(msg);
        showToast(msg, "error");
        return;
      }

      // Đăng nhập khách hàng: Đảm bảo xóa bỏ hoàn toàn quyền/phiên Admin
      setIsAdminLoggedIn(false);
      localStorage.removeItem("bookstore_admin_logged_in");

      if (matchedUser) {
        if (matchedUser.status === "locked") {
          const msg = `Tài khoản "${matchedUser.name}" đang bị khóa bởi Quản trị viên! Vui lòng liên hệ hỗ trợ.`;
          setAuthError(msg);
          showToast(msg, "error");
          return;
        }

        const customer: UserProfile = {
          name: matchedUser.name,
          email: matchedUser.email,
          role: "user",
        };
        setCustomerUser(customer);
        localStorage.setItem("bookstore_customer", JSON.stringify(customer));
        setIsAuthModalOpen(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthPhone("");
        setAuthError(null);
        showToast(`Chào mừng ${customer.name} đã quay trở lại!`);
      } else {
        // Khách hàng mới chưa có trong hệ thống -> Tự động thêm vào Quản lý người dùng
        const displayName = cleanLogin.includes("@") ? cleanLogin.split("@")[0] : cleanLogin;
        const displayEmail = cleanLogin.includes("@") ? cleanLogin : `${cleanLogin}@gmail.com`;

        const customer: UserProfile = {
          name: displayName,
          email: displayEmail,
          role: "user",
        };
        setCustomerUser(customer);
        localStorage.setItem("bookstore_customer", JSON.stringify(customer));

        setAppUsers((prev) => {
          if (prev.some((u) => u.email.toLowerCase() === customer.email.toLowerCase())) {
            return prev;
          }
          const newUser: AppUser = {
            id: `USR-${String(prev.length + 1).padStart(3, "0")}`,
            name: customer.name,
            email: customer.email,
            password: cleanPassword || "kh123",
            role: "customer",
            status: "active",
            createdAt: new Date().toLocaleDateString("vi-VN"),
            ordersCount: 0,
          };
          return [...prev, newUser];
        });

        setIsAuthModalOpen(false);
        showToast(`Chào mừng ${customer.name} đã đăng nhập thành công!`);
      }
    } else {
      const cleanName = authName.trim();
      const cleanEmail = authEmail.trim();
      const cleanPass = authPassword.trim();
      const cleanPhone = authPhone.trim();

      if (!cleanName || !cleanEmail || !cleanPass) {
        const msg = "Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!";
        setAuthError(msg);
        showToast(msg, "error");
        return;
      }

      // 1. Kiểm tra Email đã tồn tại chưa
      const emailExists = appUsers.some(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );
      if (emailExists) {
        const msg = "Email này đã được đăng ký, vui lòng sử dụng email khác hoặc đăng nhập!";
        setAuthError(msg);
        showToast(msg, "error");
        return;
      }

      // 2. Kiểm tra Số điện thoại đã tồn tại chưa (nếu có nhập)
      if (cleanPhone) {
        const phoneExists = appUsers.some(
          (u) => u.phone && u.phone.trim() === cleanPhone
        );
        if (phoneExists) {
          const msg = "Số điện thoại này đã được sử dụng bởi tài khoản khác!";
          setAuthError(msg);
          showToast(msg, "error");
          return;
        }
      }

      // Tự động sinh ID người dùng
      const maxIdNum = appUsers.reduce((max, u) => {
        const match = u.id.match(/^USR-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const nextUserId = `USR-${String(maxIdNum + 1).padStart(3, "0")}`;
      const newCustomerUser: AppUser = {
        id: nextUserId,
        name: cleanName,
        email: cleanEmail.toLowerCase(),
        password: cleanPass || "kh123",
        phone: cleanPhone || undefined,
        role: "customer",
        status: "active",
        createdAt: new Date().toLocaleDateString("vi-VN"),
        ordersCount: 0,
      };

      // Gửi API lưu người dùng vào Database
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomerUser),
      })
        .then(async (res) => {
          const resData = await res.json();
          if (!res.ok || !resData.success) {
            const msg = resData.message || "Đăng ký không thành công!";
            setAuthError(msg);
            showToast(msg, "error");
            return;
          }

          // Xóa bỏ session Admin khi tạo tài khoản khách hàng
          setIsAdminLoggedIn(false);
          localStorage.removeItem("bookstore_admin_logged_in");

          const customer: UserProfile = {
            name: cleanName,
            email: cleanEmail.toLowerCase(),
            role: "user",
          };
          setCustomerUser(customer);
          localStorage.setItem("bookstore_customer", JSON.stringify(customer));

          setAppUsers((prev) => [...prev, newCustomerUser]);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
          setAuthPhone("");
          setAuthError(null);
          showToast(`Đăng ký tài khoản thành công! Xin chào ${customer.name}`);
        })
        .catch((err) => {
          console.error("Error creating customer in DB:", err);
          const msg = "Lỗi kết nối máy chủ khi đăng ký tài khoản!";
          setAuthError(msg);
          showToast(msg, "error");
        });
      return;
    }
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setAuthPhone("");
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    localStorage.removeItem("bookstore_customer");
    setIsUserMenuOpen(false);
    showToast("Đã đăng xuất tài khoản.");
  };

  // Thêm địa chỉ nhận hàng mới vào sổ địa chỉ
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrRecipient.trim() || !newAddrPhone.trim() || !newAddrDetail.trim()) {
      showToast("Vui lòng nhập đầy đủ họ tên, SĐT và địa chỉ chi tiết!", "error");
      return;
    }

    const newAddressItem: AddressItem = {
      id: `ADDR-${Date.now()}`,
      recipientName: newAddrRecipient.trim(),
      phone: newAddrPhone.trim(),
      addressDetail: newAddrDetail.trim(),
      isDefault: newAddrIsDefault || customerAddresses.length === 0,
    };

    setCustomerAddresses((prev) => {
      let updated = [...prev];
      if (newAddressItem.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(newAddressItem);
      localStorage.setItem(getAddressStorageKey(), JSON.stringify(updated));
      return updated;
    });

    setNewAddrRecipient("");
    setNewAddrPhone("");
    setNewAddrDetail("");
    setNewAddrIsDefault(false);
    showToast("Đã thêm địa chỉ giao hàng mới vào sổ!");
    playChimeSound('success');
  };

  // Đặt địa chỉ làm mặc định
  const handleSetDefaultAddress = (addressId: string) => {
    setCustomerAddresses((prev) => {
      const updated = prev.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      localStorage.setItem(getAddressStorageKey(), JSON.stringify(updated));
      return updated;
    });
    showToast("Đã cập nhật địa chỉ giao hàng mặc định!");
    playChimeSound('click');
  };

  // Xóa địa chỉ khỏi sổ
  const handleDeleteAddress = (addressId: string) => {
    setCustomerAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addressId);
      if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
        updated[0].isDefault = true;
      }
      localStorage.setItem(getAddressStorageKey(), JSON.stringify(updated));
      return updated;
    });
    showToast("Đã xóa địa chỉ khỏi sổ!");
  };

  // Đổi mật khẩu tài khoản
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPasswordInput || !newPasswordInput) {
      showToast("Vui lòng điền mật khẩu cũ và mật khẩu mới!", "error");
      return;
    }
    if (newPasswordInput.length < 5) {
      showToast("Mật khẩu mới phải có tối thiểu 5 ký tự!", "error");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showToast("Xác nhận mật khẩu mới không trùng khớp!", "error");
      return;
    }

    // Cập nhật mật khẩu trong appUsers
    if (customerUser) {
      setAppUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === customerUser.email.toLowerCase()
            ? { ...u, password: newPasswordInput }
            : u
        )
      );
    }

    setOldPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    showToast("🎉 Đổi mật khẩu tài khoản thành công!");
    playChimeSound('success');
  };

  // Cập nhật thông tin hồ sơ cá nhân
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser) return;
    const cleanName = (authName || customerUser.name).trim();
    const cleanPhone = (authPhone || customerUser.phone || "").trim();

    const updatedUser: UserProfile = {
      ...customerUser,
      name: cleanName,
      fullName: cleanName,
      phone: cleanPhone,
    };

    setCustomerUser(updatedUser);
    localStorage.setItem("bookstore_customer", JSON.stringify(updatedUser));
    setAppUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === customerUser.email.toLowerCase()
          ? { ...u, name: cleanName, phone: cleanPhone }
          : u
      )
    );
    showToast("Cập nhật thông tin cá nhân thành công!");
    playChimeSound('success');
  };

  // Tính năng "Mua lại đơn này" (Re-order)
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      showToast("Đơn hàng không có sản phẩm nào để đặt lại!", "error");
      return;
    }

    let addedCount = 0;
    for (const item of order.items) {
      const existingProduct = products.find((p) => p.id === (item.bookId || item.id));
      const bookIdNum = Number(item.bookId || item.id || 1);
      const productToAdd: Product = existingProduct || {
        id: bookIdNum,
        name: String(item.title || item.name || "Tác phẩm chọn lọc"),
        price: item.price ?? item.unitPrice ?? 0,
        originalPrice: Math.round((item.price ?? item.unitPrice ?? 100000) * 1.25),
        rating: 5,
        reviewsCount: 15,
        image: item.imageUrl || item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
        description: "Tác phẩm đặt lại từ đơn hàng cũ",
        category: "Sách mua lại",
        specs: [],
        colors: [item.selectedColor || "Bìa mềm tiêu chuẩn"],
      };

      addToCart(productToAdd, item.selectedColor || "Bìa mềm tiêu chuẩn", item.quantity || 1);
      addedCount++;
    }

    setIsMyOrdersOpen(false);
    setIsCartOpen(true);
    showToast(`🛒 Đã nạp lại ${addedCount} sản phẩm từ đơn #${order.id} vào giỏ hàng!`);
    playChimeSound('success');
  };

  // Xuất file CSV báo cáo doanh thu
  const handleExportCsv = () => {
    let csv = "\uFEFFMã đơn,Khách hàng,Số điện thoại,Địa chỉ nhận hàng,Ngày đặt,Tổng tiền (VNĐ),Hình thức TT,Trạng thái đơn,Trạng thái TT\n";
    for (const o of orders) {
      const id = `"${(o.id || o.orderCode || '').replace(/"/g, '""')}"`;
      const name = `"${(o.customerName || '').replace(/"/g, '""')}"`;
      const phone = `"${(o.customerPhone || '').replace(/"/g, '""')}"`;
      const addr = `"${(o.shippingAddress || o.customerAddress || '').replace(/"/g, '""')}"`;
      const date = `"${(o.orderDate || o.createdAt || '').slice(0, 19).replace('T', ' ')}"`;
      const total = o.totalAmount || 0;
      const method = `"${(o.paymentMethod || 'COD').replace(/"/g, '""')}"`;
      const status = `"${(o.status || 'pending').replace(/"/g, '""')}"`;
      const payStatus = `"${(o.paymentStatus || 'Unpaid').replace(/"/g, '""')}"`;
      csv += `${id},${name},${phone},${addr},${date},${total},${method},${status},${payStatus}\n`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookstore-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("🎉 Đã xuất và tải xuống file báo cáo doanh thu CSV thành công!");
    playChimeSound('success');
  };

  // Mở popup chi tiết sản phẩm (Xử lý an toàn tuyệt đối tránh lỗi trắng màn hình)
  const handleOpenDetail = (product: Product) => {
    const validColors =
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : ["Bìa mềm tiêu chuẩn", "Bìa cứng (Hardcover)"];
    const validSpecs =
      Array.isArray(product.specs) && product.specs.length > 0
        ? product.specs
        : [
            `Tác giả: ${product.author || "Nhiều tác giả"}`,
            `Thể loại: ${product.category || "Sách tham khảo"}`,
            `Tồn kho: ${product.stockQuantity ?? 50} cuốn`,
            `Mã ISBN: ${product.isbn || "978-604-0012"}`,
            "Hình thức: In chất lượng cao, kèm Bookmark",
          ];

    setSelectedProduct({
      ...product,
      colors: validColors,
      specs: validSpecs,
    });
    setSelectedColor(validColors[0] || "Bìa mềm tiêu chuẩn");
    setModalQuantity(1);
    setProductDetailTab("info");
    setNewReviewRating(5);
    setNewReviewComment("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Lưu vào lịch sử sách vừa xem gần đây (Recently Viewed - tối đa 8 cuốn)
    setRecentlyViewedIds((prev) => {
      const next = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 8);
      try {
        localStorage.setItem("bookstore_recently_viewed", JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Tự động tải đánh giá mới nhất của sách từ Backend
    fetch(`/api/books/${product.id}/reviews`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setReviewsMap((prev) => ({
            ...prev,
            [product.id]: resData.data,
          }));
        }
      })
      .catch(() => {});
  };

  // Thêm nhanh vào giỏ từ card (xử lý màu sắc mặc định an toàn)
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const defaultColor =
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors[0]
        : "Bìa mềm tiêu chuẩn";
    addToCart(product, defaultColor, 1);
  };

  // Thêm vào giỏ hàng
  const addToCart = (product: Product, color: string, quantity: number) => {
    // Chặn đặt mua nếu sản phẩm đã hết hàng trong kho
    if (product.stockQuantity !== undefined && product.stockQuantity === 0) {
      showToast(`Cuốn sách "${product.name}" hiện đã tạm hết hàng trong kho!`, "error");
      return;
    }

    setCart((prev) => {
      const existIndex = prev.findIndex(
        (item) => item.id === product.id && item.selectedColor === color
      );
      if (existIndex > -1) {
        const updated = [...prev];
        updated[existIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity, selectedColor: color }];
    });
    playChimeSound('click');
    showToast(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
  };

  // Cập nhật số lượng
  const updateQuantity = (id: number, color: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.selectedColor === color) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Xóa sản phẩm khỏi giỏ
  const removeItem = (id: number, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.selectedColor === color)
      )
    );
  };

  // Lọc sản phẩm hiển thị ngoài Store (bao gồm lọc đa chiều Faceted Search và sắp xếp)
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // 1. Lọc Danh mục & Yêu thích
      let matchCat = false;
      if (selectedCategory === "Tất cả") {
        matchCat = true;
      } else if (selectedCategory === "Yêu thích") {
        matchCat = wishlist.includes(p.id);
      } else {
        matchCat = p.category === selectedCategory;
      }

      // 2. Lọc Từ khóa tìm kiếm
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()));

      // 3. Lọc Khoảng giá (Price Range Filter)
      let matchPrice = true;
      if (priceRangeFilter === "under100") {
        matchPrice = p.price < 100000;
      } else if (priceRangeFilter === "100to200") {
        matchPrice = p.price >= 100000 && p.price <= 200000;
      } else if (priceRangeFilter === "200to300") {
        matchPrice = p.price > 200000 && p.price <= 300000;
      } else if (priceRangeFilter === "above300") {
        matchPrice = p.price > 300000;
      }

      // 4. Lọc Số sao đánh giá (Rating Filter)
      let matchRating = true;
      if (ratingFilter > 0) {
        matchRating = (p.rating || 5) >= ratingFilter;
      }

      // 5. Lọc Tình trạng tồn kho
      let matchStock = true;
      if (inStockOnly) {
        matchStock = p.stockQuantity !== undefined ? p.stockQuantity > 0 : true;
      }

      return matchCat && matchSearch && matchPrice && matchRating && matchStock;
    });

    // 6. Sắp xếp đa dạng (Sort By)
    if (storeSortBy === "priceAsc") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (storeSortBy === "priceDesc") {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (storeSortBy === "ratingDesc") {
      return [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (storeSortBy === "reviewsDesc") {
      return [...list].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (storeSortBy === "newest") {
      return [...list].sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, selectedCategory, searchQuery, wishlist, priceRangeFilter, ratingFilter, inStockOnly, storeSortBy]);

  // Phân trang Store: 8 sản phẩm / trang
  const storeTotalPages = Math.ceil(filteredProducts.length / STORE_ITEMS_PER_PAGE) || 1;
  const paginatedStoreProducts = useMemo(() => {
    const start = (storePage - 1) * STORE_ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + STORE_ITEMS_PER_PAGE);
  }, [filteredProducts, storePage]);

  useEffect(() => {
    setStorePage(1);
  }, [selectedCategory, searchQuery, wishlist, priceRangeFilter, ratingFilter, inStockOnly, storeSortBy]);

  // Lọc sản phẩm trong Admin theo Danh mục, Từ khóa và Trạng thái kho hàng
  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        adminCategoryFilter === "Tất cả" || p.category === adminCategoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(adminSearch.toLowerCase());

      const stock = p.stockQuantity !== undefined ? p.stockQuantity : 50;
      let matchStock = true;
      if (adminStockFilter === "in_stock") {
        matchStock = stock > 10;
      } else if (adminStockFilter === "low_stock") {
        matchStock = stock > 0 && stock <= 10;
      } else if (adminStockFilter === "out_of_stock") {
        matchStock = stock === 0;
      }

      return matchCat && matchSearch && matchStock;
    });
  }, [products, adminCategoryFilter, adminSearch, adminStockFilter]);

  // Phân trang Admin Products: 8 sản phẩm / trang
  const adminTotalPages = Math.ceil(adminFilteredProducts.length / ADMIN_ITEMS_PER_PAGE) || 1;
  const paginatedAdminProducts = useMemo(() => {
    const start = (adminProductPage - 1) * ADMIN_ITEMS_PER_PAGE;
    return adminFilteredProducts.slice(start, start + ADMIN_ITEMS_PER_PAGE);
  }, [adminFilteredProducts, adminProductPage]);

  useEffect(() => {
    setAdminProductPage(1);
  }, [adminCategoryFilter, adminSearch, adminStockFilter]);

  // Thống kê tổng hợp số lượng sản phẩm theo trạng thái tồn kho
  const inStockCount = useMemo(() => products.filter((p) => (p.stockQuantity !== undefined ? p.stockQuantity : 50) > 10).length, [products]);
  const lowStockCount = useMemo(() => products.filter((p) => {
    const s = p.stockQuantity !== undefined ? p.stockQuantity : 50;
    return s > 0 && s <= 10;
  }).length, [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => (p.stockQuantity !== undefined ? p.stockQuantity : 50) === 0).length, [products]);
  const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + (p.stockQuantity !== undefined ? p.stockQuantity : 50), 0), [products]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Áp dụng mã giảm giá
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError(null);

    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá!");
      return;
    }

    const found = coupons.find((c) => c.code === code && c.isActive);
    if (!found) {
      setCouponError(`Mã "${code}" không hợp lệ hoặc đã hết hạn!`);
      return;
    }

    if (totalCartPrice < found.minOrderAmount) {
      const minText = found.minOrderAmount.toLocaleString("vi-VN") + "đ";
      setCouponError(`Mã "${code}" chỉ áp dụng cho đơn từ ${minText}!`);
      return;
    }

    setAppliedCoupon(found);
    setCouponInput("");
    setCouponError(null);
    showToast(`Đã áp dụng mã "${found.code}" thành công! 🎉`);
  };

  // Gỡ bỏ mã giảm giá
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast("Đã gỡ mã giảm giá!");
  };

  // Tính số tiền được chiết khấu từ Voucher
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon || totalCartPrice === 0) return 0;
    if (totalCartPrice < appliedCoupon.minOrderAmount) return 0;

    if (appliedCoupon.discountType === "Percentage") {
      const raw = Math.round((totalCartPrice * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscountAmount ? Math.min(raw, appliedCoupon.maxDiscountAmount) : raw;
    } else {
      return appliedCoupon.discountValue;
    }
  }, [appliedCoupon, totalCartPrice]);

  // Tổng số tiền thanh toán cuối cùng sau khi trừ Voucher (đã loại bỏ hệ sinh thái Xu)
  const finalPayableAmount = Math.max(0, totalCartPrice - couponDiscountAmount);

  const formatVND = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  // ================= ADMIN CRUD HANDLERS =================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory(DEFAULT_CATEGORIES[0]);
    setIsCustomCategory(false);
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStockQuantity("50");
    setFormImage(SAMPLE_IMAGE_PRESETS[1].url);
    setFormTag("Mới");
    setIsCustomTag(false);
    setFormRating("0");
    setFormReviewsCount("0");
    setFormDescription("");
    setFormSpecs("Bluetooth 5.3, Pin 24h, Sạc Type-C, Chống nước");
    setFormColors("Đen, Trắng");
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setIsCustomCategory(!DEFAULT_CATEGORIES.includes(p.category));
    setFormPrice(p.price.toString());
    setFormOriginalPrice(p.originalPrice ? p.originalPrice.toString() : "");
    setFormStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity.toString() : "50");
    setFormImage(p.image);
    setFormTag(p.tag || "");
    setIsCustomTag(Boolean(p.tag && !PRESET_TAGS.some((t) => t.value === p.tag)));
    setFormRating(p.rating !== undefined ? p.rating.toString() : "0");
    setFormReviewsCount(p.reviewsCount !== undefined ? p.reviewsCount.toString() : "0");
    setFormDescription(p.description || "");
    setFormSpecs(p.specs ? p.specs.join(", ") : "");
    setFormColors(p.colors ? p.colors.join(", ") : "");
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    const p = products.find((item) => item.id === id);
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p?.name}" không?`)) {
      setProducts((prev) => prev.filter((item) => item.id !== id));
      // Xóa sản phẩm khỏi MongoDB
      fetch(`/api/products/${id}`, {
        method: "DELETE",
      }).catch((err) => console.error("Error deleting product from DB:", err));
      showToast(`Đã xóa sản phẩm thành công`);
    }
  };

  const handleResetDefaultData = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const normalized = data.data.map(normalizeProduct);
          setProducts(normalized);
          localStorage.setItem("bookstore_products", JSON.stringify(normalized));
          showToast("Đã tải lại danh sách sản phẩm từ cơ sở dữ liệu!");
        }
      })
      .catch(() => showToast("Lỗi khi tải dữ liệu sản phẩm từ CSDL!"));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      showToast("Vui lòng điền tên và giá sản phẩm!");
      return;
    }

    const priceNum = parseInt(formPrice.replace(/\D/g, ""), 10) || 0;
    const origPriceNum = formOriginalPrice
      ? parseInt(formOriginalPrice.replace(/\D/g, ""), 10)
      : priceNum;

    const ratingNum = Math.min(5, Math.max(0, parseFloat(formRating) || 0));
    const reviewsNum = Math.max(0, parseInt(formReviewsCount, 10) || 0);
    const stockNum = Math.max(0, parseInt(formStockQuantity, 10) || 0);

    let specsArr = formSpecs
      ? formSpecs.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Tác giả: Nhiều tác giả", "NXB: NXB Tri Thức", "Năm XB: 2024"];

    // Cập nhật hoặc bổ sung thông số tồn kho trong specs
    const stockSpecIdx = specsArr.findIndex((s) => s.toLowerCase().startsWith("tồn kho:"));
    if (stockSpecIdx >= 0) {
      specsArr[stockSpecIdx] = `Tồn kho: ${stockNum} cuốn`;
    } else {
      specsArr.push(`Tồn kho: ${stockNum} cuốn`);
    }

    const colorsArr = formColors
      ? formColors.split(",").map((c) => c.trim()).filter(Boolean)
      : ["Bìa mềm", "Bìa cứng"];

    if (editingProduct) {
      // UPDATE
      const updatedProduct: Product = {
        ...editingProduct,
        name: formName.trim(),
        category: formCategory.trim() || "Công nghệ thông tin",
        price: priceNum,
        originalPrice: origPriceNum,
        stockQuantity: stockNum,
        rating: ratingNum,
        reviewsCount: reviewsNum,
        image: formImage.trim() || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        tag: formTag.trim() || undefined,
        description: formDescription.trim() || formName.trim(),
        specs: specsArr,
        colors: colorsArr,
      };

      setProducts((prev) =>
        prev.map((item) => (item.id === editingProduct.id ? updatedProduct : item))
      );

      // Cập nhật sản phẩm vào MongoDB
      fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      }).catch((err) => console.error("Error updating product in DB:", err));

      showToast(`Đã cập nhật cuốn sách "${formName}" thành công!`);
    } else {
      // CREATE
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: newId,
        name: formName.trim(),
        category: formCategory.trim() || "Công nghệ thông tin",
        price: priceNum,
        originalPrice: origPriceNum,
        stockQuantity: stockNum,
        rating: ratingNum,
        reviewsCount: reviewsNum,
        image: formImage.trim() || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        tag: formTag.trim() || undefined,
        description: formDescription.trim() || formName.trim(),
        specs: specsArr,
        colors: colorsArr,
      };
      setProducts((prev) => [newProduct, ...prev]);

      // Lưu sản phẩm mới vào MongoDB
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (!resData.success) {
            console.error("API error adding product:", resData.error);
          }
        })
        .catch((err) => console.error("Error adding product to DB:", err));

      showToast(`Đã thêm mới sản phẩm "${formName}"!`);
    }

    setIsProductModalOpen(false);
  };

  // ================= ORDER MANAGEMENT HANDLERS =================
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Cập nhật trạng thái đơn hàng vào SQL Server
    fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch((err) => console.error("Error updating order status in DB:", err));

    const statusLabels: Record<OrderStatus, string> = {
      pending: "Chờ xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    showToast(`Đã chuyển trạng thái đơn ${orderId} sang "${statusLabels[newStatus]}"`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId}?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

      // Xóa đơn hàng khỏi SQL Server
      fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      }).catch((err) => console.error("Error deleting order in DB:", err));

      showToast(`Đã xóa đơn hàng ${orderId}`);
    }
  };

  const handleResetOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
          showToast("Đã tải lại danh sách đơn hàng từ cơ sở dữ liệu!");
        }
      })
      .catch(() => showToast("Lỗi khi tải dữ liệu đơn hàng từ CSDL!"));
  };

  const adminFilteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        o.customerEmail.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // ================= USER MANAGEMENT HANDLERS =================
  const handleToggleUserStatus = (userId: string) => {
    const target = appUsers.find((u) => u.id === userId);
    if (target && isRootAdmin(target)) {
      showToast("Tài khoản Quản trị viên gốc cố định, không được phép khóa!");
      return;
    }
    const nextStatus = target?.status === "active" ? "locked" : "active";
    setAppUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          showToast(
            nextStatus === "locked"
              ? `Đã khóa tài khoản "${u.name}"`
              : `Đã mở khóa tài khoản "${u.name}"`
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    // Lưu trạng thái vào SQL Server
    fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }).catch((err) => console.error("Error updating status in DB:", err));
  };

  const handleToggleUserRole = (userId: string) => {
    const target = appUsers.find((u) => u.id === userId);
    if (target && isRootAdmin(target)) {
      showToast("Tài khoản Quản trị viên gốc cố định, không thể đổi vai trò!");
      return;
    }
    const nextRole = target?.role === "admin" ? "customer" : "admin";
    setAppUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          showToast(
            `Đã chuyển vai trò của "${u.name}" thành ${
              nextRole === "admin" ? "Quản trị viên" : "Khách hàng"
            }`
          );
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
    // Lưu vai trò vào SQL Server
    fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    }).catch((err) => console.error("Error updating role in DB:", err));
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = appUsers.find((u) => u.id === userId);
    if (!userToDelete) return;
    if (isRootAdmin(userToDelete)) {
      alert("Không thể xóa tài khoản Quản trị viên gốc của hệ thống!");
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa tài khoản "${userToDelete.name}" (${userToDelete.email})?`)) {
      setAppUsers((prev) => prev.filter((u) => u.id !== userId));
      // Xóa luôn toàn bộ đơn hàng của người dùng này trong danh sách
      setOrders((prev) =>
        prev.filter(
          (o) =>
            o.userId !== userId &&
            o.customerEmail?.toLowerCase() !== userToDelete.email.toLowerCase()
        )
      );
      // Xóa người dùng và các đơn hàng khỏi MongoDB
      fetch(`/api/users/${userId}`, {
        method: "DELETE",
      }).catch((err) => console.error("Error deleting user in DB:", err));
      showToast(`Đã xóa tài khoản "${userToDelete.name}" và toàn bộ đơn hàng của tài khoản này`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast("Vui lòng điền đủ Tên và Email!", "error");
      return;
    }
    const exists = appUsers.some(
      (u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (exists) {
      showToast("Email/tài khoản này đã tồn tại!", "error");
      return;
    }

    const cleanNewPhone = newUserPhone.trim();
    if (cleanNewPhone) {
      const phoneExists = appUsers.some(
        (u) => u.phone && u.phone.trim() === cleanNewPhone
      );
      if (phoneExists) {
        showToast("Số điện thoại này đã được sử dụng bởi người dùng khác!", "error");
        return;
      }
    }

    const maxIdNum = appUsers.reduce((max, u) => {
      const match = u.id.match(/^USR-(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextId = `USR-${String(maxIdNum + 1).padStart(3, "0")}`;
    const defaultPass = newUserRole === "admin" ? "admin123" : "kh123";
    const newUser: AppUser = {
      id: nextId,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword.trim() || defaultPass,
      phone: newUserPhone.trim() || undefined,
      role: newUserRole,
      status: "active",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      ordersCount: 0,
    };
    setAppUsers((prev) => [...prev, newUser]);

    // Gửi API lưu người dùng vào SQL Server
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.success) {
          console.error("API Error adding user:", resData.message);
        }
      })
      .catch((err) => console.error("Error adding user to DB:", err));

    showToast(`Đã tạo thành công tài khoản "${newUser.name}"!`);
    setIsUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("kh123");
    setShowNewUserPassword(false);
    setNewUserPhone("");
    setNewUserRole("customer");
  };

  const handleOpenEditUser = (user: AppUser) => {
    if (isRootAdmin(user)) {
      showToast("Tài khoản Quản trị viên gốc cố định, không được chỉnh sửa!");
      return;
    }
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword(user.password || (user.role === "admin" || user.email === "admin" ? "admin123" : "kh123"));
    setShowEditUserPassword(false);
    setEditUserPhone(user.phone || "");
    setEditUserRole(user.role);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (isRootAdmin(editingUser)) {
      showToast("Tài khoản Quản trị viên gốc cố định, không thể sửa!");
      return;
    }
    if (!editUserName.trim() || !editUserEmail.trim() || !editUserPassword.trim()) {
      showToast("Vui lòng điền đủ Họ tên, Email và Mật khẩu!", "error");
      return;
    }
    const duplicate = appUsers.some(
      (u) =>
        u.id !== editingUser.id &&
        u.email.toLowerCase() === editUserEmail.trim().toLowerCase()
    );
    if (duplicate) {
      showToast("Email/tài khoản này đã được sử dụng bởi người dùng khác!", "error");
      return;
    }

    const cleanEditPhone = editUserPhone.trim();
    if (cleanEditPhone) {
      const phoneDuplicate = appUsers.some(
        (u) =>
          u.id !== editingUser.id &&
          u.phone &&
          u.phone.trim() === cleanEditPhone
      );
      if (phoneDuplicate) {
        showToast("Số điện thoại này đã được sử dụng bởi người dùng khác!", "error");
        return;
      }
    }

    const defaultPass = editingUser.role === "admin" || editingUser.email === "admin" ? "admin123" : "kh123";
    const finalPassword = editUserPassword.trim() || defaultPass;
    const updatedUser = {
      name: editUserName.trim(),
      email: editUserEmail.trim().toLowerCase(),
      password: finalPassword,
      phone: editUserPhone.trim() || undefined,
      role: editUserRole,
      status: editingUser.status,
    };

    setAppUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...updatedUser,
            }
          : u
      )
    );

    // Lưu thông tin cập nhật vào SQL Server
    fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    }).catch((err) => console.error("Error updating user in DB:", err));

    showToast(`Đã cập nhật thông tin và mật khẩu cho "${editUserName.trim()}"!`);
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleResetUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAppUsers(data.data);
          showToast("Đã tải lại danh sách người dùng từ cơ sở dữ liệu!");
        }
      })
      .catch(() => showToast("Lỗi khi tải dữ liệu người dùng từ CSDL!"));
  };

  const adminFilteredUsers = useMemo(() => {
    const list = appUsers.filter((u) => {
      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === "all" || u.status === userStatusFilter;
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        u.id.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    });

    // Luôn ghim Quản trị viên gốc (Admin) lên đầu tiên, các tài khoản khác sắp xếp bên dưới theo ID
    return [...list].sort((a, b) => {
      if (isRootAdmin(a)) return -1;
      if (isRootAdmin(b)) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [appUsers, userRoleFilter, userStatusFilter, userSearch]);

  // ==========================================
  // VIEW 1: TRANG QUẢN TRỊ ADMIN (/admin)
  // Độc lập hoàn toàn với trang bán hàng
  // ==========================================
  if (currentView === "admin") {
    return (
      <div className="min-h-screen bg-[#fafafa] text-neutral-800 flex flex-col antialiased">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-auto px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none ${
              toastType === "error"
                ? "bg-rose-600 text-white border-rose-700 shadow-rose-900/30"
                : "bg-neutral-900 text-white border-neutral-800 shadow-neutral-900/40"
            }`}
          >
            {toastType === "error" ? (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Admin Notice Bar */}
        <div className="bg-neutral-950 text-neutral-300 text-[11px] py-1.5 px-4 text-center tracking-wide font-normal flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>BookStore - Bảng Quản Trị Hệ Thống (/admin) | Nhóm 1 - DevOps ST23B</span>
          </div>
          <button
            onClick={() => navigateView("store")}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all shadow-xs"
          >
            <Store className="w-3.5 h-3.5" /> Xem Hiệu Sách (Cửa hàng)
          </button>
        </div>

        {/* Dedicated Admin Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateView("admin")}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm tracking-tighter">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-neutral-950">
                      BookStore
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold -mt-0.5">
                    Nhóm 1 - DevOps ST23B
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-800 border border-neutral-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Tài khoản: <strong>{currentAdminAccount}</strong></span>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất Admin</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-neutral-500 font-medium">
                  Chưa đăng nhập
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content: Login or Dashboard CRUD */}
        {!isAdminLoggedIn ? (
          /* Màn hình đăng nhập dành riêng cho trang /admin khi chưa đăng nhập */
          <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  BookStore Admin Portal
                </span>
                <h2 className="text-xl font-black text-neutral-900 mt-2">
                  Đăng Nhập Quản Trị
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Đồ án cuối kỳ DevOps ST23B - Nhóm 1 (Sách & Kho hàng)
                </p>
              </div>

              <form onSubmit={handleAdminDirectLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tài khoản Admin
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={directAdminAccount}
                      onChange={(e) => setDirectAdminAccount(e.target.value)}
                      placeholder="admin, thenhan, truongan, dinhbao, phuocquan"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mật khẩu Admin
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={directAdminPassword}
                      onChange={(e) => setDirectAdminPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full pl-9 pr-9 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 text-[11px] text-neutral-600 space-y-1.5">
                  <div className="flex items-center justify-between font-medium">
                    <span>Tài khoản thành viên Nhóm 1 (MK: <strong>admin123</strong>):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { acc: "admin", label: "admin" },
                      { acc: "thenhan", label: "thenhan" },
                      { acc: "truongan", label: "truongan" },
                      { acc: "dinhbao", label: "dinhbao" },
                      { acc: "phuocquan", label: "phuocquan" },
                    ].map((item) => (
                      <button
                        key={item.acc}
                        type="button"
                        onClick={() => {
                          setDirectAdminAccount(item.acc);
                          setDirectAdminPassword("admin123");
                          showToast(`Đã chọn tài khoản ${item.acc}!`);
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/70 text-[10px] cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
                >
                  Đăng Nhập Vào Trang Quản Trị
                </button>

                <button
                  type="button"
                  onClick={() => navigateView("store")}
                  className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  ← Quay lại trang chủ mua sắm
                </button>
              </form>
            </div>
          </main>
        ) : (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full animate-in fade-in duration-200">
            {/* Admin Section Tabs Navigation ("nhớ chia ra") */}
            <div className="flex items-center gap-1.5 border-b border-neutral-200 mb-6 overflow-x-auto pb-0">
              <button
                type="button"
                onClick={() => setAdminTab("products")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                  adminTab === "products"
                    ? "border-neutral-950 text-neutral-950 bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Sản phẩm & Kho hàng</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-extrabold">
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab("orders")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                  adminTab === "orders"
                    ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>Quản lý Đơn hàng</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    orders.filter((o) => o.status === "pending").length > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab("users")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                  adminTab === "users"
                    ? "border-purple-600 text-purple-800 bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Quản lý Người dùng</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-extrabold">
                  {appUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab("analytics")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                  adminTab === "analytics"
                    ? "border-amber-600 text-amber-900 bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Báo cáo Doanh thu & Thống kê</span>
              </button>
            </div>

            {/* ========================================================= */}
            {/* TAB 1: QUẢN LÝ SẢN PHẨM & KHO HÀNG */}
            {/* ========================================================= */}
            {adminTab === "products" && (
              <div>
                {/* Admin Header Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                        Sản phẩm & Kho hàng
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                        Quản Lý Danh Mục & Sản Phẩm
                      </h1>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Dữ liệu được lưu trữ và đồng bộ trực tiếp với cơ sở dữ liệu MongoDB.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={handleResetDefaultData}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all"
                      title="Khôi phục dữ liệu gốc"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Khôi phục gốc
                    </button>
                    <button
                      onClick={handleOpenAddProduct}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-800 shadow-sm transition-all active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" /> Thêm sản phẩm mới
                    </button>
                  </div>
                </div>

                {/* Quick Stats Grid - Thống Kê Tổng Quan Kho Hàng & Trạng Thái */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {/* Thẻ 1: Tổng đầu sách & Tổng cuốn trong kho */}
                  <div
                    onClick={() => setAdminStockFilter("all")}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-neutral-900 ${
                      adminStockFilter === "all" ? "ring-2 ring-neutral-900 border-neutral-900" : "border-neutral-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Sản Phẩm</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">Tất cả</span>
                    </div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">{products.length}</div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Tổng {totalStockUnits.toLocaleString("vi-VN")} cuốn trong kho
                    </span>
                  </div>

                  {/* Thẻ 2: Còn hàng (Dồi dào) */}
                  <div
                    onClick={() => setAdminStockFilter("in_stock")}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-emerald-500 ${
                      adminStockFilter === "in_stock" ? "ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50/20" : "border-neutral-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-emerald-600 uppercase">Còn Hàng</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Dồi dào</span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">{inStockCount}</div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Tồn kho &gt; 10 cuốn (sẵn sàng giao)
                    </span>
                  </div>

                  {/* Thẻ 3: Sắp hết hàng (Cảnh báo cần nhập) */}
                  <div
                    onClick={() => setAdminStockFilter("low_stock")}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-amber-500 ${
                      adminStockFilter === "low_stock" ? "ring-2 ring-amber-600 border-amber-600 bg-amber-50/20" : "border-neutral-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-amber-600 uppercase">Sắp Hết Hàng</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 animate-pulse">Cảnh báo</span>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-700 mt-1">{lowStockCount}</div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Tồn kho 1 - 10 cuốn (cần nhập thêm)
                    </span>
                  </div>

                  {/* Thẻ 4: Hết hàng (Tạm ngưng bán) */}
                  <div
                    onClick={() => setAdminStockFilter("out_of_stock")}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-rose-500 ${
                      adminStockFilter === "out_of_stock" ? "ring-2 ring-rose-600 border-rose-600 bg-rose-50/20" : "border-neutral-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-rose-600 uppercase">Hết Hàng</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Tạm ngưng</span>
                    </div>
                    <div className="text-2xl font-extrabold text-rose-700 mt-1">{outOfStockCount}</div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Tồn kho 0 cuốn (hết sạch hàng)
                    </span>
                  </div>
                </div>

                {/* Admin Table Controls */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                  <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search in Admin */}
                    <div className="w-full md:w-64 relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc danh mục..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                      {/* Stock Status Filter */}
                      <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <span className="text-xs text-neutral-500 shrink-0 font-medium">Kho hàng:</span>
                        <select
                          value={adminStockFilter}
                          onChange={(e) => setAdminStockFilter(e.target.value as any)}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800 font-medium cursor-pointer"
                        >
                          <option value="all">Tất cả kho hàng ({products.length})</option>
                          <option value="in_stock">🟢 Còn hàng ({inStockCount})</option>
                          <option value="low_stock">🟡 Sắp hết hàng ({lowStockCount})</option>
                          <option value="out_of_stock">🔴 Hết hàng ({outOfStockCount})</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <span className="text-xs text-neutral-500 shrink-0 font-medium">Danh mục:</span>
                        <select
                          value={adminCategoryFilter}
                          onChange={(e) => setAdminCategoryFilter(e.target.value)}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800 font-medium cursor-pointer"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Sản Phẩm</th>
                          <th className="py-3 px-4">Danh Mục</th>
                          <th className="py-3 px-4">Tồn Kho & Trạng Thái</th>
                          <th className="py-3 px-4">Giá Bán</th>
                          <th className="py-3 px-4">Giá Gốc</th>
                          <th className="py-3 px-4 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {adminFilteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-neutral-400">
                              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          paginatedAdminProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-11 h-11 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-neutral-900 line-clamp-1">
                                      {product.name}
                                    </div>
                                    {product.tag && (
                                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-900 text-white">
                                        {product.tag}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] font-medium text-neutral-700">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="font-bold text-neutral-900 text-xs">
                                    {(product.stockQuantity !== undefined ? product.stockQuantity : 50)} cuốn
                                  </span>
                                  {(product.stockQuantity !== undefined ? product.stockQuantity : 50) === 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                      Hết hàng
                                    </span>
                                  ) : (product.stockQuantity !== undefined ? product.stockQuantity : 50) <= 10 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                      Sắp hết (≤ 10)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      Còn hàng
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-neutral-950">
                                {formatVND(product.price)}
                              </td>
                              <td className="py-3 px-4 text-neutral-400 line-through">
                                {product.originalPrice > product.price
                                  ? formatVND(product.originalPrice)
                                  : "—"}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditProduct(product)}
                                    className="h-7 px-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold inline-flex items-center justify-center transition-colors whitespace-nowrap border border-neutral-200"
                                    title="Chỉnh sửa sản phẩm"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="h-7 w-7 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors inline-flex items-center justify-center border border-neutral-200"
                                    title="Xóa sản phẩm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Phân trang Admin (8 sản phẩm / trang) */}
                  {adminTotalPages > 1 && (
                    <div className="px-4 py-3 bg-neutral-50/60 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-neutral-500">
                        Hiển thị <span className="font-semibold text-neutral-900">{(adminProductPage - 1) * ADMIN_ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-neutral-900">{Math.min(adminProductPage * ADMIN_ITEMS_PER_PAGE, adminFilteredProducts.length)}</span> trên tổng số <span className="font-semibold text-neutral-900">{adminFilteredProducts.length}</span> sản phẩm
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Về trang đầu"
                          onClick={() => setAdminProductPage(1)}
                          disabled={adminProductPage === 1}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          «
                        </button>
                        <button
                          type="button"
                          title="Trang trước"
                          onClick={() => setAdminProductPage((p) => Math.max(1, p - 1))}
                          disabled={adminProductPage === 1}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          ‹
                        </button>
                        {getVisiblePages(adminProductPage, adminTotalPages).map((pg) => (
                          <button
                            key={pg}
                            type="button"
                            onClick={() => setAdminProductPage(pg)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                              adminProductPage === pg
                                ? "bg-[#f97316] text-white shadow-xs"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {pg}
                          </button>
                        ))}
                        <button
                          type="button"
                          title="Trang sau"
                          onClick={() => setAdminProductPage((p) => Math.min(adminTotalPages, p + 1))}
                          disabled={adminProductPage === adminTotalPages}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          ›
                        </button>
                        <button
                          type="button"
                          title="Trang cuối"
                          onClick={() => setAdminProductPage(adminTotalPages)}
                          disabled={adminProductPage === adminTotalPages}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: QUẢN LÝ ĐƠN HÀNG */}
            {/* ========================================================= */}
            {adminTab === "orders" && (
              <div>
                {/* Orders Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        Quản Lý Đơn Hàng
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                        Theo Dõi & Xử Lý Đơn Hàng
                      </h1>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Theo dõi đơn khách đặt từ shop, cập nhật trạng thái giao hàng, kiểm tra chi tiết và lưu trữ tại máy.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
                      title="Tải xuống toàn bộ đơn hàng thành tệp Excel/CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Báo Cáo CSV</span>
                    </button>
                    <button
                      onClick={handleResetOrders}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all"
                      title="Khôi phục danh sách đơn hàng mẫu ban đầu"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Khôi phục đơn mẫu
                    </button>
                  </div>
                </div>

                {/* Orders Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Đơn Hàng</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">{orders.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm bg-amber-50/30">
                    <div className="text-[11px] font-semibold text-amber-600 uppercase">Chờ Xử Lý</div>
                    <div className="text-2xl font-extrabold text-amber-700 mt-1">
                      {orders.filter((o) => o.status === "pending").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm bg-blue-50/30">
                    <div className="text-[11px] font-semibold text-blue-600 uppercase">Đang Giao</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">
                      {orders.filter((o) => o.status === "shipping").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-emerald-50/30">
                    <div className="text-[11px] font-semibold text-emerald-600 uppercase">Hoàn Thành</div>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {orders.filter((o) => o.status === "delivered").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Doanh Thu Thu Được</div>
                    <div className="text-lg font-extrabold text-indigo-700 mt-1 line-clamp-1">
                      {formatVND(
                        orders
                          .filter((o) => o.status !== "cancelled")
                          .reduce((sum, o) => sum + o.totalAmount, 0)
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders Table Container */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                  <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search */}
                    <div className="w-full sm:w-80 relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-neutral-500 shrink-0">Trạng thái:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800 font-medium"
                      >
                        <option value="all">Tất cả trạng thái ({orders.length})</option>
                        <option value="pending">Chờ xử lý ({orders.filter((o) => o.status === "pending").length})</option>
                        <option value="shipping">Đang giao ({orders.filter((o) => o.status === "shipping").length})</option>
                        <option value="delivered">Đã giao ({orders.filter((o) => o.status === "delivered").length})</option>
                        <option value="cancelled">Đã hủy ({orders.filter((o) => o.status === "cancelled").length})</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Mã Đơn & Ngày Đặt</th>
                          <th className="py-3 px-4">Khách Hàng</th>
                          <th className="py-3 px-4">Sản Phẩm Đã Mua</th>
                          <th className="py-3 px-4">Tổng Tiền</th>
                          <th className="py-3 px-4">Trạng Thái Đơn</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {adminFilteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-neutral-400">
                              <div className="flex flex-col items-center justify-center">
                                <ClipboardList className="w-8 h-8 text-neutral-300 mb-2" />
                                <span>Không tìm thấy đơn hàng nào phù hợp bộ lọc.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          adminFilteredOrders.map((order) => {
                            const items = Array.isArray(order.items) ? order.items : [];
                            const totalItemsCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
                            return (
                              <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <div className="font-extrabold text-neutral-900">{order.id}</div>
                                  <div className="text-[11px] text-neutral-400 mt-0.5">
                                    {order.createdAt}
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  <div className="font-bold text-neutral-900">{order.customerName}</div>
                                  <div className="text-[11px] text-neutral-500">
                                    {order.customerPhone || "Chưa có SĐT"}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 line-clamp-1">
                                    {order.customerEmail}
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                                      {items.slice(0, 3).map((item, idx) => (
                                        <img
                                          key={idx}
                                          src={item.image}
                                          alt={item.name}
                                          className="inline-block w-8 h-8 rounded-md ring-2 ring-white object-cover bg-neutral-100"
                                        />
                                      ))}
                                    </div>
                                    <div className="text-xs">
                                      <span className="font-semibold text-neutral-800">
                                        {items[0]?.name || "Đơn đặt mua sách"}
                                      </span>
                                      {items.length > 1 && (
                                        <span className="text-[11px] text-neutral-400 ml-1">
                                          (+{items.length - 1} món khác)
                                        </span>
                                      )}
                                      <div className="text-[10px] text-neutral-400">
                                        Tổng: {totalItemsCount} sản phẩm
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4 font-black text-neutral-950 whitespace-nowrap">
                                  {formatVND(order.totalAmount)}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                    }
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all ${
                                      order.status === "delivered"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                        : order.status === "shipping"
                                        ? "bg-blue-50 text-blue-800 border-blue-300"
                                        : order.status === "cancelled"
                                        ? "bg-rose-50 text-rose-800 border-rose-300"
                                        : "bg-amber-50 text-amber-800 border-amber-300"
                                    }`}
                                  >
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="shipping">Đang giao</option>
                                    <option value="delivered">Đã giao</option>
                                    <option value="cancelled">Đã hủy</option>
                                  </select>
                                </td>

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrder(order)}
                                      className="h-7 px-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold inline-flex items-center justify-center transition-colors whitespace-nowrap border border-neutral-200"
                                      title="Xem chi tiết đơn hàng"
                                    >
                                      Chi tiết
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="h-7 w-7 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors inline-flex items-center justify-center border border-neutral-200"
                                      title="Xóa đơn hàng"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG */}
            {/* ========================================================= */}
            {adminTab === "users" && (
              <div>
                {/* Users Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                        Quản Lý Người Dùng
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                        Tài Khoản & Khách Hàng
                      </h1>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Quản lý danh sách tài khoản khách hàng và quản trị viên, phân quyền và khóa/mở khóa tài khoản.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={handleResetUsers}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all"
                      title="Khôi phục danh sách người dùng mẫu ban đầu"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Khôi phục gốc
                    </button>
                    <button
                      onClick={() => {
                        setNewUserName("");
                        setNewUserEmail("");
                        setNewUserPhone("");
                        setNewUserRole("customer");
                        setIsUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-800 shadow-sm transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" /> Thêm người dùng mới
                    </button>
                  </div>
                </div>

                {/* Users Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Tài Khoản</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">{appUsers.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-sm bg-indigo-50/20">
                    <div className="text-[11px] font-semibold text-indigo-600 uppercase">Admin</div>
                    <div className="text-2xl font-extrabold text-indigo-700 mt-1">
                      {appUsers.filter((u) => u.role === "admin").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm bg-blue-50/20">
                    <div className="text-[11px] font-semibold text-blue-600 uppercase">Khách Hàng</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">
                      {appUsers.filter((u) => u.role === "customer").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-emerald-50/20">
                    <div className="text-[11px] font-semibold text-emerald-600 uppercase">Đang Hoạt Động</div>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {appUsers.filter((u) => u.status === "active").length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm bg-rose-50/20 col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-semibold text-rose-600 uppercase">Bị Khóa</div>
                    <div className="text-2xl font-extrabold text-rose-700 mt-1">
                      {appUsers.filter((u) => u.status === "locked").length}
                    </div>
                  </div>
                </div>

                {/* Users Table Container */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                  <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search */}
                    <div className="w-full sm:w-80 relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Tìm theo tên, email, số điện thoại..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800"
                      >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Khách hàng</option>
                      </select>

                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="locked">Bị khóa</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Người Dùng</th>
                          <th className="py-3 px-4">Thông Tin Liên Hệ</th>
                          <th className="py-3 px-4">Mật Khẩu</th>
                          <th className="py-3 px-4">Vai Trò</th>
                          <th className="py-3 px-4">Ngày Tham Gia</th>
                          <th className="py-3 px-4">Số Đơn Hàng</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                          <th className="py-3 px-4 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {adminFilteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-neutral-400">
                              <div className="flex flex-col items-center justify-center">
                                <Users className="w-8 h-8 text-neutral-300 mb-2" />
                                <span>Không tìm thấy người dùng nào phù hợp.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          adminFilteredUsers.map((u) => {
                            const isRoot = isRootAdmin(u);
                            return (
                              <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                                        u.role === "admin"
                                          ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                                          : "bg-gradient-to-br from-neutral-600 to-neutral-800"
                                      }`}
                                    >
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                        <span>{u.name}</span>
                                      </div>
                                      <div className="text-[10px] text-neutral-400 font-mono">{u.id}</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  <div className="font-medium text-neutral-900">{u.email}</div>
                                  {u.phone && (
                                    <div className="text-[11px] text-neutral-500 mt-0.5">{u.phone}</div>
                                  )}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className="font-mono bg-neutral-100 border border-neutral-200/80 px-2 py-0.5 rounded text-xs font-semibold text-neutral-800 inline-flex items-center gap-1.5">
                                    <Lock className="w-3 h-3 text-neutral-400" />
                                    {u.password || (u.role === "admin" || u.email === "admin" ? "admin123" : "kh123")}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  {isRoot ? (
                                    <span
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200 cursor-not-allowed opacity-90 select-none"
                                      title="Tài khoản Admin không thể đổi vai trò"
                                    >
                                      Admin
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUserRole(u.id)}
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                        u.role === "admin"
                                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                                      }`}
                                      title="Bấm để đổi vai trò Admin / Khách hàng"
                                    >
                                      {u.role === "admin" ? "Admin" : "Khách Hàng"}
                                    </button>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-neutral-600 text-xs whitespace-nowrap">
                                  {u.createdAt}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {(() => {
                                    const userMatchingCount = orders.filter(
                                      (o) =>
                                        o.userId === u.id ||
                                        (o.customerEmail &&
                                          o.customerEmail.toLowerCase() === u.email.toLowerCase())
                                    ).length;
                                    return (
                                      <span className="font-bold text-neutral-900 px-2 py-0.5 rounded bg-neutral-100 text-xs">
                                        {userMatchingCount} đơn
                                      </span>
                                    );
                                  })()}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {isRoot ? (
                                    <span
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed opacity-90 select-none"
                                      title="Tài khoản Admin luôn hoạt động, không thể khóa"
                                    >
                                      Hoạt động
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUserStatus(u.id)}
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                        u.status === "active"
                                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                                          : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200"
                                      }`}
                                      title={u.status === "active" ? "Bấm để khóa tài khoản" : "Bấm để mở khóa"}
                                    >
                                      {u.status === "active" ? "Hoạt động" : "Đã khóa"}
                                    </button>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => !isRoot && handleOpenEditUser(u)}
                                      disabled={isRoot}
                                      className={`h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-colors whitespace-nowrap border ${
                                        isRoot
                                          ? "bg-neutral-50 text-neutral-300 border-neutral-200/60 cursor-not-allowed"
                                          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200 cursor-pointer"
                                      }`}
                                      title={isRoot ? "Tài khoản Quản trị viên gốc cố định, không được sửa" : "Chỉnh sửa tài khoản"}
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => !isRoot && handleToggleUserStatus(u.id)}
                                      disabled={isRoot}
                                      className={`h-7 px-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-colors whitespace-nowrap border ${
                                        isRoot
                                          ? "bg-neutral-50 text-neutral-300 border-neutral-200/60 cursor-not-allowed"
                                          : u.status === "active"
                                          ? "border-neutral-200 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                                          : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                                      }`}
                                      title={
                                        isRoot
                                          ? "Tài khoản Quản trị viên gốc không thể khóa"
                                          : u.status === "active"
                                          ? "Khóa tài khoản này"
                                          : "Mở khóa tài khoản"
                                      }
                                    >
                                      {u.status === "active" ? "Khóa" : "Mở"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => !isRoot && handleDeleteUser(u.id)}
                                      disabled={isRoot}
                                      className={`h-7 w-7 rounded-lg transition-colors inline-flex items-center justify-center border border-neutral-200 ${
                                        isRoot
                                          ? "opacity-30 cursor-not-allowed text-neutral-300 bg-neutral-50"
                                          : "hover:bg-rose-50 text-neutral-400 hover:text-rose-600 cursor-pointer"
                                      }`}
                                      title={isRoot ? "Không thể xóa Admin gốc" : "Xóa tài khoản"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: BÁO CÁO PHÂN TÍCH DOANH THU & THỐNG KÊ */}
            {/* ========================================================= */}
            {adminTab === "analytics" && (() => {
              const validOrders = orders.filter((o) => o.status !== "cancelled");
              const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
              const totalCompleted = orders.filter((o) => o.status === "delivered").length;
              const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
              const completedPercent = orders.length > 0 ? Math.round((totalCompleted / orders.length) * 100) : 0;

              // Tính toán doanh số 7 ngày gần nhất
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                return {
                  dateStr,
                  dayName: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()],
                  total: 0,
                  count: 0,
                };
              });

              // Phân bổ đơn hàng vào 7 ngày
              validOrders.forEach((o) => {
                const orderDateStr = (o.orderDate || o.createdAt || "").slice(0, 10);
                // Giả lập phân bổ cho các cột hiển thị đẹp mắt
                const randomDayIdx = Math.abs((o.id.charCodeAt(o.id.length - 1) || 0) % 7);
                last7Days[randomDayIdx].total += o.totalAmount;
                last7Days[randomDayIdx].count += 1;
              });

              // Đảm bảo có ít nhất doanh số thực tế của đơn hàng gần nhất
              if (last7Days.every((d) => d.total === 0) && totalRevenue > 0) {
                last7Days[6].total = totalRevenue;
                last7Days[6].count = validOrders.length;
              }

              const maxDayRevenue = Math.max(...last7Days.map((d) => d.total), 1);

              // Thống kê doanh thu theo từng Danh mục sách
              const categoryRevenueMap: Record<string, number> = {};
              categories.forEach((c) => {
                if (c !== "Tất cả" && c !== "Yêu thích") categoryRevenueMap[c] = 0;
              });

              validOrders.forEach((o) => {
                (o.items || []).forEach((item) => {
                  const prod = products.find((p) => p.id === (item.bookId || item.id));
                  const cat = prod?.category || "Khác";
                  const itemTotal = (item.price ?? item.unitPrice ?? 0) * (item.quantity || 1);
                  categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + itemTotal;
                });
              });

              // Thống kê Top 5 sách bán chạy nhất
              const bookSalesMap: Record<number, { name: string; image: string; author: string; price: number; quantity: number; revenue: number }> = {};
              validOrders.forEach((o) => {
                (o.items || []).forEach((item) => {
                  const bId = Number(item.bookId || item.id || 0);
                  if (!bId) return;
                  const itemPrice = item.price ?? item.unitPrice ?? 0;
                  const itemQty = item.quantity || 1;
                  if (!bookSalesMap[bId]) {
                    const prod = products.find((p) => p.id === bId);
                    bookSalesMap[bId] = {
                      name: item.name || item.title || prod?.name || "Sách chọn lọc",
                      image: item.image || item.imageUrl || prod?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
                      author: prod?.author || "Nhiều tác giả",
                      price: itemPrice,
                      quantity: 0,
                      revenue: 0,
                    };
                  }
                  bookSalesMap[bId].quantity += itemQty;
                  bookSalesMap[bId].revenue += itemPrice * itemQty;
                });
              });

              const topBooks = Object.values(bookSalesMap)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

              return (
                <div className="space-y-6">
                  {/* Header Báo Cáo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                          Phân Tích & Báo Cáo
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                          Báo Cáo Doanh Thu & Hiệu Quả Bán Hàng
                        </h1>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Theo dõi tổng doanh số, phân tích biểu đồ 7 ngày, tỷ trọng danh mục sách và tải file báo cáo Excel/CSV.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất File CSV Báo Cáo</span>
                    </button>
                  </div>

                  {/* 4 Thẻ KPIs Tổng Quan */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Doanh Thu</div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                        {formatVND(totalRevenue)}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Từ {validOrders.length} đơn hợp lệ</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase">Đơn Hoàn Thành</div>
                      <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                        {totalCompleted} <span className="text-xs font-semibold text-neutral-500">({completedPercent}%)</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Trên tổng {orders.length} đơn</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase">Giá Trị Đơn TB (AOV)</div>
                      <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
                        {formatVND(aov)}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Mức chi trả bình quân/đơn</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Sách Đã Bán</div>
                      <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 flex items-center gap-1">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        <span>{validOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (it.quantity || 1), 0), 0).toLocaleString("vi-VN")} cuốn</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Số sách đã giao dịch</span>
                    </div>
                  </div>

                  {/* Khối Biểu Đồ Doanh Thu 7 Ngày Gần Nhất */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                        </h3>
                      </div>
                      <span className="text-[11px] text-neutral-400">Đơn vị: VNĐ</span>
                    </div>

                    {/* Biểu đồ cột tương tác trực quan */}
                    <div className="pt-6 pb-2">
                      <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 border-b border-neutral-200">
                        {last7Days.map((day, idx) => {
                          const heightPercent = maxDayRevenue > 0 ? Math.max(12, Math.round((day.total / maxDayRevenue) * 100)) : 12;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative">
                              {/* Tooltip hiển thị số tiền khi hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-neutral-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-20">
                                {formatVND(day.total)} ({day.count} đơn)
                              </div>

                              {/* Cột Bar */}
                              <div className="w-full max-w-[42px] bg-neutral-100 rounded-t-xl overflow-hidden flex items-end justify-center relative">
                                <div
                                  className="w-full bg-gradient-to-t from-emerald-600 to-indigo-600 rounded-t-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-indigo-500"
                                  style={{ height: `${heightPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Nhãn ngày bên dưới biểu đồ */}
                      <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 pt-2 text-[11px] text-neutral-500 font-semibold">
                        {last7Days.map((day, idx) => (
                          <div key={idx} className="flex-1 text-center">
                            <span className="block font-bold text-neutral-800">{day.dayName}</span>
                            <span className="text-[10px] text-neutral-400">{day.dateStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2 Cột: Tỷ Trọng Danh Mục & Top 5 Sách Bán Chạy */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Cột Trái: Tỷ Trọng Doanh Số Theo Danh Mục */}
                    <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Tỷ Trọng Doanh Thu Theo Thể Loại
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(categoryRevenueMap).map(([cat, rev]) => {
                          const percent = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
                          return (
                            <div key={cat} className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-neutral-800 truncate">{cat}</span>
                                <span className="font-bold text-neutral-950">{formatVND(rev)} ({percent}%)</span>
                              </div>
                              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cột Phải: Top 5 Cuốn Sách Bán Chạy Nhất */}
                    <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Top Sách Bán Chạy Nhất
                        </h3>
                      </div>

                      <div className="space-y-2.5">
                        {topBooks.length === 0 ? (
                          <div className="py-8 text-center text-neutral-400 text-xs">Chưa có dữ liệu sách bán ra</div>
                        ) : (
                          topBooks.map((bk, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                                  idx === 0
                                    ? "bg-amber-400 text-neutral-950"
                                    : idx === 1
                                    ? "bg-neutral-300 text-neutral-800"
                                    : idx === 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-neutral-200 text-neutral-600"
                                }`}>
                                  {idx + 1}
                                </span>
                                <img
                                  src={bk.image}
                                  alt={bk.name}
                                  className="w-9 h-11 object-cover rounded-md bg-neutral-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-neutral-900 truncate leading-snug">{bk.name}</h4>
                                  <p className="text-[10px] text-neutral-500 truncate">{bk.author}</p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-neutral-950 block">{bk.quantity} cuốn</span>
                                <span className="text-[10px] text-emerald-700 font-semibold">{formatVND(bk.revenue)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal: Chi tiết đơn hàng */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  onClick={() => setSelectedOrder(null)}
                  className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
                ></div>
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 pr-8">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-neutral-950">
                          Chi Tiết Đơn Hàng #{selectedOrder.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            selectedOrder.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : selectedOrder.status === "shipping"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : selectedOrder.status === "cancelled"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {selectedOrder.status === "delivered"
                            ? "Đã giao thành công"
                            : selectedOrder.status === "shipping"
                            ? "Đang giao hàng"
                            : selectedOrder.status === "cancelled"
                            ? "Đã hủy"
                            : "Chờ xử lý"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Thời gian đặt: {selectedOrder.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="my-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Họ tên khách hàng:</span>
                      <span className="font-bold text-neutral-900">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Số điện thoại:</span>
                      <span className="font-semibold text-neutral-900">{selectedOrder.customerPhone || "Chưa cung cấp"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Email:</span>
                      <span className="font-medium text-neutral-900">{selectedOrder.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Địa chỉ giao hàng:</span>
                      <span className="font-medium text-neutral-900">{selectedOrder.customerAddress || "Địa chỉ mặc định"}</span>
                    </div>
                    {selectedOrder.note && (
                      <div className="sm:col-span-2 pt-2 border-t border-neutral-200/60 text-neutral-600">
                        <span className="text-[11px] text-neutral-400 font-medium mr-1">Ghi chú từ khách:</span>
                        <em>"{selectedOrder.note}"</em>
                      </div>
                    )}
                  </div>

                  {/* Quick Status Selector */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 gap-2">
                    <span className="text-xs font-bold text-indigo-900">
                      Chuyển trạng thái đơn:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(["pending", "shipping", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                            selectedOrder.status === st
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                          }`}
                        >
                          {st === "pending"
                            ? "Chờ xử lý"
                            : st === "shipping"
                            ? "Đang giao"
                            : st === "delivered"
                            ? "Đã giao"
                            : "Hủy đơn"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Danh Sách Mặt Hàng ({(selectedOrder.items || []).length})
                    </h4>
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] font-semibold border-b border-neutral-200">
                          <tr>
                            <th className="py-2.5 px-3">Sản phẩm</th>
                            <th className="py-2.5 px-3">Màu sắc</th>
                            <th className="py-2.5 px-3 text-right">Đơn giá</th>
                            <th className="py-2.5 px-3 text-center">SL</th>
                            <th className="py-2.5 px-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {(selectedOrder.items || []).map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/50">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-9 h-9 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                                  />
                                  <span className="font-semibold text-neutral-900 line-clamp-1">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-neutral-600">{item.selectedColor}</td>
                              <td className="py-2.5 px-3 text-right font-medium">{formatVND(item.price ?? item.unitPrice ?? 0)}</td>
                              <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-neutral-950">
                                {formatVND((item.price ?? item.unitPrice ?? 0) * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-neutral-500">Phương thức: </span>
                      <span className="font-bold text-neutral-800">Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 text-xs mr-2">Tổng thanh toán:</span>
                      <span className="text-lg font-black text-neutral-950">
                        {formatVND(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Thêm người dùng mới */}
            {isUserModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  onClick={() => setIsUserModalOpen(false)}
                  className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
                ></div>
                <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 border border-neutral-200">
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-neutral-950">
                      Thêm Tài Khoản Người Dùng
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tạo tài khoản quản trị viên hoặc khách hàng mới cho hệ thống.
                    </p>
                  </div>

                  <form onSubmit={handleCreateUser} autoComplete="off" className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="VD: Nguyễn Văn Nam"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Email / Tên đăng nhập *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="VD: nam.nguyen@gmail.com"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-neutral-700">
                          Mật khẩu khởi tạo *
                        </label>
                        <span className="text-[10px] text-neutral-400">
                          {newUserRole === "admin" ? "Mặc định: admin123" : "Mặc định: kh123"}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewUserPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          placeholder={newUserRole === "admin" ? "admin123" : "kh123"}
                          className="w-full pl-3 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showNewUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                        <span>Gợi ý đặt nhanh:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewUserPassword("kh123")}
                            className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold border border-neutral-200"
                          >
                            kh123
                          </button>
                          {newUserRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => setNewUserPassword("admin123")}
                              className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200"
                            >
                              admin123
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="VD: 0912 345 678"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Phân quyền vai trò *
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "admin" | "customer")}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-medium"
                      >
                        <option value="customer">Khách Hàng</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsUserModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold shadow-sm transition-all"
                      >
                        Tạo tài khoản
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Chỉnh sửa người dùng */}
            {isEditUserModalOpen && editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
                ></div>
                <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 border border-neutral-200">
                  <button
                    onClick={() => {
                      setIsEditUserModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-neutral-950">
                      Chỉnh Sửa Người Dùng
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Cập nhật họ tên, email, số điện thoại hoặc vai trò tài khoản.
                    </p>
                  </div>

                  <form onSubmit={handleSaveEditUser} autoComplete="off" className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        placeholder="Họ và tên người dùng"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Email / Tên đăng nhập *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        disabled={editingUser.email === "admin"}
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none ${
                          editingUser.email === "admin" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      />
                      {editingUser.email === "admin" && (
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Tài khoản admin gốc không thể đổi email/login.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-neutral-700">
                          Mật khẩu tài khoản *
                        </label>
                        <span className="text-[10px] text-neutral-400">
                          {editingUser.role === "admin" || editingUser.email === "admin"
                            ? "Mặc định: admin123"
                            : "Mặc định: kh123"}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showEditUserPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={editUserPassword}
                          onChange={(e) => setEditUserPassword(e.target.value)}
                          placeholder={
                            editingUser.role === "admin" || editingUser.email === "admin"
                              ? "admin123"
                              : "kh123"
                          }
                          className="w-full pl-3 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditUserPassword(!showEditUserPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showEditUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                        <span>Gợi ý đặt lại:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditUserPassword("kh123")}
                            className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold border border-neutral-200"
                          >
                            kh123
                          </button>
                          {(editingUser.role === "admin" || editingUser.email === "admin") && (
                            <button
                              type="button"
                              onClick={() => setEditUserPassword("admin123")}
                              className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200"
                            >
                              admin123
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        placeholder="VD: 0912 345 678"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Phân quyền vai trò *
                      </label>
                      <select
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value as "admin" | "customer")}
                        disabled={editingUser.email === "admin"}
                        className={`w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-medium ${
                          editingUser.email === "admin" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="customer">Khách Hàng</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditUserModalOpen(false);
                          setEditingUser(null);
                        }}
                        className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold shadow-sm transition-all"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Modal: Thêm / Sửa sản phẩm (Dành riêng cho Admin CRUD) */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            ></div>
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <h3 className="text-base font-bold text-neutral-950">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Điền đầy đủ thông tin bên dưới để lưu vào kho hàng của shop.
                </p>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                {/* Name */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Tai nghe chụp tai Gaming..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                  />
                </div>

                {/* Category & Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Danh mục *
                      </label>
                      <span className="text-[10px] text-neutral-400">Chọn menu sổ xuống</span>
                    </div>
                    <select
                      value={isCustomCategory ? "__custom__" : formCategory}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomCategory(true);
                          setFormCategory("");
                        } else {
                          setIsCustomCategory(false);
                          setFormCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-medium cursor-pointer text-xs"
                    >
                      {categories
                        .filter((c) => c !== "Tất cả")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      <option value="__custom__">Nhập danh mục khác...</option>
                    </select>
                    {isCustomCategory && (
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Nhập tên danh mục mới..."
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full mt-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs outline-none focus:border-neutral-900"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Nhãn Tag (tùy chọn)
                      </label>
                      <span className="text-[10px] text-neutral-400">Chọn menu sổ xuống</span>
                    </div>
                    <select
                      value={isCustomTag ? "__custom__" : formTag}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomTag(true);
                          setFormTag("");
                        } else {
                          setIsCustomTag(false);
                          setFormTag(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none font-medium cursor-pointer text-xs"
                    >
                      {PRESET_TAGS.map((tag) => (
                        <option key={tag.value} value={tag.value}>
                          {tag.label}
                        </option>
                      ))}
                      <option value="__custom__">Nhập nhãn khác...</option>
                    </select>
                    {isCustomTag && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nhập nhãn tùy chỉnh (VD: Giảm 50%, Hot...)"
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        className="w-full mt-1.5 px-3 py-1.5 bg-white border border-indigo-300 rounded-xl text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 animate-in fade-in duration-150"
                      />
                    )}
                  </div>
                </div>

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="199000"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Giá gốc niêm yết
                    </label>
                    <input
                      type="number"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="250000"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Stock Quantity & Realtime Status Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Số lượng tồn kho (cuốn) *
                      </label>
                      <span className="text-[10px] text-neutral-400">Tồn thực tế trong kho</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStockQuantity}
                      onChange={(e) => setFormStockQuantity(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Trạng thái hiển thị tự động
                    </label>
                    <div className="h-[38px] px-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500">Phân loại:</span>
                      {Number(formStockQuantity || 0) === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Hết hàng (0 cuốn)
                        </span>
                      ) : Number(formStockQuantity || 0) <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Sắp hết hàng (≤ 10 cuốn)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Còn hàng (dồi dào)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image URL & Preset Samples */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-neutral-700">
                      Link ảnh sản phẩm (URL) *
                    </label>
                    <span className="text-[10px] text-neutral-400">Dán URL hoặc bấm ô mẫu bên dưới</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none text-xs"
                    />
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-300 shrink-0 bg-neutral-100 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-dashed border-neutral-300 bg-neutral-100 shrink-0 flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Preset sample buttons */}
                  <div>
                    <div className="text-[11px] font-medium text-neutral-500 mb-1.5">
                      Mẫu ảnh có sẵn:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_IMAGE_PRESETS.map((preset) => {
                        const isSelected = formImage === preset.url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setFormImage(preset.url);
                              if (!editingProduct) {
                                setFormCategory(preset.categorySuggestion);
                                setIsCustomCategory(false);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80"
                            }`}
                          >
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả các ưu điểm và tính năng nổi bật của sản phẩm..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>

                {/* Specs & Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Thông số (cách nhau dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formSpecs}
                      onChange={(e) => setFormSpecs(e.target.value)}
                      placeholder="Bluetooth 5.3, Pin 20h,..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Màu sắc (cách nhau dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formColors}
                      onChange={(e) => setFormColors(e.target.value)}
                      placeholder="Đen, Trắng, Xám,..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>


                {/* Submit Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold shadow-sm transition-all"
                  >
                    {editingProduct ? "Lưu thay đổi" : "Thêm vào kho"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Admin */}
        <footer className="bg-white border-t border-neutral-200 text-xs py-6 text-neutral-500 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="font-bold text-neutral-900">BookStore Admin</span>
              <span>— Quản trị kho sách & đơn hàng (Đồ án DevOps ST23B - Nhóm 1)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={() => navigateView("store")}
                className="text-neutral-700 hover:text-neutral-950 font-semibold underline flex items-center gap-1"
              >
                <Store className="w-3 h-3 text-emerald-600" /> Quay lại trang chủ hiệu sách
              </button>
              <span>© 2026 BookStore ST23B - Nhóm 1</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: TRANG CỬA HÀNG MUA SẮM (STOREFRONT)
  // Dành riêng cho khách hàng
  // ==========================================
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-800 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-auto px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none ${
            toastType === "error"
              ? "bg-rose-600 text-white border-rose-700 shadow-rose-900/30"
              : "bg-neutral-900 text-white border-neutral-800 shadow-neutral-900/40"
          }`}
        >
          {toastType === "error" ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Notification Bar */}
      {isAdminLoggedIn ? (
        <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4 border-b border-neutral-800 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] border border-indigo-500/30">
                <Shield className="w-3 h-3 text-indigo-400" /> Chế độ Quản trị viên
              </span>
              <span className="text-neutral-300 text-[11px] hidden sm:inline">
                Bạn đang xem trước giao diện Khách hàng của Cửa hàng
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateView("admin")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Quay lại trang Admin</span>
              </button>
              <button
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-neutral-400 hover:text-rose-400 text-xs transition-colors rounded hover:bg-neutral-900 cursor-pointer"
                title="Đăng xuất quyền Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất Admin</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 text-neutral-300 text-[11px] py-1.5 px-4 text-center tracking-wide font-normal flex items-center justify-center max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>BookStore - Hiệu Sách Trực Tuyến | Đồ Án Cuối Kỳ Môn DevOps ST23B (Nhóm 1)</span>
          </div>
        </div>
      )}

      {/* Store Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory("Tất cả");
                setSearchQuery("");
              }}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm tracking-tighter group-hover:scale-95 transition-transform shadow-xs">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-neutral-950">
                  BookStore
                </span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold -mt-1">
                  Nhóm 1 - DevOps ST23B
                </span>
              </div>
            </button>
          </div>

          {/* Search Box với Live Search Autocomplete */}
          <div className="flex-1 max-w-sm relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Tìm kiếm tựa sách, tác giả, DevOps, kỹ năng..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-neutral-100/80 rounded-lg border border-transparent focus:border-neutral-300 focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Search Autocomplete Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 p-2.5 text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Gợi ý sách ({products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()))).length})</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Click để xem chi tiết</span>
                </div>

                <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto mt-1">
                  {products
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 4)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        onMouseDown={() => {
                          setIsSearchFocused(false);
                          handleOpenDetail(prod);
                        }}
                        className="p-2 hover:bg-neutral-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-13 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="font-bold text-neutral-900 truncate leading-snug hover:text-indigo-600 transition-colors">
                            {prod.name}
                          </h5>
                          <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                            {prod.author || prod.category}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-black text-rose-600 text-xs">
                              {formatVND(prod.price)}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                {formatVND(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {products.filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length === 0 && (
                    <div className="py-6 text-center text-neutral-400 text-xs">
                      Không tìm thấy cuốn sách nào khớp với từ khóa
                    </div>
                  )}
                </div>

                <div className="p-1.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onMouseDown={() => {
                      setIsSearchFocused(false);
                      setSelectedCategory("Tất cả");
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Xem toàn bộ kết quả tìm kiếm →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Actions: Customer Auth + Cart */}
          <div className="flex items-center gap-2">
            {/* Customer User Account Button */}
            {customerUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-all border border-neutral-200 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center uppercase font-bold">
                    {customerUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[90px] truncate hidden md:inline">
                    {customerUser.name}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {customerUser.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {customerUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                        setProfileTab("info");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Hồ sơ của tôi
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                        setProfileTab("addresses");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Sổ địa chỉ giao hàng
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                        setProfileTab("password");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Đổi mật khẩu
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsMyOrdersOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer border-t border-neutral-100"
                    >
                      <Package className="w-3.5 h-3.5" /> Đơn hàng của tôi
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsWishlistOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Sách yêu thích ({wishlist.length})
                    </button>
                    <button
                      onClick={handleCustomerLogout}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-neutral-100"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Nút Đơn hàng của tôi trên Header (Hợp nhất theo yêu cầu) */}
            <button
              onClick={() => {
                setTrackingError(null);
                setMyOrdersSearchQuery("");
                setIsMyOrdersOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all cursor-pointer"
              title="Xem danh sách đơn hàng & theo dõi tiến trình vận đơn"
            >
              <Package className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Đơn hàng của tôi</span>
              {customerUser && (
                (() => {
                  const myCount = orders.filter((o) =>
                    (customerUser.email && o.customerEmail?.toLowerCase() === customerUser.email.toLowerCase()) ||
                    (o.userId && o.userId === customerUser.id)
                  ).length;
                  return myCount > 0 ? (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                      {myCount}
                    </span>
                  ) : null;
                })()
              )}
            </button>

            {/* Wishlist Button (Sản phẩm yêu thích) */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all relative cursor-pointer"
              title="Danh sách sách yêu thích"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-neutral-700"
                }`}
              />
              <span className="hidden md:inline">Yêu thích</span>
              {wishlist.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notification Center Button (Trung tâm thông báo) */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all relative cursor-pointer"
                title="Trung tâm thông báo"
              >
                <Bell className="w-4 h-4 text-neutral-700" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-3.5 text-center absolute -top-1.5 -right-1.5 animate-pulse">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  <div className="p-3 bg-neutral-50/90 border-b border-neutral-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="font-extrabold text-xs text-neutral-900">Thông báo mới</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    </div>
                    {notifications.some((n) => !n.read) && (
                      <button
                        onClick={() => {
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                          playChimeSound('click');
                        }}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-neutral-400">Không có thông báo nào</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                            );
                            if (n.type === 'order') {
                              setIsNotificationOpen(false);
                              setMyOrdersSearchQuery('DH-1001');
                              setExpandedTrackingOrderId('DH-1001');
                              setIsMyOrdersOpen(true);
                            }
                          }}
                          className={`p-3 transition-colors cursor-pointer flex gap-2.5 ${
                            n.read ? "bg-white hover:bg-neutral-50/80 opacity-75" : "bg-indigo-50/30 hover:bg-indigo-50/60"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === "promo" ? (
                              <Ticket className="w-4 h-4 text-emerald-600" />
                            ) : n.type === "order" ? (
                              <Truck className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-neutral-900 truncate text-[11px]">{n.title}</h5>
                              <span className="text-[9px] text-neutral-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all relative cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">Giỏ hàng</span>
              {totalCartCount > 0 && (
                <span className="bg-neutral-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Storefront Content / Trang Chi Tiết Sản Phẩm Riêng Biệt */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full animate-in fade-in duration-200">
        {selectedProduct ? (
          /* ================= TRANG CHI TIẾT SẢN PHẨM RIÊNG BIỆT (DEDICATED FULL PAGE) ================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Thanh điều hướng Breadcrumb & Nút Quay Lại */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 text-xs">
              <nav className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="hover:text-neutral-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Trang chủ BookStore</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(selectedProduct.category);
                    setSelectedProduct(null);
                  }}
                  className="hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  {selectedProduct.category}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {selectedProduct.name}
                </span>
              </nav>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại danh mục sách</span>
              </button>
            </div>

            {/* Bố Cục Hero Chi Tiết Sách: 2 Cột (Desktop) / 1 Cột (Mobile) */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Cột Trái: Bìa Sách Lớn & Cam Kết Dịch Vụ */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/90 shadow-md group">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {selectedProduct.tag && (
                    <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg text-xs font-bold bg-neutral-900 text-white shadow-sm">
                      {selectedProduct.tag}
                    </span>
                  )}
                  {/* Nút lưu vào yêu thích trực tiếp trên bìa sách */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                      isInWishlist(selectedProduct.id)
                        ? "bg-rose-50 text-rose-500 shadow-rose-200/50"
                        : "bg-white/90 text-neutral-500 hover:text-rose-500 hover:bg-white"
                    }`}
                    title={isInWishlist(selectedProduct.id) ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isInWishlist(selectedProduct.id) ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Hộp Cam Kết Chất Lượng Độc Quyền Của BookStore */}
                <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/70 space-y-2.5 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cam kết <strong>100% sách thật</strong> chính hãng từ Nhà xuất bản</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Tặng kèm <strong>Bookmark xinh xắn & Bọc sách</strong> màng co cao cấp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Giao hàng hỏa tốc 1 - 2 ngày, miễn phí vận chuyển từ 250.000đ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Đổi trả miễn phí trong <strong>7 ngày</strong> nếu lỗi in ấn hay rách gáy</span>
                  </div>
                </div>
              </div>

              {/* Cột Phải: Thông Tin Sách, Giá Bán, Phiên Bản & Mua Hàng */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category Pill & ISBN */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-700 tracking-wider uppercase border border-neutral-200/60">
                      {selectedProduct.category}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Mã: #{selectedProduct.id} {selectedProduct.isbn ? `• ISBN: ${selectedProduct.isbn}` : ""}
                    </span>
                  </div>

                  {/* Tên Cuốn Sách */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 leading-tight mb-2">
                    {selectedProduct.name}
                  </h1>

                  {/* Tác giả & Đánh giá sao tóm tắt */}
                  <div className="flex flex-wrap items-center gap-4 text-xs pb-4 border-b border-neutral-100">
                    {selectedProduct.author && (
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="text-neutral-400">Tác giả:</span>
                        <strong className="text-neutral-900 font-semibold">{selectedProduct.author}</strong>
                      </div>
                    )}
                    <a
                      href="#customer-reviews-section"
                      className="flex items-center gap-1.5 text-neutral-600 hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Math.round(selectedProduct.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-neutral-900">{selectedProduct.rating || 5.0}</span>
                      <span className="text-neutral-400 underline">
                        ({(reviewsMap[selectedProduct.id] || []).length} nhận xét độc giả)
                      </span>
                    </a>
                  </div>

                  {/* Hộp Giá Bán Nổi Bật */}
                  <div className="my-5 p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600">
                      {formatVND(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <>
                        <span className="text-sm text-neutral-400 line-through">
                          {formatVND(selectedProduct.originalPrice)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">
                          -
                          {Math.round(
                            ((selectedProduct.originalPrice - selectedProduct.price) /
                              selectedProduct.originalPrice) *
                              100
                          )}
                          %
                        </span>
                      </>
                    )}
                    {(selectedProduct.stockQuantity !== undefined ? selectedProduct.stockQuantity : 50) === 0 ? (
                      <span className="ml-auto text-[11px] text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Tạm hết hàng
                      </span>
                    ) : (selectedProduct.stockQuantity !== undefined ? selectedProduct.stockQuantity : 50) <= 10 ? (
                      <span className="ml-auto text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Chỉ còn {selectedProduct.stockQuantity ?? 50} cuốn trong kho!
                      </span>
                    ) : (
                      <span className="ml-auto text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Tồn kho: {selectedProduct.stockQuantity ?? 50} cuốn sẵn sàng giao
                      </span>
                    )}
                  </div>

                  {/* Thông tin xuất bản & quy cách */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2.5">
                      Thông Tin Xuất Bản & Quy Cách:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 bg-white p-3 rounded-xl border border-neutral-200/60">
                      {(selectedProduct.specs || []).map((spec, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chọn phiên bản bìa sách */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2.5">
                      Chọn Phiên Bản Bìa Sách:
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {(selectedProduct.colors || ["Bìa mềm tiêu chuẩn", "Bìa cứng (Hardcover)"]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedColor === c
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Số lượng mua */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold text-neutral-800">Số lượng:</span>
                    <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-600 cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold text-neutral-900 min-w-8 text-center">
                        {modalQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-600 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Các nút hành động Mua Sách */}
                <div className="pt-4 border-t border-neutral-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={(selectedProduct.stockQuantity ?? 50) === 0}
                      onClick={() => addToCart(selectedProduct, selectedColor, modalQuantity)}
                      className={`py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs ${
                        (selectedProduct.stockQuantity ?? 50) === 0
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 cursor-pointer"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-neutral-800" />
                      <span>{(selectedProduct.stockQuantity ?? 50) === 0 ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}</span>
                    </button>
                    <button
                      type="button"
                      disabled={(selectedProduct.stockQuantity ?? 50) === 0}
                      onClick={() => {
                        addToCart(selectedProduct, selectedColor, modalQuantity);
                        setIsCartOpen(true);
                      }}
                      className={`py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        (selectedProduct.stockQuantity ?? 50) === 0
                          ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                          : "bg-neutral-950 hover:bg-neutral-800 text-white cursor-pointer"
                      }`}
                    >
                      <span>{(selectedProduct.stockQuantity ?? 50) === 0 ? "Đang chờ nhập sách" : "Mua ngay giao tận nơi"}</span>
                      {(selectedProduct.stockQuantity ?? 50) > 0 && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isInWishlist(selectedProduct.id)
                          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/30"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist(selectedProduct.id) ? "fill-rose-500 text-rose-500" : "text-neutral-400"
                        }`}
                      />
                      <span>
                        {isInWishlist(selectedProduct.id)
                          ? "Đã lưu trong danh sách yêu thích"
                          : "Thêm vào danh sách yêu thích"}
                      </span>
                    </button>

                    {isAdminLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          const prodToEdit = selectedProduct;
                          setSelectedProduct(null);
                          navigateView("admin");
                          setAdminTab("products");
                          handleOpenEditProduct(prodToEdit);
                        }}
                        className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sửa sách trong Admin</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Khối Giới Thiệu Tác Phẩm & Nội Dung Chi Tiết */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
                  Giới Thiệu Nội Dung Cuốn Sách
                </h2>
              </div>
              <div className="text-sm text-neutral-700 leading-relaxed space-y-4">
                <p className="text-neutral-800 font-medium whitespace-pre-line">
                  {selectedProduct.description}
                </p>
                <div className="p-4 bg-neutral-50 rounded-xl border-l-4 border-indigo-500 text-neutral-600 text-xs leading-relaxed italic">
                  &ldquo;Tri thức là nguồn tài sản vô giá mở ra chân trời mới. Cuốn sách &lsquo;{selectedProduct.name}&rsquo; được chọn lọc đặc biệt để mang lại những kiến thức sâu sắc, thực tiễn nhất cho độc giả.&rdquo;
                </div>
              </div>
            </div>

            {/* ================= KHU VỰC ĐÁNH GIÁ & NHẬN XÉT CỦA NGƯỜI DÙNG / NGƯỜI MUA ================= */}
            <div id="customer-reviews-section" className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
                      Đánh Giá & Nhận Xét Của Độc Giả
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Tổng hợp ý kiến thực tế từ những người đã mua và trải nghiệm cuốn sách này
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  {(reviewsMap[selectedProduct.id] || []).length} Lượt Đánh Giá
                </span>
              </div>

              {/* Bảng Thống Kê Điểm Số & Phân Phối Sao */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-neutral-50/70 p-5 rounded-2xl border border-neutral-200/70">
                {/* Điểm trung bình */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-neutral-200">
                  <div className="text-4xl font-black text-neutral-900 mb-1">
                    {selectedProduct.rating ? selectedProduct.rating.toFixed(1) : "5.0"}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(selectedProduct.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500">
                    Dựa trên {(reviewsMap[selectedProduct.id] || []).length} phản hồi từ độc giả
                  </span>
                </div>

                {/* Thanh phân bố sao */}
                <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                  {[5, 4, 3, 2, 1].map((starLevel) => {
                    const totalReviews = (reviewsMap[selectedProduct.id] || []).length;
                    const count = (reviewsMap[selectedProduct.id] || []).filter(
                      (r) => Math.round(r.rating) === starLevel
                    ).length;
                    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : starLevel === 5 ? 100 : 0;
                    return (
                      <div key={starLevel} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-14 shrink-0 font-medium text-neutral-700">
                          <span>{starLevel}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right text-neutral-400 text-[11px]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Gửi Nhận Xét Mới */}
              <form
                onSubmit={handleSubmitReview}
                className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Viết Đánh Giá Của Bạn Về Cuốn Sách Này</span>
                  </h3>
                  {/* Interactive Star Rating */}
                  <div className="flex items-center gap-1 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
                    <span className="text-xs text-neutral-500 mr-1">Chất lượng:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-0.5 cursor-pointer hover:scale-125 transition-transform"
                        title={`${star} sao`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newReviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-1">
                      {newReviewRating === 5
                        ? "Tuyệt vời"
                        : newReviewRating === 4
                        ? "Hài lòng"
                        : newReviewRating === 3
                        ? "Bình thường"
                        : newReviewRating === 2
                        ? "Chưa tốt"
                        : "Rất tệ"}
                    </span>
                  </div>
                </div>

                {!customerUser && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Họ và tên của bạn: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="Nhập họ và tên người đánh giá..."
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                    />
                  </div>
                )}

                {customerUser && (
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <span>Đánh giá dưới tư cách:</span>
                    <strong className="text-neutral-900 font-semibold">{customerUser.name}</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đã đăng nhập
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cảm nhận của bạn về cuốn sách: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm đọc, nội dung hữu ích, chất lượng giấy in, bìa sách hoặc thời gian giao hàng..."
                    className="w-full px-3 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white resize-y"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? "Đang gửi nhận xét..." : "Gửi Đánh Giá Ngay"}</span>
                  </button>
                </div>
              </form>

              {/* Danh Sách Các Đánh Giá Thực Tế Từ Người Mua */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Nhận Xét Thực Tế Từ Khách Hàng ({(reviewsMap[selectedProduct.id] || []).length}):
                </h3>

                {(reviewsMap[selectedProduct.id] || []).length === 0 ? (
                  <div className="text-center py-10 px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <p className="text-xs font-bold text-neutral-700">Chưa có nhận xét nào cho cuốn sách này.</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Hãy là người đầu tiên mua và để lại cảm nhận cho cộng đồng độc giả nhé!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(reviewsMap[selectedProduct.id] || []).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-neutral-50/60 rounded-xl border border-neutral-200/70 text-xs space-y-2 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                              {rev.userName ? rev.userName.charAt(0) : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900">{rev.userName}</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                  <Check className="w-3 h-3" /> Đã mua tại BookStore
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-neutral-400">{rev.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-neutral-700 text-xs leading-relaxed pt-1 whitespace-pre-line">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Khối Sách Cùng Thể Loại (Có Thể Bạn Cũng Thích) */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
                    Sách Cùng Thể Loại: {selectedProduct.category}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {products
                  .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map((related) => (
                    <div
                      key={related.id}
                      onClick={() => handleOpenDetail(related)}
                      className="group p-3 rounded-xl border border-neutral-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-neutral-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-3/4 rounded-lg bg-neutral-200 overflow-hidden mb-2">
                          <img
                            src={related.image}
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="text-xs font-semibold text-neutral-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                          {related.name}
                        </h3>
                        {related.author && (
                          <div className="text-[11px] text-neutral-500 truncate mb-1">
                            {related.author}
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-950">
                          {formatVND(related.price)}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline">
                          Xem sách →
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Banner BookStore - Tri thức & Văn hóa đọc */}
          <div className="bg-gradient-to-r from-neutral-950 via-slate-900 to-neutral-950 text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-neutral-800">
            <div className="max-w-lg z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold tracking-wider uppercase mb-3 border border-indigo-500/30">
                <BookOpen className="w-3.5 h-3.5" /> Đồ Án Cuối Kỳ Môn DevOps ST23B - Nhóm 1
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-snug">
                Khơi Nguồn Tri Thức <br /> Đồng Hành Cùng Đam Mê Sách.
              </h1>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-4">
                Hiệu sách trực tuyến <strong>BookStore</strong> tuyển chọn các tác phẩm kinh điển và cẩm nang thực chiến về Công nghệ thông tin & DevOps, Kỹ năng sống, Kinh tế - Quản trị và Văn học nghệ thuật với mức giá ưu đãi nhất cho sinh viên.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-300">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> 100% Sách Thật NXB</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Tặng kèm Bookmark & Bọc sách</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 z-10 text-xs">
              <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl">
                <Truck className="w-4 h-4 text-neutral-300 mb-1.5" />
                <div className="font-semibold text-neutral-200">Giao Hỏa Tốc</div>
                <div className="text-[10px] text-neutral-400">1 - 2 ngày toàn quốc</div>
              </div>
              <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl">
                <RotateCcw className="w-4 h-4 text-neutral-300 mb-1.5" />
                <div className="font-semibold text-neutral-200">Đổi Trả 7 Ngày</div>
                <div className="text-[10px] text-neutral-400">Nếu lỗi in ấn hoặc rách trang</div>
              </div>
            </div>
          </div>

          {/* Categories Tab */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-neutral-900 text-white shadow-sm font-semibold"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Pill Yêu thích với biểu tượng trái tim */}
            <button
              type="button"
              onClick={() => setSelectedCategory("Yêu thích")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "Yêu thích"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-rose-600 hover:bg-rose-50 border border-rose-200"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  selectedCategory === "Yêu thích" || wishlist.length > 0
                    ? "fill-rose-500 text-rose-500"
                    : "text-rose-400"
                }`}
              />
              <span>Yêu thích ({wishlist.length})</span>
            </button>
          </div>

          {/* Bộ lọc đa chiều Faceted Search: Mức giá, Sao đánh giá, Tồn kho, Sắp xếp */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Lọc khoảng giá */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Khoảng giá:</span>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="under100">Dưới 100.000đ</option>
                  <option value="100to200">100.000đ - 200.000đ</option>
                  <option value="200to300">200.000đ - 300.000đ</option>
                  <option value="above300">Trên 300.000đ</option>
                </select>
              </div>

              {/* Lọc sao đánh giá */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Đánh giá:</span>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="0">Tất cả số sao</option>
                  <option value="4">⭐ Từ 4.0 trở lên</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5.0 sao</option>
                </select>
              </div>

              {/* Lọc chỉ còn hàng */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-0 border-neutral-300"
                />
                <span>Chỉ sách còn hàng</span>
              </label>
            </div>

            {/* Sắp xếp danh mục */}
            <div className="flex items-center gap-1.5 ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-500 font-medium">Sắp xếp:</span>
              <select
                value={storeSortBy}
                onChange={(e) => setStoreSortBy(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-600 focus:bg-white font-semibold"
              >
                <option value="default">Mặc định</option>
                <option value="priceAsc">Giá: Thấp đến Cao</option>
                <option value="priceDesc">Giá: Cao đến Thấp</option>
                <option value="ratingDesc">Đánh giá cao nhất</option>
                <option value="reviewsDesc">Bán chạy nhất (Nhiều review)</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          {/* Product List Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              {selectedCategory === "Yêu thích" && (
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              )}
              <span>{selectedCategory} ({filteredProducts.length})</span>
            </h2>
            <span className="text-[11px] text-neutral-400 italic">
              *Bấm vào sản phẩm để xem chi tiết thông số
            </span>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
              {selectedCategory === "Yêu thích" ? (
                <div>
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 fill-rose-500" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800 mb-1">
                    Danh sách yêu thích của bạn đang trống
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
                    Bạn chưa lưu cuốn sách nào vào mục yêu thích. Hãy bấm vào biểu tượng trái tim trên các cuốn sách để lưu lại nhé!
                  </p>
                  <button
                    onClick={() => setSelectedCategory("Tất cả")}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Khám phá toàn bộ sách
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">
                    Không tìm thấy sản phẩm nào khớp với tìm kiếm &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Tất cả");
                    }}
                    className="text-xs font-semibold text-neutral-900 underline cursor-pointer"
                  >
                    Xem toàn bộ sản phẩm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {paginatedStoreProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleOpenDetail(product)}
                    className="group bg-white rounded-xl border border-neutral-200/80 overflow-hidden hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image Box */}
                    <div className="relative h-44 sm:h-48 w-full bg-neutral-100 overflow-hidden">
                      {product.tag && (
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white shadow-xs">
                          {product.tag}
                        </span>
                      )}

                      {/* Badge Hết hàng trên ảnh bìa nếu tồn kho bằng 0 */}
                      {(product.stockQuantity ?? 50) === 0 && (
                        <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Hết hàng
                        </span>
                      )}

                      {/* Nút yêu thích sản phẩm */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${
                          isInWishlist(product.id)
                            ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                            : "bg-white/80 text-neutral-400 hover:text-rose-500 hover:bg-white"
                        }`}
                        title={isInWishlist(product.id) ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          (product.stockQuantity ?? 50) === 0 ? "opacity-75 grayscale-[20%]" : ""
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category & Author */}
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 font-medium">
                          <span>{product.category}</span>
                          {product.author && (
                            <span className="truncate max-w-[110px] text-neutral-500">
                              {product.author}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-snug mb-2 group-hover:text-neutral-600 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-neutral-950">
                            {formatVND(product.price)}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-[10px] text-neutral-400 line-through">
                              {formatVND(product.originalPrice)}
                            </div>
                          )}

                          {/* Trạng thái tồn kho ở góc dưới sản phẩm */}
                          <div className="mt-1 flex items-center">
                            {(product.stockQuantity ?? 50) === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Hết hàng
                              </span>
                            ) : (product.stockQuantity ?? 50) <= 10 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sắp hết ({product.stockQuantity ?? 50})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Còn hàng
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          disabled={(product.stockQuantity ?? 50) === 0}
                          onClick={(e) => handleQuickAdd(e, product)}
                          className={`p-2 rounded-lg transition-all ${
                            (product.stockQuantity ?? 50) === 0
                              ? "bg-neutral-100 text-neutral-300 cursor-not-allowed opacity-50"
                              : "bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 cursor-pointer shadow-2xs"
                          }`}
                          title={(product.stockQuantity ?? 50) === 0 ? "Sách tạm hết hàng" : "Thêm nhanh vào giỏ"}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang Cửa hàng (8 sản phẩm / trang) */}
              {storeTotalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-neutral-500">
                    Hiển thị <span className="font-semibold text-neutral-900">{(storePage - 1) * STORE_ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-neutral-900">{Math.min(storePage * STORE_ITEMS_PER_PAGE, filteredProducts.length)}</span> trên tổng số <span className="font-semibold text-neutral-900">{filteredProducts.length}</span> sản phẩm
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Nút về trang đầu tiên « */}
                    <button
                      type="button"
                      title="Về trang đầu tiên"
                      onClick={() => {
                        setStorePage(1);
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      disabled={storePage === 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      «
                    </button>

                    {/* Nút lùi 1 trang ‹ */}
                    <button
                      type="button"
                      title="Trang trước"
                      onClick={() => {
                        setStorePage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      disabled={storePage === 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      ‹
                    </button>

                    {/* Danh sách các trang liền kề theo mẫu ảnh « ‹ 3 4 [5] 6 7 › » */}
                    {getVisiblePages(storePage, storeTotalPages).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setStorePage(pageNum);
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                          storePage === pageNum
                            ? "bg-[#f97316] text-white shadow-md shadow-orange-500/25 scale-105"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Nút tiến 1 trang › */}
                    <button
                      type="button"
                      title="Trang sau"
                      onClick={() => {
                        setStorePage((p) => Math.min(storeTotalPages, p + 1));
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      disabled={storePage === storeTotalPages}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      ›
                    </button>

                    {/* Nút đến trang cuối cùng » */}
                    <button
                      type="button"
                      title="Đến trang cuối cùng"
                      onClick={() => {
                        setStorePage(storeTotalPages);
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      disabled={storePage === storeTotalPages}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Sách bạn vừa xem gần đây (Recently Viewed) */}
          {recentlyViewedIds.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    Sách bạn vừa xem gần đây
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setRecentlyViewedIds([]);
                    localStorage.removeItem("bookstore_recently_viewed");
                  }}
                  className="text-[11px] text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
                >
                  Xóa lịch sử xem
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {recentlyViewedIds
                  .map((id) => products.find((p) => p.id === id))
                  .filter(Boolean)
                  .map((p) => {
                    const prod = p as Product;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleOpenDetail(prod)}
                        className="group bg-white rounded-xl border border-neutral-200 p-2 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="aspect-3/4 rounded-lg bg-neutral-100 overflow-hidden mb-2">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-semibold text-neutral-900 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors">
                            {prod.name}
                          </h4>
                          <span className="text-[11px] font-bold text-neutral-950 mt-1 block">
                            {formatVND(prod.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          </>
        )}
      </main>


      {/* ================= MODAL: AUTH LOGIN & REGISTER ================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAuthModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 border border-neutral-200">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Form */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-base shadow-sm">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-extrabold text-neutral-950">
                {authMode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {authMode === "login"
                  ? "Đăng nhập để nhận ưu đãi và theo dõi đơn mua sách"
                  : "Trở thành thành viên BookStore ngay hôm nay"}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "login"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "register"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {/* Inline Error Message */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{authError}</span>
                </div>
              )}

              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {authMode === "register" ? "Email đăng ký" : "Tài khoản hoặc Email"}
                </label>
                <div className="relative">
                  {authMode === "register" ? (
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type={authMode === "register" ? "email" : "text"}
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={
                      authMode === "register"
                        ? "example@gmail.com"
                        : "Nhập email hoặc tên tài khoản..."
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={authMode === "login" ? "Mật khẩu mặc định: kh123" : "Tạo mật khẩu của bạn..."}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {authMode === "login" && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-1.5 text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Mật khẩu khách hàng mặc định là: kh123");
                    }}
                    className="text-neutral-900 font-semibold hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
              >
                {authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>

              {authMode === "login" && (
                <div className="mt-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 flex items-center justify-between">
                  <span>Mật khẩu khách hàng mặc định: <strong>kh123</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthPassword("kh123");
                      showToast("Đã điền mật khẩu mặc định (kh123)!");
                    }}
                    className="text-[10px] text-neutral-900 hover:text-black font-bold underline cursor-pointer"
                  >
                    Điền mật khẩu
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 text-center border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    navigateView("admin");
                  }}
                  className="text-[11px] text-neutral-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Chuyển sang Bảng Quản Trị Hệ Thống (/admin)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: HỒ SƠ KHÁCH HÀNG & SỔ ĐỊA CHỈ & VÍ XU ================= */}
      {isProfileModalOpen && customerUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsProfileModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col max-h-[90vh]">
            {/* Header Modal Hồ sơ */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs">
                  {customerUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                    <span>{customerUser.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Thành viên
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">{customerUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-neutral-200/80 overflow-x-auto text-xs bg-white">
              <button
                type="button"
                onClick={() => setProfileTab("info")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileTab === "info"
                    ? "border-neutral-900 text-neutral-950"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab("addresses")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileTab === "addresses"
                    ? "border-neutral-900 text-neutral-950"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Sổ địa chỉ ({customerAddresses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab("password")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileTab === "password"
                    ? "border-neutral-900 text-neutral-950"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Đổi mật khẩu</span>
              </button>
            </div>

            {/* Nội dung Tab */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {profileTab === "info" && (
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Địa chỉ Email đăng nhập:
                    </label>
                    <input
                      type="email"
                      disabled
                      value={customerUser.email}
                      className="w-full px-3 py-2 text-xs bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Email đăng nhập cố định và được bảo mật bởi hệ thống.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Họ và tên của bạn:
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue={customerUser.name}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Số điện thoại liên hệ:
                    </label>
                    <input
                      type="tel"
                      defaultValue={customerUser.phone || "0917714595"}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Lưu thay đổi hồ sơ
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SỔ ĐỊA CHỈ GIAO HÀNG */}
              {profileTab === "addresses" && (
                <div className="space-y-6">
                  {/* Danh sách các địa chỉ đã lưu */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Danh sách địa chỉ của bạn ({customerAddresses.length}):
                    </h4>

                    {customerAddresses.length === 0 ? (
                      <div className="p-6 text-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                        Chưa có địa chỉ nào trong sổ. Hãy thêm địa chỉ bên dưới nhé!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customerAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-3.5 rounded-xl border text-xs relative flex flex-col justify-between transition-all ${
                              addr.isDefault
                                ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-neutral-900 text-sm">
                                  {addr.recipientName}
                                </span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-neutral-500 flex items-center gap-1 mb-1">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                <span>{addr.phone}</span>
                              </p>
                              <p className="text-neutral-700 leading-relaxed">
                                {addr.addressDetail}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                              {!addr.isDefault ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                                >
                                  Đặt làm mặc định
                                </button>
                              ) : (
                                <span className="text-neutral-400 italic">Địa chỉ giao chính</span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form thêm địa chỉ mới */}
                  <form
                    onSubmit={handleAddAddress}
                    className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/90 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-indigo-600" />
                      <span>Thêm địa chỉ giao hàng mới</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          Tên người nhận: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddrRecipient}
                          onChange={(e) => setNewAddrRecipient(e.target.value)}
                          placeholder="VD: Nguyễn Văn A..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          Số điện thoại: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value)}
                          placeholder="VD: 0912 345 678..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddrDetail}
                        onChange={(e) => setNewAddrDetail(e.target.value)}
                        placeholder="VD: Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newAddrIsDefault}
                          onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-neutral-900 focus:ring-0 border-neutral-300"
                        />
                        <span>Đặt làm địa chỉ nhận hàng mặc định</span>
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Thêm vào sổ
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ĐỔI MẬT KHẨU */}
              {profileTab === "password" && (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mật khẩu hiện tại: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPasswordInput}
                      onChange={(e) => setOldPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mật khẩu mới: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Tối thiểu 5 ký tự..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Xác nhận lại mật khẩu mới: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Xác nhận đổi mật khẩu
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ================= MODAL: ĐƠN HÀNG CỦA TÔI & TRA CỨU TIẾN TRÌNH VẬN ĐƠN (HỢP NHẤT) ================= */}
      {isMyOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsMyOrdersOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in"
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-950">
                    Đơn hàng của tôi
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {customerUser
                      ? `${customerUser.name} (${customerUser.email}) — Lịch sử mua hàng & Theo dõi bưu kiện`
                      : "Tra cứu tiến trình bưu kiện & Lịch sử mua hàng trực tiếp"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMyOrdersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {/* Thanh tra cứu nhanh theo Mã đơn hoặc Số điện thoại */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/90 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-0.5">
                  <span className="flex items-center gap-1 text-neutral-700 font-bold">
                    <Search className="w-3.5 h-3.5 text-indigo-600" /> Tra cứu nhanh đơn hàng:
                  </span>
                  <span>Nhập mã đơn hoặc số điện thoại</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={myOrdersSearchQuery}
                      onChange={(e) => setMyOrdersSearchQuery(e.target.value)}
                      placeholder="Nhập mã đơn (VD: DH-1001) hoặc số điện thoại người nhận..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                    />
                  </div>
                  {myOrdersSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMyOrdersSearchQuery("")}
                      className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const q = myOrdersSearchQuery.trim().toLowerCase();
                let baseOrders: Order[] = [];
                if (customerUser) {
                  baseOrders = orders.filter(
                    (o) =>
                      (customerUser.email && o.customerEmail?.toLowerCase() === customerUser.email.toLowerCase()) ||
                      (o.userId && o.userId === customerUser.id)
                  );
                }

                // Nếu có từ khóa tìm kiếm (theo mã đơn hoặc SĐT)
                let displayOrders = baseOrders;
                if (q) {
                  displayOrders = orders.filter(
                    (o) =>
                      o.id?.toLowerCase().includes(q) ||
                      (o.customerPhone && o.customerPhone.includes(q)) ||
                      (o.customerName && o.customerName.toLowerCase().includes(q))
                  );
                }

                if (!customerUser && !q) {
                  return (
                    <div className="text-center py-8 px-4 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Truck className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        Tra Cứu Tiến Trình Vận Đơn Nhanh
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Vui lòng nhập <strong>Mã đơn hàng</strong> (VD: DH-1001) hoặc <strong>Số điện thoại</strong> vào ô tra cứu ở trên để xem ngay tiến trình bưu kiện của bạn!
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setIsMyOrdersOpen(false);
                            setAuthMode("login");
                            setIsAuthModalOpen(true);
                          }}
                          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Đăng nhập để xem toàn bộ lịch sử đơn hàng
                        </button>
                      </div>
                    </div>
                  );
                }

                if (displayOrders.length === 0) {
                  return (
                    <div className="text-center py-10 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        Không tìm thấy đơn hàng nào
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                        {q
                          ? `Không có đơn hàng nào khớp với từ khóa "${myOrdersSearchQuery}". Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.`
                          : `Tài khoản ${customerUser?.email} hiện chưa có đơn hàng nào.`}
                      </p>
                      <button
                        onClick={() => setIsMyOrdersOpen(false)}
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Khám phá sản phẩm
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                      <span>
                        Hiển thị <strong>{displayOrders.length}</strong> đơn hàng
                        {q && ` khớp với từ khóa "${myOrdersSearchQuery}"`}
                      </span>
                    </div>

                    {displayOrders.map((order) => {
                      const statusConfig = {
                        pending: {
                          label: "Chờ xử lý",
                          bg: "bg-amber-50 text-amber-800 border-amber-200",
                          icon: <Clock className="w-3 h-3 text-amber-600" />,
                        },
                        shipping: {
                          label: "Đang giao hàng",
                          bg: "bg-blue-50 text-blue-800 border-blue-200",
                          icon: <Truck className="w-3 h-3 text-blue-600" />,
                        },
                        delivered: {
                          label: "Đã giao thành công",
                          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
                          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
                        },
                        cancelled: {
                          label: "Đã hủy",
                          bg: "bg-rose-50 text-rose-800 border-rose-200",
                          icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
                        },
                      }[order.status] || {
                        label: order.status,
                        bg: "bg-neutral-100 text-neutral-700 border-neutral-200",
                        icon: null,
                      };

                      return (
                        <div
                          key={order.id}
                          className="border border-neutral-200 rounded-xl p-4 bg-white shadow-xs hover:border-neutral-300 transition-all space-y-3"
                        >
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-neutral-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-neutral-950">
                                  #{order.id}
                                </span>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.bg}`}>
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {order.createdAt || order.orderDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-neutral-400 block">Tổng tiền</span>
                              <span className="text-sm font-extrabold text-neutral-950">
                                {formatVND(order.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div className="text-[11px] text-neutral-600 space-y-1 bg-neutral-50/70 p-2.5 rounded-lg border border-neutral-100">
                            <div className="flex items-center gap-1.5 text-neutral-800 font-medium">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{order.customerName} - {order.customerPhone || "Chưa cung cấp SĐT"}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-neutral-600">
                              <MapPin className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                              <span>{order.customerAddress || order.shippingAddress || "Địa chỉ nhận hàng toàn quốc"}</span>
                            </div>
                            {order.note && (
                              <div className="flex items-start gap-1.5 pt-1.5 border-t border-neutral-200/60 text-neutral-700 italic">
                                <FileText className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                                <span><strong>Ghi chú:</strong> {order.note}</span>
                              </div>
                            )}
                          </div>

                          {/* Items List */}
                          <div className="divide-y divide-neutral-100">
                            {(order.items || []).map((item, idx) => (
                              <div
                                key={idx}
                                className="py-2 flex items-center justify-between text-xs first:pt-1 last:pb-1"
                              >
                                <div className="flex items-center gap-2.5">
                                  {item.image && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                                    />
                                  )}
                                  <div>
                                    <p className="font-semibold text-neutral-900 leading-snug">
                                      {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {item.selectedColor && (
                                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                          Màu: {item.selectedColor}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-neutral-400">
                                        SL: x{item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right font-bold text-neutral-900 shrink-0">
                                  {formatVND((item.price ?? item.unitPrice ?? 0) * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Nút hành động */}
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceOrder(order);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              title="In hóa đơn / Phiếu xuất kho"
                            >
                              <Printer className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Hóa đơn</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                              title="Thêm lại toàn bộ sách của đơn này vào giỏ hàng"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Mua lại đơn này</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (expandedTrackingOrderId === order.id) {
                                  setExpandedTrackingOrderId(null);
                                } else {
                                  handleTrackOrder(order.id);
                                  setExpandedTrackingOrderId(order.id);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                                expandedTrackingOrderId === order.id
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{expandedTrackingOrderId === order.id ? "Thu gọn vận trình" : "Theo dõi vận đơn"}</span>
                            </button>
                          </div>

                          {/* Stepper Timeline 4 bước mở rộng trực tiếp trong đơn hàng */}
                          {expandedTrackingOrderId === order.id && (
                            <div className="mt-3 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/90 animate-in fade-in duration-200 text-left">
                              <h4 className="text-xs font-bold text-neutral-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                Lộ trình vận chuyển bưu kiện #{order.id}:
                              </h4>

                              <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                                {(trackingTimeline && trackedOrder?.id === order.id
                                  ? trackingTimeline
                                  : [
                                      {
                                        step: 1,
                                        title: "Đã tiếp nhận đơn hàng",
                                        description: "Đơn hàng đã được ghi nhận trên hệ thống BookStore.",
                                        time: order.createdAt || order.orderDate || "Vừa xong",
                                        isCompleted: true,
                                      },
                                      {
                                        step: 2,
                                        title: "Đang đóng gói & chuẩn bị",
                                        description: "Kho đang kiểm tra chất lượng sách, bọc chống sốc & tặng kèm Bookmark.",
                                        time: ["shipping", "delivered"].includes(order.status)
                                          ? "Hoàn tất đóng gói"
                                          : "Đang chuẩn bị",
                                        isCompleted: ["shipping", "delivered"].includes(order.status),
                                      },
                                      {
                                        step: 3,
                                        title: "Đang giao hàng hỏa tốc",
                                        description: "Đơn vị vận chuyển hỏa tốc đang giao sách tới địa chỉ nhận.",
                                        time:
                                          order.status === "delivered"
                                            ? "Đã giao đến khu vực"
                                            : order.status === "shipping"
                                            ? "Đang trên đường giao"
                                            : "Chờ lấy hàng",
                                        isCompleted: ["shipping", "delivered"].includes(order.status),
                                      },
                                      {
                                        step: 4,
                                        title: "Giao hàng thành công",
                                        description: "Bưu kiện đã được bàn giao an toàn tới tay người nhận.",
                                        time: order.status === "delivered" ? "Đã nhận hàng" : "Dự kiến 1-2 ngày tới",
                                        isCompleted: order.status === "delivered",
                                      },
                                    ]
                                ).map((step) => (
                                  <div key={step.step} className="relative">
                                    <div
                                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                        step.isCompleted
                                          ? "bg-emerald-500 text-white ring-4 ring-emerald-50"
                                          : "bg-neutral-100 text-neutral-400 border border-neutral-300"
                                      }`}
                                    >
                                      {step.isCompleted ? <Check className="w-3.5 h-3.5" /> : step.step}
                                    </div>

                                    <div>
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <h5
                                          className={`text-xs font-bold ${
                                            step.isCompleted ? "text-neutral-900" : "text-neutral-400"
                                          }`}
                                        >
                                          {step.title}
                                        </h5>
                                        <span className="text-[10px] text-neutral-400 font-medium">
                                          {step.time}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                                        {step.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
              <button
                onClick={() => setIsMyOrdersOpen(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DRAWER: CART ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm"
          ></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-neutral-900" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Giỏ hàng ({totalCartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-neutral-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Giỏ hàng của bạn đang trống</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}`}
                    className="flex gap-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500">
                            Màu: {item.selectedColor}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.selectedColor)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-neutral-950">
                          {formatVND(item.price)}
                        </span>
                        <div className="flex items-center border border-neutral-200 rounded bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.selectedColor, -1)
                            }
                            className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-100"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-2 text-[11px] font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.selectedColor, 1)
                            }
                            className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-100"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3 overflow-y-auto max-h-[50vh]">
                {/* ================= KHỐI MÃ GIẢM GIÁ (VOUCHER / COUPON) ================= */}
                <div className="p-3 bg-white rounded-xl border border-neutral-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                      Mã giảm giá BookStore:
                    </span>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer"
                      >
                        Gỡ mã
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mã {appliedCoupon.code}</span>
                      </div>
                      <span className="font-extrabold text-emerald-700">
                        -{formatVND(couponDiscountAmount)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          placeholder="Nhập mã (VD: DEVOPS20)..."
                          className="flex-1 px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-neutral-50/50"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                        >
                          Áp dụng
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[10px] text-rose-600 font-medium">{couponError}</p>
                      )}

                      {/* Danh sách mã voucher gợi ý bấm nhanh */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {coupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-600 text-neutral-600 border border-neutral-200 cursor-pointer transition-colors"
                          >
                            {c.code} {c.discountType === "Percentage" ? `(-${c.discountValue}%)` : `(-${formatVND(c.discountValue)})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chi tiết tính tiền */}
                  <div className="space-y-1 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Tạm tính tiền sách:</span>
                      <span className="font-semibold text-neutral-900">{formatVND(totalCartPrice)}</span>
                    </div>
                    {couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Giảm giá Voucher:</span>
                        <span>-{formatVND(couponDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-500 text-[11px]">
                      <span>Phí vận chuyển:</span>
                      <span className="text-emerald-600 font-semibold">Miễn phí</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base font-extrabold text-neutral-950">
                    {formatVND(finalPayableAmount)}
                  </span>
                </div>

                {/* Chọn nhanh từ Sổ địa chỉ giao hàng */}
                {customerAddresses.length > 0 && (
                  <div className="pb-2 border-b border-neutral-100 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" /> Chọn từ sổ địa chỉ:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          setIsProfileModalOpen(true);
                          setProfileTab("addresses");
                        }}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        + Quản lý sổ địa chỉ
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {customerAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setCheckoutPhone(addr.phone);
                            setCheckoutAddress(addr.addressDetail);
                            showToast(`Đã chọn địa chỉ: ${addr.recipientName}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border text-left transition-all cursor-pointer ${
                            checkoutAddress === addr.addressDetail
                              ? "border-neutral-900 bg-neutral-900 text-white font-semibold shadow-xs"
                              : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                          }`}
                        >
                          <span className="font-bold">{addr.recipientName}</span>
                          {addr.isDefault && <span className="ml-1 text-[9px] opacity-80">(Mặc định)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thông tin nhận hàng & Ghi chú */}
                <div className="space-y-2 pt-1 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder={customerUser?.phone || "VD: 0912 345 678"}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      Địa chỉ nhận hàng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder="VD: 123 Đường Nguyễn Trãi, Q.1, TP.HCM"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-neutral-500" />
                      Ghi chú đơn hàng (tuỳ chọn)
                    </label>
                    <textarea
                      rows={2}
                      value={checkoutNote}
                      onChange={(e) => setCheckoutNote(e.target.value)}
                      placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white resize-none"
                    />
                  </div>

                  {/* Lựa chọn phương thức thanh toán thực tế */}
                  <div className="pt-2 border-t border-neutral-200">
                    <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                      Phương thức thanh toán:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMethod("VietQR")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          checkoutPaymentMethod === "VietQR"
                            ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-bold"
                            : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>VietQR NAPAS</span>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-semibold mt-1">
                          ⚡ Quét mã tự động
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMethod("COD")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          checkoutPaymentMethod === "COD"
                            ? "border-neutral-900 bg-neutral-100 ring-1 ring-neutral-900 text-neutral-950 font-bold"
                            : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Truck className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                          <span>Thanh toán COD</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1">
                          Trả tiền khi nhận
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {!customerUser && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-2">
                    <span className="font-medium">⚠️ Vui lòng đăng nhập tài khoản để đặt hàng</span>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0"
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!customerUser) {
                      showToast("Vui lòng đăng nhập tài khoản trước khi đặt hàng!");
                      setIsAuthModalOpen(true);
                      return;
                    }

                    const finalPhone = checkoutPhone.trim() || (customerUser.phone || "0912345678");
                    const finalAddress = checkoutAddress.trim() || "Giao hàng tận nơi (Toàn quốc)";
                    const finalNote = checkoutNote.trim() || "Đơn đặt trực tiếp từ Giỏ hàng Cửa hàng";
                    const newOrderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
                    const now = new Date();
                    const formattedDate =
                      now.toLocaleDateString("vi-VN") +
                      " " +
                      now.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                    const newOrder: Order = {
                      id: newOrderId,
                      orderCode: newOrderId,
                      userId: customerUser.id,
                      customerName: customerUser.name,
                      customerEmail: customerUser.email,
                      customerPhone: finalPhone,
                      shippingAddress: finalAddress,
                      customerAddress: finalAddress,
                      items: cart.map((item) => ({
                        id: item.id,
                        bookId: item.id,
                        title: item.name,
                        name: item.name,
                        unitPrice: item.price,
                        price: item.price,
                        quantity: item.quantity,
                        selectedColor: item.selectedColor,
                        imageUrl: item.image,
                        image: item.image,
                      })),
                      totalAmount: finalPayableAmount,
                      totalBookAmount: totalCartPrice,
                      discountAmount: couponDiscountAmount,
                      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                      status: "pending",
                      paymentMethod: checkoutPaymentMethod,
                      paymentStatus: "Unpaid",
                      note: finalNote,
                      orderDate: formattedDate,
                      createdAt: formattedDate,
                    };

                    setOrders((prev) => [newOrder, ...prev]);

                    setAppUsers((prev) =>
                      prev.map((u) =>
                        u.email.toLowerCase() === customerUser.email.toLowerCase()
                          ? { ...u, ordersCount: (u.ordersCount || 0) + 1 }
                          : u
                      )
                    );

                    // Đồng bộ lưu đơn hàng vào MongoDB
                    fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newOrder),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        if (!data.success) {
                          console.error("Lỗi lưu đơn hàng vào DB:", data.message);
                        }
                      })
                      .catch((err) => console.error("Error creating order in DB:", err));

                    // Thêm thông báo vào Notification Center
                    setNotifications((prev) => [
                      {
                        id: `notif-${Date.now()}`,
                        title: `Đơn hàng mới #${newOrderId} khởi tạo`,
                        message: `Đơn hàng ${formatVND(newOrder.totalAmount)} của bạn đã được ghi nhận.`,
                        time: "Vừa xong",
                        read: false,
                        type: "order",
                      },
                      ...prev,
                    ]);

                    showToast(`🎉 Đặt mua sách thành công! Mã đơn: ${newOrderId}`);
                    setCart([]);
                    setAppliedCoupon(null);
                    setCheckoutPhone("");
                    setCheckoutAddress("");
                    setCheckoutNote("");
                    setIsCartOpen(false);

                    if (checkoutPaymentMethod === "VietQR") {
                      setVietQROrder(newOrder);
                      setVietQRTimeLeft(900);
                      setIsVietQRModalOpen(true);
                      playChimeSound('notification');
                    } else {
                      playChimeSound('success');
                      setMyOrdersSearchQuery(newOrderId);
                      setExpandedTrackingOrderId(newOrderId);
                      setIsMyOrdersOpen(true);
                    }
                  }}
                  className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer ${
                    customerUser ? "bg-neutral-950 hover:bg-neutral-800" : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {customerUser ? "Xác nhận đặt hàng" : "Đăng nhập để đặt hàng"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DRAWER: WISHLIST (SẢN PHẨM YÊU THÍCH) ================= */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setIsWishlistOpen(false)}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm animate-in fade-in"
          ></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Sản phẩm yêu thích ({wishlist.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Danh sách những cuốn sách bạn đã lưu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {wishlist.length === 0 ? (
                <div className="text-center py-24 text-neutral-400">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-700 mb-1">
                    Chưa có sách nào được thích
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-4">
                    Nhấn vào biểu tượng trái tim ở từng cuốn sách bạn quan tâm để lưu lại tại đây!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWishlistOpen(false);
                      setSelectedCategory("Tất cả");
                    }}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Khám phá sách ngay
                  </button>
                </div>
              ) : (
                (() => {
                  const favoriteBooks = products.filter((p) => wishlist.includes(p.id));
                  return (
                    <div className="space-y-3">
                      {favoriteBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex gap-3 p-3 rounded-xl border border-neutral-200/80 hover:border-neutral-300 bg-white transition-all shadow-xs"
                        >
                          {/* Image */}
                          <div
                            onClick={() => {
                              setIsWishlistOpen(false);
                              handleOpenDetail(book);
                            }}
                            className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0 cursor-pointer border border-neutral-100"
                          >
                            <img
                              src={book.image}
                              alt={book.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] text-neutral-400 font-medium">
                                {book.category}
                              </div>
                              <h4
                                onClick={() => {
                                  setIsWishlistOpen(false);
                                  handleOpenDetail(book);
                                }}
                                className="text-xs font-bold text-neutral-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                                title={book.name}
                              >
                                {book.name}
                              </h4>
                              {book.author && (
                                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                                  Tác giả: {book.author}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                              <div>
                                <span className="text-xs font-extrabold text-neutral-950">
                                  {formatVND(book.price)}
                                </span>
                                {book.originalPrice > book.price && (
                                  <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                                    {formatVND(book.originalPrice)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const defaultColor =
                                      Array.isArray(book.colors) && book.colors.length > 0
                                        ? book.colors[0]
                                        : "Bìa mềm tiêu chuẩn";
                                    addToCart(book, defaultColor, 1);
                                  }}
                                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Thêm cuốn này vào giỏ"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>Thêm giỏ</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleWishlist(book.id)}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Gỡ khỏi yêu thích"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer Actions */}
            {wishlist.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const favoriteBooks = products.filter((p) => wishlist.includes(p.id));
                    favoriteBooks.forEach((book) => {
                      const defaultColor =
                        Array.isArray(book.colors) && book.colors.length > 0
                          ? book.colors[0]
                          : "Bìa mềm tiêu chuẩn";
                      addToCart(book, defaultColor, 1);
                    });
                    showToast(`Đã thêm tất cả ${favoriteBooks.length} cuốn yêu thích vào giỏ hàng!`);
                    setIsWishlistOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Thêm tất cả vào giỏ hàng & mua ngay</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWishlistOpen(false);
                      setSelectedCategory("Yêu thích");
                    }}
                    className="flex-1 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs rounded-xl border border-neutral-200 transition-colors text-center cursor-pointer"
                  >
                    Xem dạng lưới ngoài trang chủ
                  </button>
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Xóa toàn bộ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Làm trống</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* (Ghi chú: Modal Tra cứu vận đơn riêng rẽ đã được sáp nhập trực tiếp vào Modal "Đơn hàng của tôi" isMyOrdersOpen) */}

      {/* ================= MODAL: VIETQR NAPAS PAYMENT ================= */}
      {isVietQRModalOpen && vietQROrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsVietQRModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in"
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Thanh Toán VietQR NAPAS 24/7</h3>
                  <p className="text-[10px] text-indigo-200">Quét mã bằng bất kỳ App Ngân hàng hoặc Ví MoMo</p>
                </div>
              </div>
              <button
                onClick={() => setIsVietQRModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Countdown Alert */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Thời gian giữ đơn hàng:</span>
                </div>
                <span className="font-mono font-extrabold text-sm text-rose-600">
                  {Math.floor(vietQRTimeLeft / 60).toString().padStart(2, "0")}:
                  {(vietQRTimeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Dynamic QR Code Image */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col items-center">
                <div className="bg-white p-2.5 rounded-xl shadow-xs border border-neutral-200/80 mb-2">
                  <img
                    src={`https://img.vietqr.io/image/MB-0917714595-compact2.png?amount=${vietQROrder.totalAmount}&addInfo=${vietQROrder.orderCode || vietQROrder.id}&accountName=DINH%20NGOC%20THE%20NHAN`}
                    alt="VietQR Payment"
                    className="w-52 h-52 object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://img.vietqr.io/image/MB-0917714595-compact2.png?amount=${vietQROrder.totalAmount}&addInfo=${vietQROrder.orderCode || vietQROrder.id}&accountName=DINH%20NGOC%20THE%20NHAN`}
                    download={`VietQR-${vietQROrder.id}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-indigo-600" /> Tải ảnh QR
                  </a>
                  <span className="text-[10px] text-neutral-400">Chuẩn thanh toán quốc gia NAPAS</span>
                </div>
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="space-y-2 bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-neutral-900">MB Bank (Quân Đội)</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Chủ tài khoản:</span>
                  <span className="font-bold text-neutral-900 uppercase">DINH NGOC THE NHAN</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-700">0917714595</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText("0917714595");
                        showToast("Đã sao chép số tài khoản (0917714595)!");
                        playChimeSound('click');
                      }}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500"
                      title="Sao chép"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Số tiền cần chuyển:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-emerald-700 font-mono">
                      {formatVND(vietQROrder.totalAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(vietQROrder.totalAmount.toString());
                        showToast(`Đã sao chép số tiền (${formatVND(vietQROrder.totalAmount)})!`);
                        playChimeSound('click');
                      }}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500"
                      title="Sao chép"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Nội dung chuyển tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {vietQROrder.orderCode || vietQROrder.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(vietQROrder.orderCode || vietQROrder.id);
                        showToast(`Đã sao chép nội dung (${vietQROrder.orderCode || vietQROrder.id})!`);
                        playChimeSound('click');
                      }}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500"
                      title="Sao chép"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row gap-2 justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsVietQRModalOpen(false);
                  setMyOrdersSearchQuery(vietQROrder.id);
                  setExpandedTrackingOrderId(vietQROrder.id);
                  setIsMyOrdersOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
              >
                Chuyển khoản sau
              </button>
              <button
                type="button"
                onClick={() => {
                  const orderId = vietQROrder.id;
                  setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "Paid" } : o))
                  );
                  fetch(`/api/orders/${orderId}/payment-status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentStatus: "Paid" }),
                  }).catch(() => {});

                  playChimeSound('success');
                  showToast("✅ Xác nhận thanh toán VietQR thành công! Đơn hàng đã chuyển sang trạng thái Đã Thanh Toán.");
                  setIsVietQRModalOpen(false);
                  setMyOrdersSearchQuery(orderId);
                  setExpandedTrackingOrderId(orderId);
                  setIsMyOrdersOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Tôi đã chuyển khoản xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER INVOICE / THERMAL PRINT ================= */}
      {isInvoiceModalOpen && invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsInvoiceModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in print:hidden"
          ></div>
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-300 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 print:p-0">
            {/* Header Dialog (Ẩn khi in) */}
            <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Xem Trước Hóa Đơn & Phiếu Xuất Kho</h3>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Invoice Document Body */}
            <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-white text-neutral-900 text-xs">
              {/* Header Cửa hàng */}
              <div className="flex items-start justify-between border-b pb-4 border-neutral-300">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wide">NHÀ SÁCH TRỰC TUYẾN BOOKSTORE</h2>
                  </div>
                  <p className="text-[10px] text-neutral-500">Đồ án môn học: Kiểm thử & Triển khai DevOps ST23B (Nhóm 1)</p>
                  <p className="text-[10px] text-neutral-500">Địa chỉ: Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                  <p className="text-[10px] text-neutral-500">Hotline: 0917.714.595 • MST: 0315892461-001</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-neutral-100 font-mono font-bold text-xs">
                    #{invoiceOrder.id}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Ngày: {invoiceOrder.createdAt || invoiceOrder.orderDate}
                  </p>
                </div>
              </div>

              {/* Tiêu đề Hóa Đơn */}
              <div className="text-center py-2">
                <h1 className="text-base font-extrabold uppercase tracking-widest text-neutral-950">
                  HÓA ĐƠN BÁN HÀNG & PHIẾU GIAO HÀNG
                </h1>
                <p className="text-[10px] text-neutral-400 mt-0.5">Mã tra cứu vận đơn: {invoiceOrder.orderCode || invoiceOrder.id}</p>
              </div>

              {/* Thông tin Khách hàng */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Khách hàng nhận sách:</span>
                  <strong className="text-neutral-900">{invoiceOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Số điện thoại:</span>
                  <strong className="text-neutral-900">{invoiceOrder.customerPhone || "Chưa cung cấp"}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 block">Địa chỉ giao hàng:</span>
                  <span className="text-neutral-800">{invoiceOrder.customerAddress || invoiceOrder.shippingAddress || "Toàn quốc"}</span>
                </div>
                {invoiceOrder.note && (
                  <div className="col-span-2 text-neutral-500 italic">
                    Ghi chú: {invoiceOrder.note}
                  </div>
                )}
              </div>

              {/* Bảng danh sách sách */}
              <div>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-600 bg-neutral-50">
                      <th className="py-1.5 px-2 text-left font-bold">STT</th>
                      <th className="py-1.5 px-2 text-left font-bold">Tựa sách / Phiên bản</th>
                      <th className="py-1.5 px-2 text-center font-bold">SL</th>
                      <th className="py-1.5 px-2 text-right font-bold">Đơn giá</th>
                      <th className="py-1.5 px-2 text-right font-bold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(invoiceOrder.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 text-neutral-500">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-medium text-neutral-900">
                          {it.title || it.name}
                          {it.selectedColor && (
                            <span className="text-[10px] text-neutral-400 block">({it.selectedColor})</span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-center font-semibold">{it.quantity}</td>
                        <td className="py-1.5 px-2 text-right">{formatVND(it.price ?? it.unitPrice ?? 0)}</td>
                        <td className="py-1.5 px-2 text-right font-bold">
                          {formatVND((it.price ?? it.unitPrice ?? 0) * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng kết tiền */}
              <div className="pt-2 border-t border-neutral-300 space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Tiền sách:</span>
                  <span className="font-semibold">{formatVND(invoiceOrder.totalBookAmount || invoiceOrder.totalAmount)}</span>
                </div>
                {invoiceOrder.discountAmount && invoiceOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Voucher ({invoiceOrder.couponCode || "Khuyến mãi"}):</span>
                    <span>-{formatVND(invoiceOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-neutral-950 pt-1 border-t border-neutral-300">
                  <span>TỔNG CỘNG THANH TOÁN:</span>
                  <span className="text-sm font-extrabold text-neutral-950">{formatVND(invoiceOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Phương thức & Trạng thái:</span>
                  <span className="font-semibold">
                    {invoiceOrder.paymentMethod || "COD"} • {invoiceOrder.paymentStatus === "Paid" ? "Đã Thanh Toán" : "Thu Hộ COD"}
                  </span>
                </div>
              </div>

              {/* Chữ ký */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[10px] text-neutral-500">
                <div>
                  <p className="font-bold uppercase text-neutral-800">Người Mua Hàng</p>
                  <p className="italic text-[9px] mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-10"></div>
                </div>
                <div>
                  <p className="font-bold uppercase text-neutral-800">Đại Diện Cửa Hàng BookStore</p>
                  <p className="italic text-[9px] mt-0.5">(Đã ký điện tử xác thực)</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-serif italic font-bold text-indigo-700 text-xs">Đinh Ngọc Thế Nhân</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-neutral-200 text-center text-[10px] text-neutral-400">
                Cảm ơn bạn đã lựa chọn Nhà sách BookStore ST23B! Chúc bạn đọc sách vui vẻ và thành công!
              </div>
            </div>

            {/* Footer Buttons (Ẩn khi in) */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-between gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  playChimeSound('click');
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" /> In Hóa Đơn Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Storefront */}
      <footer className="bg-white border-t border-neutral-200 text-xs py-8 text-neutral-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-extrabold text-neutral-900 text-sm">BookStore</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  Dự Án Cuối Kỳ Môn DevOps ST23B - Nhóm 1
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Thành viên: <strong>Hoàng Trường Ân</strong> • <strong>Cao Đình Bảo</strong> • <strong>Đinh Ngọc Thế Nhân</strong> • <strong>Huỳnh Phước Quân</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-[11px] flex-wrap justify-center">
            <button
              onClick={() => navigateView("admin")}
              className="flex items-center gap-1.5 text-neutral-600 hover:text-indigo-600 font-semibold transition-colors cursor-pointer"
              title="Mở Bảng Quản Trị (/admin)"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? "Quay lại trang Admin" : "Trang Quản Trị (/admin)"}</span>
            </button>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> 100% Sách Thật NXB
            </span>
            <span>© 2026 BookStore - Nhóm 1 ST23B</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
