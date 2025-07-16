"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role?: string; // Added role to User interface
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!phone || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        // Đảm bảo user có trường id (id = UserID)
        const userToSave = { ...data.user, id: (data.user as any).UserID ?? data.user.id };
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(userToSave));
        // Chuyển hướng theo role
        if (data.user.role === 'staff') {
          router.push('/staff');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra khi đăng nhập!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Đăng nhập</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Số điện thoại</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Mật khẩu</label>
              <input 
                type="password" 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button 
              type="submit" 
              className={`w-full font-semibold py-2 px-4 rounded transition ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 