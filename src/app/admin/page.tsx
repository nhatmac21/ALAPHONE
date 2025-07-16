"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

interface User {
  UserID: number;
  userName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: string;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [error, setError] = useState("");
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Chỉ cho phép admin truy cập
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "admin" && user.role !== "ADMIN") {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
  }, [router]);

  // Lấy danh sách user
  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        else setError(data.message || "Không lấy được user");
      })
      .catch(() => setError("Lỗi kết nối server!"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleOpen = (user?: User) => {
    setEditUser(user || null);
    setForm(user || {});
    setOpen(true);
    setError("");
  };
  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setForm({});
    setError("");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async () => {
    setError("");
    if (!form.userName || !form.fullName || !form.phone) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập, họ tên, số điện thoại!");
      return;
    }
    const method = editUser ? "PUT" : "POST";
    const res = await fetch("/api/user", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editUser ? { ...form, UserID: editUser.UserID } : form),
    });
    const data = await res.json();
    if (data.success) handleClose();
    else setError(data.message || "Lỗi lưu user!");
  };

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Typography color="error" fontSize={22} fontWeight={700}>Bạn không có quyền truy cập trang này!</Typography>
      </main>
    );
  }
  if (isAdmin === null) return null;

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Typography variant="h4" fontWeight={700} color="primary" align="center" mb={4}>
          Quản lý người dùng (Admin)
        </Typography>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="contained" color="success" onClick={() => handleOpen()}>
            Thêm người dùng
          </Button>
        </Box>
        {loading ? (
          <Typography align="center" color="#fff">Đang tải dữ liệu...</Typography>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Tên đăng nhập</b></TableCell>
                  <TableCell><b>Họ tên</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>SĐT</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                  <TableCell><b>Địa chỉ</b></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.UserID}>
                    <TableCell>{u.UserID}</TableCell>
                    <TableCell>{u.userName}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.address}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="primary" size="small" onClick={() => handleOpen(u)}>
                        Sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField label="Tên đăng nhập" name="userName" value={form.userName || ""} onChange={handleChange} fullWidth required />
              <TextField label="Họ tên" name="fullName" value={form.fullName || ""} onChange={handleChange} fullWidth required />
              <TextField label="Email" name="email" value={form.email || ""} onChange={handleChange} fullWidth />
              <TextField label="Số điện thoại" name="phone" value={form.phone || ""} onChange={handleChange} fullWidth required />
              <TextField label="Role" name="role" value={form.role || "customer"} onChange={handleChange} fullWidth />
              <TextField label="Địa chỉ" name="address" value={form.address || ""} onChange={handleChange} fullWidth />
              {error && <Typography color="error">{error}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button variant="contained" color="success" onClick={handleSubmit}>{editUser ? "Lưu" : "Tạo mới"}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </main>
  );
} 