"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Star,
  Trash2,
  Plus,
  Minus,
  X,
  CheckCircle,
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Watch,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
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
  specs: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "MacBook Pro 14 inch M3 Pro (18GB / 512GB SSD)",
    category: "Laptop",
    price: 49990000,
    originalPrice: 54990000,
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    tag: "Hot Deal",
    specs: ["Apple M3 Pro chip", "18GB Unified RAM", "120Hz Liquid Retina XDR"],
  },
  {
    id: 2,
    name: "iPhone 16 Pro Max 256GB - Titan Tự Nhiên",
    category: "Điện thoại",
    price: 34990000,
    originalPrice: 36990000,
    rating: 5.0,
    reviewsCount: 256,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    tag: "Mới ra mắt",
    specs: ["Chip Apple A18 Pro", "Camera 48MP Zoom 5x", "Titan Grade 5"],
  },
  {
    id: 3,
    name: "Tai nghe chống ồn Sony WH-1000XM5",
    category: "Tai nghe & Loa",
    price: 7490000,
    originalPrice: 8990000,
    rating: 4.8,
    reviewsCount: 94,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    tag: "Giảm 17%",
    specs: ["Chống ồn đỉnh cao ANC", "Thời lượng pin 30h", "Hi-Res Audio Wireless"],
  },
  {
    id: 4,
    name: "Bàn phím cơ Custom Keychron Q1 Pro Wireless RGB",
    category: "Gaming Gear",
    price: 4590000,
    originalPrice: 4990000,
    rating: 4.9,
    reviewsCount: 67,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
    specs: ["Full nhôm CNC", "Gasket Mount êm ái", "Kết nối 3 thiết bị Bluetooth"],
  },
  {
    id: 5,
    name: "Chuột Gaming không dây Logitech G Pro X Superlight 2",
    category: "Gaming Gear",
    price: 3290000,
    originalPrice: 3890000,
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    tag: "Esports",
    specs: ["Trọng lượng siêu nhẹ 60g", "Cảm biến HERO 2 32k DPI", "Switch cơ quang học"],
  },
  {
    id: 6,
    name: "Đồng hồ thông minh Apple Watch Ultra 2 GPS + Cellular",
    category: "Smartwatch",
    price: 21490000,
    originalPrice: 22990000,
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    specs: ["Màn hình sáng 3000 nits", "Khung Titan 49mm", "Pin lên tới 72 giờ"],
  },
  {
    id: 7,
    name: "Màn hình chuyên đồ họa LG UltraFine 27 inch 4K IPS",
    category: "Laptop",
    price: 11990000,
    originalPrice: 13500000,
    rating: 4.7,
    reviewsCount: 53,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    specs: ["Độ phân giải 4K UHD", "DCI-P3 95%", "Cổng Type-C 90W sạc Laptop"],
  },
  {
    id: 8,
    name: "Loa Bluetooth cao cấp Marshall Stanmore III",
    category: "Tai nghe & Loa",
    price: 8990000,
    originalPrice: 9990000,
    rating: 4.8,
    reviewsCount: 75,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    tag: "Chính hãng",
    specs: ["Âm thanh Stereo sống động", "Bluetooth 5.2", "Thiết kế Vintage sang trọng"],
  },
];

const CATEGORIES = [
  { name: "Tất cả", icon: Sparkles },
  { name: "Laptop", icon: Laptop },
  { name: "Điện thoại", icon: Smartphone },
  { name: "Tai nghe & Loa", icon: Headphones },
  { name: "Gaming Gear", icon: Gamepad2 },
  { name: "Smartwatch", icon: Watch },
];

export default function TechStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Hiển thị toast thông báo
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  // Thêm vào giỏ hàng
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // Thay đổi số lượng
  const updateQuantity = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Xóa khỏi giỏ
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "Tất cả" || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Tổng số lượng và giá tiền
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              TZ
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                TechZone
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                DevOps CI/CD
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm MacBook, iPhone, Gear, Tai nghe..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-all flex items-center"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg outline-none"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-2xl mb-10 border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-400/30">
              <Flame className="w-4 h-4 text-amber-400" />
              Siêu Sale Công Nghệ 2024
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Nâng Tầm Trải Nghiệm <br />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                Đồ Chơi Công Nghệ Đỉnh Cao
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Trang bị các thiết bị phần cứng, Laptop cao cấp, Smartphone và Gaming Gear mới nhất với mức giá ưu đãi cùng chế độ bảo hành 1 đổi 1 trong 30 ngày.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedCategory("Laptop")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-105"
              >
                Khám phá ngay <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Giao hàng miễn phí</p>
              <p className="text-[11px] text-slate-500">Đơn từ 500k toàn quốc</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">100% Chính hãng</p>
              <p className="text-[11px] text-slate-500">Bảo hành 24 tháng</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Đổi trả 30 ngày</p>
              <p className="text-[11px] text-slate-500">Lỗi 1 đổi 1 tận nơi</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Ưu đãi thành viên</p>
              <p className="text-[11px] text-slate-500">Tích điểm nhận quà</p>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">
              {selectedCategory === "Tất cả"
                ? "Tất cả sản phẩm"
                : `Danh mục: ${selectedCategory}`}
            </h2>
            <span className="text-xs font-medium text-slate-500 ml-1">
              ({filteredProducts.length} sản phẩm)
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-base mb-3">
              Không tìm thấy sản phẩm phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Tất cả");
              }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100"
            >
              Xem lại tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image & Tag */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  {product.tag && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500 text-white shadow-sm">
                      {product.tag}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {product.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({product.reviewsCount})
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Specs list */}
                    <ul className="space-y-1 mb-4">
                      {product.specs.map((spec, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-slate-500 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="mb-3">
                      <div className="text-base font-black text-rose-600">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          ></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Giỏ hàng của bạn ({totalCartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Giỏ hàng của bạn đang trống</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-black text-rose-600">
                        {formatPrice(item.price)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg font-black text-rose-600">
                    {formatPrice(totalCartPrice)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    alert("Đặt hàng thành công! Cảm ơn bạn đã trải nghiệm TechZone.");
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  Tiến hành đặt hàng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Site Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-lg mb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs">
                TZ
              </span>
              TechZone Store
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hệ thống bán lẻ thiết bị công nghệ chính hãng, linh kiện PC và Gaming Gear hàng đầu Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Chính sách & Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>Chính sách bảo hành 24 tháng</li>
              <li>Chính sách đổi trả 1-1 trong 30 ngày</li>
              <li>Hướng dẫn mua hàng & thanh toán</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Hạ tầng & CI/CD</h4>
            <p className="leading-relaxed">
              Dự án được xây dựng với Next.js 14, tự động hóa đóng gói Container bằng Docker và CI/CD Pipeline qua GitHub Actions.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 mt-8 pt-6 border-t border-slate-800">
          © 2024 TechZone Ecommerce. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
