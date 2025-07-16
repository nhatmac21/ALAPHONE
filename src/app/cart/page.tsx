"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  brand: string;
  ram: string;
  rom: string;
  screen: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) setCart(JSON.parse(cartData));
  }, []);

  const updateQuantity = (id: number, qty: number) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <main style={{ minHeight: '100vh', background: '#111827', color: '#fff', padding: '32px 0' }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold" style={{ color: '#a3e635', marginBottom: 32, textAlign: 'center' }}>Giỏ hàng</h1>
        {cart.length === 0 ? (
          <div className="text-center" style={{ color: '#94a3b8' }}>Chưa có sản phẩm nào trong giỏ hàng.</div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center rounded-lg shadow p-4 gap-4" style={{ background: '#232b36' }}>
                <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded" />
                <div className="flex-1">
                  <div className="font-semibold" style={{ color: '#a3e635' }}>{item.name}</div>
                  <div className="text-sm" style={{ color: '#fff' }}>{item.price.toLocaleString("vi-VN")} ₫</div>
                  <div className="text-xs" style={{ color: '#94a3b8' }}>RAM: {item.ram} | ROM: {item.rom}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-gray-700 px-2 rounded text-white"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >-</button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity || 1}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="w-12 text-center border rounded bg-gray-800 text-white"
                  />
                  <button
                    className="bg-gray-700 px-2 rounded text-white"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >+</button>
                </div>
                <button
                  className="ml-4 text-red-400 hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center mt-6">
              <div className="text-xl font-bold" style={{ color: '#a3e635' }}>Tổng cộng: {total.toLocaleString("vi-VN")} ₫</div>
              <Link href="/checkout">
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">
                  Tiến hành đặt hàng
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 