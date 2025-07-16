"use client";
import React, { useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function TestLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`Đăng nhập thành công! User: ${data.user.fullName}, Role: ${data.user.role}`);
        // Lưu vào localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        setError(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4} p={3}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={4} align="center">
        Test Đăng nhập
      </Typography>

      <Card sx={{ bgcolor: '#f8fff8' }}>
        <CardContent>
          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ 
                  bgcolor: '#4caf50', 
                  '&:hover': { bgcolor: '#45a049' }
                }}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 