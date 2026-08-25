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
} from "lucide-react";

interface Product {
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

interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

const PRODUCTS: Product[] = [
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

const CATEGORIES = [
  "Tất cả",
  "Tai nghe & Loa",
  "Bàn phím & Chuột",
  "Củ cáp sạc",
  "Phụ kiện setup",
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Auth Form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  // Kiểm tra lưu phiên đăng nhập
  useEffect(() => {
    const saved = localStorage.getItem("thenhanshop_user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Xử lý Auth
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "login") {
      if (!authEmail || !authPassword) {
        showToast("Vui lòng điền đầy đủ email và mật khẩu!");
        return;
      }
      const user: UserProfile = {
        name: authEmail.split("@")[0] || "Khách Hàng",
        email: authEmail,
      };
      setCurrentUser(user);
      localStorage.setItem("thenhanshop_user", JSON.stringify(user));
      setIsAuthModalOpen(false);
      showToast(`Chào mừng ${user.name} đã quay trở lại!`);
    } else {
      if (!authName || !authEmail || !authPassword) {
        showToast("Vui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }
      const user: UserProfile = {
        name: authName,
        email: authEmail,
      };
      setCurrentUser(user);
      localStorage.setItem("thenhanshop_user", JSON.stringify(user));
      setIsAuthModalOpen(false);
      showToast(`Đăng ký tài khoản thành công! Xin chào ${user.name}`);
    }
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("thenhanshop_user");
    setIsUserMenuOpen(false);
    showToast("Đã đăng xuất thành công");
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

  // Xóa sản phẩm
  const removeItem = (id: number, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.selectedColor === color)
      )
    );
  };

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat =
        selectedCategory === "Tất cả" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatVND = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-800 flex flex-col antialiased">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Notification Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] py-1.5 px-4 text-center tracking-wide font-normal flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ưu đãi TheNhanShop: Miễn phí vận chuyển toàn quốc cho mọi đơn từ 200k</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Name */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
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
            </a>
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

          {/* Right Actions: Auth + Cart */}
          <div className="flex items-center gap-2.5">
            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-all border border-neutral-200"
                >
                  <div className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center uppercase font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden md:inline">
                    {currentUser.name}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5" /> Đơn hàng của tôi
                    </button>
                    <button
                      onClick={handleLogout}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all relative"
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
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
          {CATEGORIES.map((cat) => (
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
                      <span className="flex items-center text-amber-500 font-medium">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {product.rating} ({product.reviewsCount})
                      </span>
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

      {/* Modal Đăng Nhập & Đăng Ký */}
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
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="ban@example.com"
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
                    placeholder="••••••••"
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
                      showToast("Vui lòng liên hệ Admin qua email để cấp lại mật khẩu!");
                    }}
                    className="text-neutral-900 font-semibold hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Sản Phẩm */}
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
                  className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Thêm vào giỏ
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedColor, modalQuantity);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  Mua ngay <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
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
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base font-extrabold text-neutral-950">
                    {formatVND(totalCartPrice)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const recipient = currentUser ? currentUser.name : "quý khách";
                    alert(
                      `🎉 Đặt hàng thành công! Cảm ơn ${recipient} đã tin tưởng ủng hộ TheNhanShop.`
                    );
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
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

          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Cam kết chính hãng
            </span>
            <span>DevOps CI/CD with Docker</span>
            <span>© 2024 TheNhanShop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
