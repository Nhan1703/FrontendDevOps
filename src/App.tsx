import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Star,
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
} from "lucide-react";

export interface Product {
  id: number;
  name: string;
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
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: "admin" | "user";
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tai nghe Bluetooth True Wireless Mini V5.3",
    category: "Tai nghe & Loa",
    price: 189000,
    originalPrice: 280000,
    rating: 4.8,
    reviewsCount: 342,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
    description: "Tai nghe Bluetooth mini thiết kế nhỏ gọn, chống ồn đàm thoại ENC, thời lượng pin 24h kèm dock sạc, âm bass ấm, kết nối ổn định độ trễ thấp phù hợp nghe nhạc và học tập.",
    specs: ["Bluetooth 5.3", "Pin 24 tiếng", "Cảm ứng chạm đa điểm", "Chống nước IPX4"],
    colors: ["Trắng Tinh Khôi", "Đen Nhám", "Hồng Pastel"],
  },
  {
    id: 2,
    name: "Chuột không dây Silent Click công thái học",
    category: "Bàn phím & Chuột",
    price: 145000,
    originalPrice: 210000,
    rating: 4.9,
    reviewsCount: 520,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    tag: "Yêu thích",
    description: "Chuột không dây thiết kế công thái học cầm vừa tay, switch bấm êm ái hoàn toàn không gây tiếng ồn (Silent Click), kết nối kép 2.4Ghz USB và Bluetooth.",
    specs: ["Click chống ồn 99%", "DPI 800-1200-1600", "Pin sạc Type-C", "Trọng lượng 75g"],
    colors: ["Xám Bạc", "Trắng Sữa", "Đen Tuyền"],
  },
  {
    id: 3,
    name: "Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel",
    category: "Bàn phím & Chuột",
    price: 489000,
    originalPrice: 650000,
    rating: 4.9,
    reviewsCount: 189,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    tag: "Hot Deal",
    description: "Bàn phím cơ layout 87 phím nhỏ gọn, switch gõ cực êm mượt đã được lube sẵn, đèn Led màu pastel tinh tế, hỗ trợ kết nối Bluetooth / 2.4Ghz / Dây Type-C.",
    specs: ["Red Switch êm ái", "Keycap PBT chống bóng", "Hot-swap 3 pin", "Pin 3000mAh"],
    colors: ["Trắng Xám", "Xanh Matcha", "Đen Huyền Bí"],
  },
  {
    id: 4,
    name: "Củ sạc nhanh GaN 30W Type-C nhỏ gọn",
    category: "Củ cáp sạc",
    price: 165000,
    originalPrice: 250000,
    rating: 4.8,
    reviewsCount: 410,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    tag: "Khuyên dùng",
    description: "Củ sạc công nghệ GaN thế hệ mới kích thước siêu nhỏ, hỗ trợ sạc nhanh Power Delivery 30W cho iPhone, iPad, điện thoại Android và sạc phụ trợ MacBook Air.",
    specs: ["Công suất chuẩn 30W", "Chip GaN mát mẻ", "Bảo vệ quá dòng / quá nhiệt", "Chân cắm gập 90 độ"],
    colors: ["Trắng", "Đen"],
  },
  {
    id: 5,
    name: "Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W",
    category: "Củ cáp sạc",
    price: 59000,
    originalPrice: 99000,
    rating: 4.7,
    reviewsCount: 890,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    tag: "Giá tốt",
    description: "Dây cáp sạc nhanh bọc sợi dù siêu bền chống đứt gãy, lõi đồng nguyên chất truyền tải điện năng 60W và dữ liệu tốc độ cao 480Mbps.",
    specs: ["Dài 1.2 mét", "Chịu lực uốn 20.000 lần", "Truyền dữ liệu 480Mbps", "Hỗ trợ PD 60W"],
    colors: ["Xám Không Gian", "Đen", "Xanh Navy"],
  },
  {
    id: 6,
    name: "Giá đỡ Laptop / iPad nhôm nguyên khối xoay 360 độ",
    category: "Phụ kiện setup",
    price: 219000,
    originalPrice: 320000,
    rating: 4.9,
    reviewsCount: 275,
    image: "https://images.unsplash.com/photo-1586775490184-b79f0621891f?auto=format&fit=crop&w=800&q=80",
    tag: "Best Seller",
    description: "Stand đỡ máy tính xách tay và máy tính bảng làm bằng hợp kim nhôm cao cấp, khớp xoay 360 độ tiện lợi, nâng cao màn hình giúp chống mỏi cổ vai gáy.",
    specs: ["Hợp kim nhôm dày 3mm", "Xoay 360 độ có tiếng khấc", "Đệm silicon chống trầy", "Tải trọng tới 10kg"],
    colors: ["Bạc Silver", "Xám Space Gray"],
  },
  {
    id: 7,
    name: "Thảm lót chuột bàn làm việc da PU chống nước (80x40cm)",
    category: "Phụ kiện setup",
    price: 79000,
    originalPrice: 120000,
    rating: 4.8,
    reviewsCount: 630,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    description: "Deskpad lót bàn da PU cao cấp chống bám bẩn và dễ dàng lau sạch bằng khăn ẩm, viền may chắc chắn, mặt đáy phủ nhung chống trượt hiệu quả.",
    specs: ["Kích thước 80x40 cm", "Da PU 2 mặt cao cấp", "Chống nước tuyệt đối", "Không phai màu"],
    colors: ["Xám Đậm", "Nâu Da Bò", "Xanh Rêu", "Hồng Khói"],
  },
  {
    id: 8,
    name: "Loa Bluetooth để bàn phong cách Retro Vintage",
    category: "Tai nghe & Loa",
    price: 349000,
    originalPrice: 490000,
    rating: 4.8,
    reviewsCount: 160,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    tag: "Decor đẹp",
    description: "Loa Bluetooth thiết kế cổ điển sang trọng, vừa nghe nhạc âm thanh trung thực vừa làm đồ trang trí bàn làm việc hoặc phòng ngủ cực chill.",
    specs: ["Công suất 10W", "Pin nghe liên tục 8h", "Hỗ trợ Bluetooth / Thẻ nhớ / AUX", "Núm xoay cơ học"],
    colors: ["Gỗ Sáng", "Gỗ Óc Chó", "Trắng Kem"],
  },
];

const DEFAULT_CATEGORIES = [
  "Tai nghe & Loa",
  "Bàn phím & Chuột",
  "Củ cáp sạc",
  "Phụ kiện setup",
  "Điện thoại & Giá đỡ",
];

const PRESET_TAGS = [
  { value: "", label: "-- Không có nhãn --" },
  { value: "Mới", label: "Mới" },
  { value: "Hot Deal", label: "Hot Deal" },
  { value: "Bán chạy", label: "Bán chạy" },
  { value: "Yêu thích", label: "Yêu thích" },
  { value: "Decor đẹp", label: "Decor đẹp" },
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
    name: "Điện thoại",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Điện thoại & Giá đỡ",
  },
  {
    name: "Tai nghe",
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Tai nghe & Loa",
  },
  {
    name: "Bàn phím",
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Bàn phím & Chuột",
  },
  {
    name: "Chuột",
    url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Bàn phím & Chuột",
  },
  {
    name: "Cáp sạc",
    url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Củ cáp sạc",
  },
  {
    name: "Loa Bluetooth",
    url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Tai nghe & Loa",
  },
  {
    name: "Giá đỡ laptop",
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Phụ kiện setup",
  },
  {
    name: "Lót bàn setup",
    url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    categorySuggestion: "Phụ kiện setup",
  },
];

export type OrderStatus = "pending" | "shipping" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedColor: string;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  note?: string;
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

const DEFAULT_ORDERS: Order[] = [
  {
    id: "DH-1001",
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@gmail.com",
    customerPhone: "0912 345 678",
    customerAddress: "123 Cầu Giấy, Hà Nội",
    items: [
      {
        id: 1,
        name: "Tai nghe Bluetooth True Wireless Mini V5.3",
        price: 189000,
        quantity: 1,
        selectedColor: "Trắng Tinh Khôi",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 3,
        name: "Cáp sạc nhanh Type-C to Type-C 65W Bọc dù",
        price: 89000,
        quantity: 2,
        selectedColor: "Xám titan",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
      },
    ],
    totalAmount: 367000,
    status: "shipping",
    createdAt: "07/09/2026 14:30",
    note: "Giao giờ hành chính, gọi trước khi đến",
  },
  {
    id: "DH-1002",
    customerName: "Trần Thị Bích",
    customerEmail: "bich.tran@gmail.com",
    customerPhone: "0988 765 432",
    customerAddress: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    items: [
      {
        id: 2,
        name: "Bàn phím cơ không dây Tenkeyless 87 phím Switch êm",
        price: 499000,
        quantity: 1,
        selectedColor: "Trắng Retro",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
      },
    ],
    totalAmount: 499000,
    status: "pending",
    createdAt: "08/09/2026 08:15",
    note: "Đóng gói cẩn thận giúp shop",
  },
  {
    id: "DH-1003",
    customerName: "Lê Hoàng Long",
    customerEmail: "long.le@gmail.com",
    customerPhone: "0903 112 233",
    customerAddress: "88 Trần Phú, Hải Châu, Đà Nẵng",
    items: [
      {
        id: 4,
        name: "Chuột không dây Silent Click công thái học",
        price: 249000,
        quantity: 1,
        selectedColor: "Đen Nhám",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
      },
    ],
    totalAmount: 249000,
    status: "delivered",
    createdAt: "05/09/2026 10:20",
  },
  {
    id: "DH-1004",
    customerName: "Phạm Minh Đức",
    customerEmail: "duc.pham@outlook.com",
    customerPhone: "0934 556 778",
    customerAddress: "12 Quang Trung, Hồng Bàng, Hải Phòng",
    items: [
      {
        id: 5,
        name: "Củ sạc nhanh GaN 65W 3 cổng Mini",
        price: 349000,
        quantity: 1,
        selectedColor: "Đen",
        image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=400&q=80",
      },
    ],
    totalAmount: 349000,
    status: "cancelled",
    createdAt: "03/09/2026 16:45",
    note: "Khách hủy do đổi mẫu khác",
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
    name: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    password: "kh123",
    phone: "0912 345 678",
    role: "customer",
    status: "active",
    createdAt: "15/05/2026",
    ordersCount: 3,
  },
  {
    id: "USR-003",
    name: "Trần Thị Bích",
    email: "bich.tran@gmail.com",
    password: "kh123",
    phone: "0988 765 432",
    role: "customer",
    status: "active",
    createdAt: "22/07/2026",
    ordersCount: 1,
  },
  {
    id: "USR-004",
    name: "Lê Hoàng Long",
    email: "long.le@gmail.com",
    password: "kh123",
    phone: "0903 112 233",
    role: "customer",
    status: "active",
    createdAt: "10/08/2026",
    ordersCount: 2,
  },
  {
    id: "USR-005",
    name: "Phạm Minh Đức",
    email: "duc.pham@outlook.com",
    password: "kh123",
    phone: "0934 556 778",
    role: "customer",
    status: "active",
    createdAt: "28/08/2026",
    ordersCount: 1,
  },
  {
    id: "USR-006",
    name: "Vũ Hải Nam",
    email: "hainam.vu@yahoo.com",
    password: "kh123",
    phone: "0977 889 900",
    role: "customer",
    status: "active",
    createdAt: "02/09/2026",
    ordersCount: 0,
  },
  {
    id: "USR-007",
    name: "Thế Nhân",
    email: "thenhan",
    password: "admin123",
    phone: "0917 714 595",
    role: "admin",
    status: "active",
    createdAt: "08/09/2026",
    ordersCount: 0,
  },
];

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
    const saved = localStorage.getItem("thenhanshop_products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading products from localStorage", e);
      }
    }
    return DEFAULT_PRODUCTS;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("thenhanshop_products", JSON.stringify(products));
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ================= ADMIN TABS & MANAGEMENT STATES =================
  const [adminTab, setAdminTab] = useState<"products" | "orders" | "users">("products");

  // Orders State & LocalStorage Persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("thenhanshop_orders");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error loading orders from localStorage", e);
        }
      }
    }
    return DEFAULT_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("thenhanshop_orders", JSON.stringify(orders));
  }, [orders]);

  // Order Management States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper kiểm tra tài khoản Quản trị viên gốc đầu tiên (admin)
  const isRootAdmin = (u?: AppUser | null) => {
    if (!u) return false;
    return u.email.toLowerCase() === "admin" || (u.id === "USR-001" && (u.name || "").toLowerCase().includes("admin"));
  };

  // App Users State & LocalStorage Persistence
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("thenhanshop_users");
      if (saved) {
        try {
          const parsed: AppUser[] = JSON.parse(saved);
          const hasTheNhan = parsed.some(
            (u) => u.email.toLowerCase() === "thenhan" || u.id === "USR-007"
          );
          const userList = hasTheNhan
            ? parsed
            : [
                ...parsed,
                {
                  id: "USR-007",
                  name: "Thế Nhân",
                  email: "thenhan",
                  password: "admin123",
                  phone: "0917 714 595",
                  role: "admin" as const,
                  status: "active" as const,
                  createdAt: "08/09/2026",
                  ordersCount: 0,
                },
              ];

          return userList.map((u) => {
            const isRoot = u.email.toLowerCase() === "admin" || (u.id === "USR-001" && (u.name || "").toLowerCase().includes("admin"));
            const isTheNhan = u.email.toLowerCase() === "thenhan";
            return {
              ...u,
              role: isRoot || isTheNhan ? "admin" : (u.role || "customer"),
              status: isRoot ? "active" : u.status,
              password: u.password || (u.role === "admin" || u.email === "admin" || isTheNhan ? "admin123" : "kh123"),
            };
          });
        } catch (e) {
          console.error("Error loading users from localStorage", e);
        }
      }
    }
    return DEFAULT_APP_USERS;
  });

  useEffect(() => {
    localStorage.setItem("thenhanshop_users", JSON.stringify(appUsers));
  }, [appUsers]);

  // Đồng bộ dữ liệu từ SQL Server qua Backend API khi mở ứng dụng
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {});

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAppUsers(data.data);
        }
      })
      .catch(() => {});

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setOrders(data.data);
        }
      })
      .catch(() => {});
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

  // Product Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formTag, setFormTag] = useState("");
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [formSpecs, setFormSpecs] = useState("");
  const [formColors, setFormColors] = useState("");
  const [formRating, setFormRating] = useState("0");
  const [formReviewsCount, setFormReviewsCount] = useState("0");

  // ================= ADMIN SESSION (ĐỘC LẬP VỚI SHOP) =================
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thenhanshop_admin_logged_in") === "true";
    }
    return false;
  });

  const [currentAdminAccount, setCurrentAdminAccount] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thenhanshop_current_admin") || "admin";
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
      localStorage.setItem("thenhanshop_admin_logged_in", "true");
      localStorage.setItem("thenhanshop_current_admin", matchedAdmin.name || matchedAdmin.email);
      showToast(`Đăng nhập Admin (${matchedAdmin.name}) thành công!`);
    } else {
      showToast(`Mật khẩu Quản trị viên không đúng! (Mật khẩu: ${expectedPass})`);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("thenhanshop_admin_logged_in");
    localStorage.removeItem("thenhanshop_current_admin");
    setCurrentAdminAccount("admin");
    navigateView("store"); // Tự động quay về trang mua sắm ngay lập tức
    showToast("Đã đăng xuất tài khoản Quản trị viên và quay về Cửa hàng.");
  };

  // ================= CUSTOMER SESSION (DÀNH RIÊNG CHO SHOP) =================
  const [customerUser, setCustomerUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("thenhanshop_customer");
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
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");

  // Customer Form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  // Customer Auth handlers (Chỉ cho khách hàng, không can thiệp Admin)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "login") {
      const cleanLogin = authEmail.trim();
      const cleanPassword = authPassword.trim();

      if (!cleanLogin || !cleanPassword) {
        showToast("Vui lòng điền đầy đủ tài khoản/email và mật khẩu!");
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
          showToast(`Tài khoản Quản trị viên "${adminToAuth.name}" đang bị khóa bởi hệ thống!`);
          return;
        }

        const expectedAdminPass = adminToAuth?.password || "admin123";
        if (cleanPassword === expectedAdminPass) {
          setIsAdminLoggedIn(true);
          setCurrentAdminAccount(adminToAuth?.name || adminToAuth?.email || "admin");
          localStorage.setItem("thenhanshop_admin_logged_in", "true");
          localStorage.setItem("thenhanshop_current_admin", adminToAuth?.name || adminToAuth?.email || "admin");
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          showToast(`Đăng nhập Admin (${adminToAuth?.name || "admin"}) thành công! Đang chuyển đến trang Quản trị...`);
          navigateView("admin");
          return;
        } else {
          showToast(`Mật khẩu Admin không đúng! (Mật khẩu: ${expectedAdminPass})`);
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
        showToast(`Mật khẩu không đúng! Mật khẩu cho tài khoản này là: ${expectedCustomerPass}`);
        return;
      }

      // Đăng nhập khách hàng: Đảm bảo xóa bỏ hoàn toàn quyền/phiên Admin
      setIsAdminLoggedIn(false);
      localStorage.removeItem("thenhanshop_admin_logged_in");

      if (matchedUser) {
        if (matchedUser.status === "locked") {
          showToast(`Tài khoản "${matchedUser.name}" đang bị khóa bởi Quản trị viên! Vui lòng liên hệ hỗ trợ.`);
          return;
        }

        const customer: UserProfile = {
          name: matchedUser.name,
          email: matchedUser.email,
          role: "user",
        };
        setCustomerUser(customer);
        localStorage.setItem("thenhanshop_customer", JSON.stringify(customer));
        setIsAuthModalOpen(false);
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
        localStorage.setItem("thenhanshop_customer", JSON.stringify(customer));

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
      if (!authName.trim() || !authEmail.trim() || !authPassword) {
        showToast("Vui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }

      // Xóa bỏ session Admin khi tạo tài khoản khách hàng
      setIsAdminLoggedIn(false);
      localStorage.removeItem("thenhanshop_admin_logged_in");

      const customer: UserProfile = {
        name: authName.trim(),
        email: authEmail.trim(),
        role: "user",
      };
      setCustomerUser(customer);
      localStorage.setItem("thenhanshop_customer", JSON.stringify(customer));

      // Tự động thêm vào danh sách Quản lý người dùng trong Admin & SQL Server
      const nextUserId = `USR-${String(appUsers.length + 1).padStart(3, "0")}`;
      const newCustomerUser: AppUser = {
        id: nextUserId,
        name: customer.name,
        email: customer.email,
        password: authPassword.trim() || "kh123",
        role: "customer",
        status: "active",
        createdAt: new Date().toLocaleDateString("vi-VN"),
        ordersCount: 0,
      };

      setAppUsers((prev) => {
        if (prev.some((u) => u.email.toLowerCase() === customer.email.toLowerCase())) {
          return prev;
        }
        return [...prev, newCustomerUser];
      });

      // Lưu tài khoản mới vào SQL Server
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomerUser),
      }).catch((err) => console.error("Error creating customer in DB:", err));

      setIsAuthModalOpen(false);
      showToast(`Đăng ký tài khoản thành công! Xin chào ${customer.name}`);
    }
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    localStorage.removeItem("thenhanshop_customer");
    setIsUserMenuOpen(false);
    showToast("Đã đăng xuất tài khoản.");
  };

  // Mở popup chi tiết sản phẩm
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0] || "Mặc định");
    setModalQuantity(1);
  };

  // Thêm nhanh vào giỏ từ card
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, product.colors[0] || "Mặc định", 1);
  };

  // Thêm vào giỏ hàng
  const addToCart = (product: Product, color: string, quantity: number) => {
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

  // Lọc sản phẩm hiển thị ngoài Store
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "Tất cả" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Lọc sản phẩm trong Admin
  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        adminCategoryFilter === "Tất cả" || p.category === adminCategoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(adminSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, adminCategoryFilter, adminSearch]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
      showToast(`Đã xóa sản phẩm thành công`);
    }
  };

  const handleResetDefaultData = () => {
    if (confirm("Khôi phục danh sách sản phẩm về dữ liệu mặc định ban đầu?")) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem("thenhanshop_products", JSON.stringify(DEFAULT_PRODUCTS));
      showToast("Đã khôi phục dữ liệu sản phẩm gốc!");
    }
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

    const specsArr = formSpecs
      ? formSpecs.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Chính hãng", "Bảo hành 12 tháng"];

    const colorsArr = formColors
      ? formColors.split(",").map((c) => c.trim()).filter(Boolean)
      : ["Mặc định"];

    if (editingProduct) {
      // UPDATE
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: formName.trim(),
                category: formCategory.trim() || "Phụ kiện",
                price: priceNum,
                originalPrice: origPriceNum,
                rating: ratingNum,
                reviewsCount: reviewsNum,
                image: formImage.trim() || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
                tag: formTag.trim() || undefined,
                description: formDescription.trim() || formName.trim(),
                specs: specsArr,
                colors: colorsArr,
              }
            : item
        )
      );
      showToast(`Đã cập nhật "${formName}" thành công!`);
    } else {
      // CREATE
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: newId,
        name: formName.trim(),
        category: formCategory.trim() || "Phụ kiện",
        price: priceNum,
        originalPrice: origPriceNum,
        rating: ratingNum,
        reviewsCount: reviewsNum,
        image: formImage.trim() || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        tag: formTag.trim() || undefined,
        description: formDescription.trim() || formName.trim(),
        specs: specsArr,
        colors: colorsArr,
      };
      setProducts((prev) => [newProduct, ...prev]);
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
    if (confirm("Khôi phục danh sách đơn hàng về dữ liệu mẫu ban đầu?")) {
      setOrders(DEFAULT_ORDERS);
      localStorage.setItem("thenhanshop_orders", JSON.stringify(DEFAULT_ORDERS));
      showToast("Đã khôi phục danh sách đơn hàng gốc!");
    }
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
      // Xóa người dùng khỏi SQL Server
      fetch(`/api/users/${userId}`, {
        method: "DELETE",
      }).catch((err) => console.error("Error deleting user in DB:", err));
      showToast(`Đã xóa người dùng "${userToDelete.name}"`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast("Vui lòng điền đủ Tên và Email!");
      return;
    }
    const exists = appUsers.some(
      (u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (exists) {
      showToast("Email/tài khoản này đã tồn tại!");
      return;
    }

    const nextId = `USR-${String(appUsers.length + 1).padStart(3, "0")}`;
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
    setAppUsers((prev) => [newUser, ...prev]);

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
      showToast("Vui lòng điền đủ Họ tên, Email và Mật khẩu!");
      return;
    }
    const duplicate = appUsers.some(
      (u) =>
        u.id !== editingUser.id &&
        u.email.toLowerCase() === editUserEmail.trim().toLowerCase()
    );
    if (duplicate) {
      showToast("Email/tài khoản này đã được sử dụng bởi người dùng khác!");
      return;
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
    if (confirm("Khôi phục danh sách người dùng về dữ liệu mặc định ban đầu?")) {
      setAppUsers(DEFAULT_APP_USERS);
      localStorage.setItem("thenhanshop_users", JSON.stringify(DEFAULT_APP_USERS));
      showToast("Đã khôi phục danh sách người dùng gốc!");
    }
  };

  const adminFilteredUsers = useMemo(() => {
    return appUsers.filter((u) => {
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
          <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Top Admin Notice Bar */}
        <div className="bg-neutral-950 text-neutral-300 text-[11px] py-1.5 px-4 text-center tracking-wide font-normal flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>TheNhanShop - Bảng Quản Trị Hệ Thống (/admin)</span>
          </div>
          <button
            onClick={() => navigateView("store")}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all shadow-xs"
          >
            <Store className="w-3.5 h-3.5" /> Xem Shop (Cửa hàng)
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
                  TN
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-neutral-950">
                      TheNhanShop
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold -mt-0.5">
                    Trang Quản Trị (/admin)
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
          /* Màn hình đăng nhập dành riêng cho trang localhost:3000/admin khi chưa đăng nhập */
          <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">
                  TN
                </div>
                <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  Admin Portal (/admin)
                </span>
                <h2 className="text-xl font-black text-neutral-900 mt-2">
                  Đăng Nhập Quản Trị
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Trang quản trị yêu cầu quyền Quản trị viên TheNhanShop để truy cập.
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
                      placeholder="admin hoặc thenhan"
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

                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 text-[11px] flex items-center justify-between text-neutral-600">
                  <span>Mặc định: <strong>admin</strong> / <strong>thenhan</strong> (MK: <strong>admin123</strong>)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDirectAdminAccount("thenhan");
                        setDirectAdminPassword("admin123");
                        showToast("Đã điền tài khoản thenhan!");
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold underline text-[10px] cursor-pointer"
                    >
                      thenhan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectAdminAccount("admin");
                        setDirectAdminPassword("admin123");
                        showToast("Đã điền tài khoản admin!");
                      }}
                      className="text-neutral-500 hover:text-neutral-900 font-bold underline text-[10px] cursor-pointer"
                    >
                      admin
                    </button>
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
                      Dữ liệu được lưu trữ trực tiếp trên máy của bạn (Local Storage) và đồng bộ tức thì với cửa hàng.
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

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Tổng Sản Phẩm</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">{products.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Danh Mục</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">{categories.length - 1}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Giá Thấp Nhất</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">
                      {products.length > 0 ? formatVND(Math.min(...products.map((p) => p.price))) : "0đ"}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Giá Cao Nhất</div>
                    <div className="text-2xl font-extrabold text-neutral-950 mt-1">
                      {products.length > 0 ? formatVND(Math.max(...products.map((p) => p.price))) : "0đ"}
                    </div>
                  </div>
                </div>

                {/* Admin Table Controls */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                  <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search in Admin */}
                    <div className="w-full sm:w-72 relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc danh mục..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-neutral-500 shrink-0">Lọc theo:</span>
                      <select
                        value={adminCategoryFilter}
                        onChange={(e) => setAdminCategoryFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-800"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Sản Phẩm</th>
                          <th className="py-3 px-4">Danh Mục</th>
                          <th className="py-3 px-4">Giá Bán</th>
                          <th className="py-3 px-4">Giá Gốc</th>
                          <th className="py-3 px-4">Đánh Giá</th>
                          <th className="py-3 px-4 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {adminFilteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-neutral-400">
                              Không tìm thấy sản phẩm nào phù hợp.
                            </td>
                          </tr>
                        ) : (
                          adminFilteredProducts.map((product) => (
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
                              <td className="py-3 px-4 font-bold text-neutral-950">
                                {formatVND(product.price)}
                              </td>
                              <td className="py-3 px-4 text-neutral-400 line-through">
                                {product.originalPrice > product.price
                                  ? formatVND(product.originalPrice)
                                  : "—"}
                              </td>
                              <td className="py-3 px-4">
                                {product.reviewsCount > 0 ? (
                                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{product.rating}</span>
                                    <span className="text-[10px] text-neutral-400 font-normal">
                                      ({product.reviewsCount})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-neutral-400 text-xs italic">
                                    Chưa có
                                  </span>
                                )}
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
                                        {items[0]?.name || "Đơn hàng phụ kiện"}
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
                    <div className="text-[11px] font-semibold text-indigo-600 uppercase">Quản Trị Viên</div>
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
                        <option value="admin">Quản trị viên (Admin)</option>
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
                                        {isRoot && (
                                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-100 text-indigo-700">
                                            Admin Gốc
                                          </span>
                                        )}
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
                                      title="Tài khoản Quản trị viên gốc không thể đổi vai trò"
                                    >
                                      Quản Trị Viên (Gốc)
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
                                      title="Bấm để đổi vai trò Quản trị viên / Khách hàng"
                                    >
                                      {u.role === "admin" ? "Quản Trị Viên" : "Khách Hàng"}
                                    </button>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-neutral-600 text-xs whitespace-nowrap">
                                  {u.createdAt}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className="font-bold text-neutral-900 px-2 py-0.5 rounded bg-neutral-100 text-xs">
                                    {u.ordersCount} đơn
                                  </span>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {isRoot ? (
                                    <span
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed opacity-90 select-none"
                                      title="Tài khoản Quản trị viên gốc luôn hoạt động, không thể khóa"
                                    >
                                      Hoạt động (Cố định)
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
                              <td className="py-2.5 px-3 text-right font-medium">{formatVND(item.price)}</td>
                              <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-neutral-950">
                                {formatVND(item.price * item.quantity)}
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

                  <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
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
                        <option value="customer">Khách Hàng (Customer)</option>
                        <option value="admin">Quản Trị Viên (Admin)</option>
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

                  <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
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
                        <option value="customer">Khách Hàng (Customer)</option>
                        <option value="admin">Quản Trị Viên (Admin)</option>
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

                {/* Rating & Reviews */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Đánh giá sao (0 - 5)
                      </label>
                      <span className="text-[10px] text-neutral-400">0 = Chưa có</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      placeholder="0 (chưa đánh giá)"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Số lượt đánh giá
                      </label>
                      <span className="text-[10px] text-neutral-400">0 = Chưa có</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formReviewsCount}
                      onChange={(e) => setFormReviewsCount(e.target.value)}
                      placeholder="0"
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
                TN
              </div>
              <span className="font-bold text-neutral-900">TheNhanShop Admin</span>
              <span>— Quản trị kho hàng & sản phẩm (/admin)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={() => navigateView("store")}
                className="text-neutral-700 hover:text-neutral-950 font-semibold underline flex items-center gap-1"
              >
                <Store className="w-3 h-3 text-emerald-600" /> Quay lại trang chủ mua sắm
              </button>
              <span>© 2024 TheNhanShop</span>
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
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
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
            <span>TheNhanShop - Phụ kiện & Đồ chơi công nghệ tối giản</span>
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
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter group-hover:scale-95 transition-transform">
                TN
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-neutral-950">
                  TheNhanShop
                </span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold -mt-1">
                  Minimal Tech Store
                </span>
              </div>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-sm relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phụ kiện công nghệ..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-neutral-100/80 rounded-lg border border-transparent focus:border-neutral-300 focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Actions: Customer Auth + Cart */}
          <div className="flex items-center gap-2">
            {/* Customer User Account Button */}
            {customerUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-all border border-neutral-200"
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
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                        setIsMyOrdersOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5" /> Đơn hàng của tôi
                    </button>
                    <button
                      onClick={handleCustomerLogout}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all relative"
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

      {/* Main Storefront Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full animate-in fade-in duration-200">
          {/* Banner Tối Giản */}
          <div className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md z-10">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest block mb-2">
                Bộ Sưu Tập Phụ Kiện Tối Giản
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-snug">
                Trang Bị Bàn Làm Việc <br /> Tinh Tế & Vừa Túi Tiền.
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4">
                Cung cấp phụ kiện công nghệ, tai nghe, chuột phím và củ sạc nhỏ gọn với chất lượng hoàn thiện cao và mức giá hợp lý.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                <Check className="w-4 h-4 text-emerald-400" /> Bảo hành 12 tháng lỗi 1 đổi 1
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
                <div className="text-[10px] text-neutral-400">Nếu không vừa ý</div>
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product List Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              {selectedCategory} ({filteredProducts.length})
            </h2>
            <span className="text-[11px] text-neutral-400 italic">
              *Bấm vào sản phẩm để xem chi tiết thông số
            </span>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-2">
                Không tìm thấy sản phẩm nào khớp với tìm kiếm &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tất cả");
                }}
                className="text-xs font-semibold text-neutral-900 underline"
              >
                Xem toàn bộ sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetail(product)}
                  className="group bg-white rounded-xl border border-neutral-200/80 overflow-hidden hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  {/* Image Box */}
                  <div className="relative h-44 sm:h-48 w-full bg-neutral-100 overflow-hidden">
                    {product.tag && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white">
                        {product.tag}
                      </span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>{product.category}</span>
                        {product.reviewsCount > 0 ? (
                          <span className="flex items-center text-amber-500 font-medium">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            {product.rating} ({product.reviewsCount})
                          </span>
                        ) : (
                          <span className="text-neutral-400">Chưa có đánh giá</span>
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
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 transition-all"
                        title="Thêm nhanh vào giỏ"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-base">
                TN
              </div>
              <h3 className="text-lg font-extrabold text-neutral-950">
                {authMode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {authMode === "login"
                  ? "Đăng nhập để nhận ưu đãi và theo dõi đơn hàng"
                  : "Trở thành thành viên TheNhanShop ngay hôm nay"}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "login"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthMode("register")}
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
              {authMode === "register" && (
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
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tài khoản hoặc Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Nhập email hoặc tên tài khoản..."
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

      {/* ================= MODAL: PRODUCT DETAIL ================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="w-full md:w-1/2 bg-neutral-100 relative min-h-[260px] md:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {selectedProduct.tag && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold bg-neutral-900 text-white">
                  {selectedProduct.tag}
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  {selectedProduct.category}
                </div>
                <h3 className="text-base font-bold text-neutral-950 mb-2 leading-snug">
                  {selectedProduct.name}
                </h3>

                {/* Rating */}
                {selectedProduct.reviewsCount > 0 ? (
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="ml-1 font-bold text-neutral-800">
                        {selectedProduct.rating}
                      </span>
                    </div>
                    <span className="text-neutral-300">|</span>
                    <span className="text-neutral-500">
                      {selectedProduct.reviewsCount} đánh giá tích cực
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-neutral-400">
                    <span>Sản phẩm mới (Chưa có đánh giá)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                  <span className="text-xl font-extrabold text-neutral-950">
                    {formatVND(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatVND(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  {selectedProduct.description}
                </p>

                {/* Specs */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    Thông số nổi bật:
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-600">
                    {selectedProduct.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    Phân loại màu sắc:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                          selectedColor === c
                            ? "border-neutral-900 bg-neutral-900 text-white font-semibold"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-semibold text-neutral-700">
                    Số lượng:
                  </span>
                  <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedColor, modalQuantity);
                    setSelectedProduct(null);
                  }}
                  className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Thêm vào giỏ
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedColor, modalQuantity);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  Mua ngay <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      const prodToEdit = selectedProduct;
                      setSelectedProduct(null);
                      navigateView("admin");
                      setAdminTab("products");
                      handleOpenEditProduct(prodToEdit);
                    }}
                    className="col-span-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Chỉnh sửa sản phẩm này trong Admin</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MY ORDERS (ĐƠN HÀNG CỦA TÔI) ================= */}
      {isMyOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsMyOrdersOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">
                    Đơn hàng của tôi
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {customerUser
                      ? `${customerUser.name} (${customerUser.email})`
                      : "Theo dõi tình trạng đơn hàng của bạn"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMyOrdersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {!customerUser ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">
                    Bạn chưa đăng nhập
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Vui lòng đăng nhập vào tài khoản để xem lịch sử mua sắm và theo dõi tình trạng đơn hàng của mình.
                  </p>
                  <button
                    onClick={() => {
                      setIsMyOrdersOpen(false);
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              ) : (() => {
                const myOrders = orders.filter((o) =>
                  (customerUser.email && o.customerEmail?.toLowerCase() === customerUser.email.toLowerCase()) ||
                  (o.userId && o.userId === customerUser.id)
                );

                if (myOrders.length === 0) {
                  return (
                    <div className="text-center py-12 px-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-300 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        Chưa có đơn hàng nào
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                        Tài khoản <strong>{customerUser.email}</strong> hiện chưa có đơn hàng nào. Hãy khám phá và mua sắm các sản phẩm công nghệ của chúng tôi!
                      </p>
                      <button
                        onClick={() => setIsMyOrdersOpen(false)}
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Khám phá sản phẩm
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                      <span>Bạn có tổng cộng <strong>{myOrders.length}</strong> đơn hàng</span>
                    </div>

                    {myOrders.map((order) => {
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
                                <Calendar className="w-3 h-3" /> {order.createdAt}
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
                              <span>{order.customerAddress || "Địa chỉ nhận hàng toàn quốc"}</span>
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
                                  {formatVND(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
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
                <div className="flex justify-between items-center text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base font-extrabold text-neutral-950">
                    {formatVND(totalCartPrice)}
                  </span>
                </div>

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
                </div>

                <button
                  onClick={() => {
                    const finalPhone = checkoutPhone.trim() || (customerUser?.phone || "0912345678");
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
                      userId: customerUser?.id,
                      customerName: customerUser ? customerUser.name : "Khách Vãng Lai",
                      customerEmail: customerUser ? customerUser.email : "khachhang@thenhanshop.vn",
                      customerPhone: finalPhone,
                      customerAddress: finalAddress,
                      items: cart.map((item) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        selectedColor: item.selectedColor,
                        image: item.image,
                      })),
                      totalAmount: totalCartPrice,
                      status: "pending",
                      createdAt: formattedDate,
                      note: finalNote,
                    };

                    setOrders((prev) => [newOrder, ...prev]);

                    if (customerUser) {
                      setAppUsers((prev) =>
                        prev.map((u) =>
                          u.email.toLowerCase() === customerUser.email.toLowerCase()
                            ? { ...u, ordersCount: u.ordersCount + 1 }
                            : u
                        )
                      );
                    }

                    // Đồng bộ lưu đơn hàng và ghi chú vào SQL Server
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

                    alert(
                      `🎉 Đặt hàng thành công! Mã đơn: ${newOrderId}.\n📍 Giao đến: ${finalAddress}\n📞 SĐT: ${finalPhone}\n📝 Ghi chú: ${finalNote}\n\nĐơn hàng đã được lưu và gửi tới hệ thống quản lý TheNhanShop.`
                    );
                    setCart([]);
                    setCheckoutPhone("");
                    setCheckoutAddress("");
                    setCheckoutNote("");
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 text-xs py-8 text-neutral-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-900 text-white font-bold text-xs flex items-center justify-center">
              TN
            </div>
            <span className="font-bold text-neutral-900">TheNhanShop</span>
            <span>— Đồ chơi & Phụ kiện công nghệ tối giản</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-[11px] flex-wrap">
            <button
              onClick={() => navigateView("admin")}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Mở Bảng Quản Trị (/admin)"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? "Quay lại trang Admin" : "Trang Quản Trị (/admin)"}</span>
            </button>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Cam kết chính hãng
            </span>
            <span>© 2024 TheNhanShop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
