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
        
        if (data.user.role === 'admin' || data.user.role === 'ADMIN') {
          window.location.href='/admin';
          
        } else if (data.user.role === 'staff') {
          window.location.href='/staff';
        } else {
          window.location.href='/';
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
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#111827' }}>
      <div className="w-full max-w-md px-4">
        <div style={{ background: '#18232e', borderRadius: 16, boxShadow: '0 4px 32px #0008', padding: 36, border: '2px solid #22c55e' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#a3e635', marginBottom: 28, textAlign: 'center', letterSpacing: 1 }}>Đăng nhập</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={{ color: '#a3e635', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>Số điện thoại</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-lg"
                style={{ background: '#232b36', color: '#fff', borderColor: '#22c55e', outline: 'none', fontWeight: 600 }}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div>
              <label style={{ color: '#a3e635', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: 16 }}>Mật khẩu</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 text-lg"
                style={{ background: '#232b36', color: '#fff', borderColor: '#22c55e', outline: 'none', fontWeight: 600 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
              />
            </div>
            {error && <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 15, marginTop: 2 }}>{error}</div>}
            <button
              type="submit"
              className="w-full font-bold py-2 px-4 rounded transition text-lg"
              style={{ background: isLoading ? '#94a3b8' : 'linear-gradient(90deg,#22c55e,#4ade80)', color: '#fff', boxShadow: '0 2px 8px #22c55e44', cursor: isLoading ? 'not-allowed' : 'pointer', letterSpacing: 1 }}
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