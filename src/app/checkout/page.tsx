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
  originalPrice?: number; // Supports showing original price
}

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  fullName?: string;
  userName?: string;
  address?: string; // Full saved address
}

interface PromoCode {
  promotion: {
    type: string; // "percentage" or "fixed"
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
  const [specificAddress, setSpecificAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [promoMap, setPromoMap] = useState<{ [pid: number]: PromoCode | null }>({});
  const router = useRouter();

  // Calculate discounted price
  function getDiscountedPrice(item: Product): number {
    const promo = promoMap[item.id];
    if (promo && promo.promotion) {
      const discount = Number(promo.promotion.value);
      if (promo.promotion.type === "percentage") {
        return Math.round(Number(item.price) * (1 - discount / 100));
      } else {
        return Math.max(0, Number(item.price) - discount);
      }
    }
    return Number(item.price);
  }

  // Parse the full address into individual fields
  const parseAddress = (address: string) => {
    const parts = address.split(",").map((part) => part.trim());
    return {
      specificAddress: parts[0] || "",
      ward: parts[1] || "",
      district: parts[2] || "",
      province: parts[3] || "",
    };
  };

  // Load cart and user data
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const cartArr = JSON.parse(cartData).map((item: any) => ({
        ...item,
        id: item.id || item.ProductID,
        price: Number(item.price),
      }));
      setCart(cartArr);
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const userInfo = JSON.parse(userData);
        setUser(userInfo);
        setName(userInfo.fullName || userInfo.name || userInfo.userName || "");
        setPhone(userInfo.phone);

        // Parse the saved address into individual fields (if exists)
        if (userInfo.address) {
          const parsedAddress = parseAddress(userInfo.address);
          setSpecificAddress(parsedAddress.specificAddress);
          setWard(parsedAddress.ward);
          setDistrict(parsedAddress.district);
          setProvince(parsedAddress.province);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch promo codes for products in the cart
  useEffect(() => {
    async function fetchPromos() {
      const map: { [pid: number]: PromoCode | null } = {};
      for (const item of cart) {
        try {
          const res = await fetch(`/api/product/${item.id}`);
          if (!res.ok) throw new Error("Failed to fetch promo data");
          const data = await res.json();
          const promoCodes: PromoCode[] = data.promoCodes || [];
          let promo: PromoCode | null = null;
          if (user) {
            promo =
              promoCodes.find((pc) => pc.userID === user.id) ||
              promoCodes.find((pc) => pc.userID === null) ||
              null;
          } else {
            promo = promoCodes.find((pc) => pc.userID === null) || null;
          }
          map[item.id] = promo;
        } catch (error) {
          console.error("Error fetching promo codes:", error);
        }
      }
      setPromoMap(map);
    }
    if (cart.length > 0) fetchPromos();
  }, [cart, user]);

  const total = cart.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item) * (item.quantity || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !phone || !specificAddress || !ward || !district || !province) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (cart.length === 0) {
      setError("Giỏ hàng trống!");
      return;
    }
    setLoading(true);
    try {
      const fullAddress = `${specificAddress}, ${ward}, ${district}, ${province}`;
      const cartWithDiscount = cart.map((item) => ({
        ...item,
        originalPrice: item.price,
        price: getDiscountedPrice(item),
      }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address: fullAddress, cart: cartWithDiscount, payment }),
      });
      if (res.ok) {
        localStorage.removeItem("cart");
        router.push("/checkout/success");
      } else {
        setError("Đặt hàng thất bại!");
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
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-green-300">Họ và tên</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ tên"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Số điện thoại</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Địa chỉ cụ thể</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
              placeholder="Nhập số nhà, tên đường"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Xã/Phường</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="Nhập xã/phường"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Quận/Huyện</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Nhập quận/huyện"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Tỉnh/Thành phố</label>
            <input
              type="text"
              className="w-full border border-green-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-900 text-white placeholder-gray-400"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Nhập tỉnh/thành phố"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Hình thức thanh toán</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                />
                Thanh toán khi nhận hàng (COD)
              </label>
              
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-300">Sản phẩm</label>
            <ul className="divide-y divide-gray-700">
              {cart.map((item) => {
                const discounted = getDiscountedPrice(item);
                const hasDiscount = discounted < item.price;
                return (
                  <li key={item.id} className="py-2 flex justify-between items-center text-white">
                    <span>
                      {item.name} x {item.quantity || 1}
                    </span>
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span style={{ color: "#ff4d4f", fontWeight: 700 }}>
                            {discounted.toLocaleString("vi-VN")} ₫
                          </span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#aaa",
                              fontWeight: 400,
                              fontSize: 13,
                            }}
                          >
                            {item.price.toLocaleString("vi-VN")} ₫
                          </span>
                          <span
                            style={{
                              color: "#22c55e",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            Giảm: {(item.price - discounted).toLocaleString("vi-VN")} ₫
                          </span>
                        </>
                      ) : (
                        <>{(item.price * (item.quantity || 1)).toLocaleString("vi-VN")} ₫</>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="text-right font-bold text-green-400 mt-2">
              Tổng cộng: {total.toLocaleString("vi-VN")} ₫
            </div>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className={`w-full font-semibold py-2 px-4 rounded transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
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