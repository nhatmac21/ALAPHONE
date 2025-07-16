"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  brand: string;
  ram: string;
  rom: string;
  screen: string;
  quantity: number;
  originalPrice?: number; // thêm trường này để hỗ trợ hiển thị giá gốc
}

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  fullName?: string;
  userName?: string;
}

interface PromoCode {
  promotion: {
    type: string;
    value: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
  };
  userID: number | null;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [promoMap, setPromoMap] = useState<{[pid:number]: PromoCode | null}>({});
  const router = useRouter();

  // Hàm tính giá sau giảm
  function getDiscountedPrice(item: Product): number {
    const promo = promoMap[item.id];
    if (promo && promo.promotion) {
      const discount = Number(promo.promotion.value);
      if (promo.promotion.type === 'percentage') {
        return Math.round(Number(item.price) * (1 - discount / 100));
      } else {
        return Math.max(0, Number(item.price) - discount);
      }
    }
    return Number(item.price);
  }

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      // Map lại cart: id = id || ProductID, price = Number(price)
      const cartArr = JSON.parse(cartData).map((item: any) => ({
        ...item,
        id: item.id || item.ProductID,
        price: Number(item.price)
      }));
      setCart(cartArr);
      console.log('Cart from localStorage:', cartArr);
    }

    // Kiểm tra trạng thái đăng nhập và tự động điền thông tin
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const userInfo = JSON.parse(userData);
        setUser(userInfo);
        setName(userInfo.fullName || userInfo.name || userInfo.userName || "");
        setPhone(userInfo.phone);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Debug: log promoMap mỗi khi thay đổi
  useEffect(() => {
    console.log('promoMap:', promoMap);
  }, [promoMap]);

  useEffect(() => {
    async function fetchPromos() {
      const map: {[pid:number]: PromoCode | null} = {};
      for (const item of cart) {
        // Đảm bảo fetch đúng id
        const res = await fetch(`/api/product/${item.id}`);
        const data = await res.json();
        const promoCodes: PromoCode[] = data.promoCodes || [];
        let promo: PromoCode | null = null;
        if (user) {
          promo = promoCodes.find(pc => pc.userID === user.id) || promoCodes.find(pc => pc.userID === null) || null;
        } else {
          promo = promoCodes.find(pc => pc.userID === null) || null;
        }
        map[item.id] = promo;
      }
      setPromoMap(map);
    }
    if (cart.length > 0) fetchPromos();
  }, [cart, user]);

  const total = cart.reduce((sum, item) => sum + getDiscountedPrice(item) * (item.quantity || 1), 0);

  // Debug: log cartWithDiscount khi submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !phone || !address) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (cart.length === 0) {
      setError("Giỏ hàng trống!");
      return;
    }
    setLoading(true);
    try {
      if (payment === "cod") {
        // Map lại cart để mỗi item có cả giá gốc và giá đã giảm
        const cartWithDiscount = cart.map(item => ({
          ...item,
          originalPrice: item.price,
          price: getDiscountedPrice(item)
        }));
        console.log('cartWithDiscount:', cartWithDiscount);
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, address, cart: cartWithDiscount, payment: "cod" }),
        });
        if (res.ok) {
          localStorage.removeItem("cart");
          router.push("/checkout/success");
        } else {
          setError("Đặt hàng thất bại!");
        }
      } else if (payment === "vnpay") {
        const cartWithDiscount = cart.map(item => ({
          ...item,
          originalPrice: item.price,
          price: getDiscountedPrice(item)
        }));
        console.log('cartWithDiscount:', cartWithDiscount);
        const res = await fetch("/api/payment/vnpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, address, cart: cartWithDiscount, payment: "vnpay", total }),
        });
        const data = await res.json();
        if (res.ok && data.paymentUrl) {
          localStorage.removeItem("cart");
          window.location.href = data.paymentUrl;
        } else {
          setError("Không tạo được link thanh toán VNPay!");
        }
      }
    } catch {
      setError("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-green-400 mb-8 text-center">Đặt hàng</h1>
        
        {user && (
          <div className="bg-green-900/10 border border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-green-300">Thông tin đã được điền tự động từ tài khoản của bạn</span>
            </div>
            <p className="text-sm text-green-400">Bạn có thể chỉnh sửa thông tin bên dưới nếu cần</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-green-300">Họ và tên</label>
            <input 
              type="text" 
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Nhập họ tên" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Số điện thoại</label>
            <input 
              type="text" 
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="Nhập số điện thoại" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Địa chỉ giao hàng</label>
            <input 
              type="text" 
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Nhập địa chỉ" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Hình thức thanh toán</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                Thanh toán khi nhận hàng (COD)
              </label>
              <label className="flex items-center gap-2 text-white">
                <input type="radio" name="payment" value="vnpay" checked={payment === "vnpay"} onChange={() => setPayment("vnpay")} />
                VNPay
              </label>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Sản phẩm</label>
            <ul className="divide-y divide-gray-700">
              {cart.map(item => {
                const discounted = getDiscountedPrice(item);
                const hasDiscount = discounted < item.price;
                return (
                  <li key={item.id} className="py-2 flex justify-between items-center text-white">
                    <span>{item.name} x {item.quantity || 1}</span>
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span style={{ color: '#ff4d4f', fontWeight: 700 }}>
                            {discounted.toLocaleString('vi-VN')} ₫
                          </span>
                          <span style={{ textDecoration: 'line-through', color: '#aaa', fontWeight: 400, fontSize: 13 }}>
                            {item.price.toLocaleString('vi-VN')} ₫
                          </span>
                          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>
                            Giảm: {(item.price - discounted).toLocaleString('vi-VN')} ₫
                          </span>
                        </>
                      ) : (
                        <>{(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} ₫</>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="text-right font-bold text-green-400 mt-2">Tổng cộng: {total.toLocaleString("vi-VN")} ₫</div>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button 
            type="submit" 
            className={`w-full font-semibold py-2 px-4 rounded transition ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`} 
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </form>
      </div>
    </main>
  );
} 