"use client";
import React, { useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function DemoPromotionsPage() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const createStaff = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await fetch('/api/test/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`Tạo staff thành công! Thông tin đăng nhập: Phone: ${data.staff.phone}, Password: 123456`);
      } else {
        setError(data.message || "Lỗi tạo staff!");
      }
    } catch {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await fetch('/api/test/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`Tạo user thành công! Thông tin đăng nhập: Phone: ${data.user.phone}, Password: 123456`);
      } else {
        setError(data.message || "Lỗi tạo user!");
      }
    } catch {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={3}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={4} align="center">
        Demo - Quản lý mã giảm giá
      </Typography>

      <Card sx={{ mb: 4, bgcolor: '#f8fff8' }}>
        <CardContent>
          <Typography variant="h6" color="primary" mb={3}>
            Hướng dẫn sử dụng
          </Typography>
          <Stack spacing={2}>
            <Typography variant="body1">
              1. <strong>Tạo tài khoản staff:</strong> Nhấn nút bên dưới để tạo tài khoản staff test
            </Typography>
            <Typography variant="body1">
              2. <strong>Đăng nhập:</strong> Sử dụng thông tin đăng nhập được cung cấp
            </Typography>
            <Typography variant="body1">
              3. <strong>Truy cập trang quản lý:</strong> Sau khi đăng nhập, click vào tên staff ở header để mở menu
            </Typography>
            <Typography variant="body1">
              4. <strong>Chọn "Quản lý mã giảm giá":</strong> Để truy cập trang quản lý mã giảm giá
            </Typography>
            <Typography variant="body1">
              5. <strong>Tạo mã giảm giá:</strong> Nhấn "Tạo mã giảm giá mới" và điền thông tin
            </Typography>
            <Typography variant="body1">
              6. <strong>Áp dụng cho sản phẩm:</strong> Chọn sản phẩm và mã giảm giá để áp dụng
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={createStaff}
          disabled={loading}
          sx={{ 
            bgcolor: '#4caf50', 
            '&:hover': { bgcolor: '#45a049' },
            px: 4,
            py: 1.5
          }}
        >
          {loading ? "Đang tạo..." : "Tạo tài khoản staff test"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={createUser}
          disabled={loading}
          sx={{ 
            px: 4,
            py: 1.5
          }}
        >
          {loading ? "Đang tạo..." : "Tạo tài khoản user test"}
        </Button>
      </Box>

      <Card sx={{ bgcolor: '#fff3e0' }}>
        <CardContent>
          <Typography variant="h6" color="warning.main" mb={2}>
            Lưu ý quan trọng
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • Tài khoản staff chỉ có thể tạo và quản lý mã giảm giá
            </Typography>
            <Typography variant="body2">
              • Mã giảm giá có thể là phần trăm (%) hoặc số tiền cố định
            </Typography>
            <Typography variant="body2">
              • Mỗi mã giảm giá có thời gian hiệu lực từ ngày bắt đầu đến ngày kết thúc
            </Typography>
            <Typography variant="body2">
              • Staff có thể áp dụng mã giảm giá cho từng sản phẩm cụ thể
            </Typography>
            <Typography variant="body2">
              • Hệ thống sẽ tự động tạo mã code ngẫu nhiên khi áp dụng
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 