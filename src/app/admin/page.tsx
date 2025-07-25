"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Tabs, Tab } from "@mui/material";
import { useRouter } from "next/navigation";
import LogoutIcon from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';

interface User {
  UserID: number;
  userName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: string;
  isDeleted?: boolean;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0); // Tab index for active/inactive users
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

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

    if (data.success) {
      handleClose();
    } else {
      setError(data.message || "Lỗi lưu user!");
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    const res = await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserID: deleteUser.UserID }),
    });
    const data = await res.json();
    if (data.success) setDeleteUser(null);
    else setError(data.message || "Lỗi xóa user!");
  };

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Typography color="error" fontSize={22} fontWeight={700}>Bạn không có quyền truy cập trang này!</Typography>
      </main>
    );
  }
  if (isAdmin === null) return null;

  const activeUsers = users.filter(u => !u.isDeleted);
  const inactiveUsers = users.filter(u => u.isDeleted);

  return (
    <Box minHeight="100vh" bgcolor="#111827">
      <Box
        sx={{
          width: 240,
          bgcolor: "#18232e",
          color: "#fff",
          p: 3,
          boxShadow: 6,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10
        }}
      >
        <Box>
          <Typography fontWeight={900} fontSize={24} color="#a3e635" mb={4} textAlign="center">Admin Panel</Typography>
          <Button
            startIcon={<GroupIcon />}
            fullWidth
            sx={{
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 400,
              mb: 2,
              bgcolor: '#4d8536',
              fontSize: 22,
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': { bgcolor: '#357a38' }
            }}
            disabled
          >
            Quản lý người dùng
          </Button>
        </Box>
        <Button startIcon={<LogoutIcon />} fullWidth sx={{ color: '#ef4444', fontWeight: 700, mt: 2, bgcolor: '#232b36' }} onClick={() => { localStorage.clear(); router.replace('/login'); }}>
          Đăng xuất
        </Button>
      </Box>
      <Box
        sx={{
          ml: { xs: 0, md: '240px' },
          p: { xs: 1, sm: 2, md: 4 },
          maxWidth: 1200,
          margin: '0 auto',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h4" fontWeight={700} color="#a3e635" align="center" mb={4}>
          Quản lý người dùng (Admin)
        </Typography>
       <Tabs
  value={tabIndex}
  onChange={(e, newValue) => setTabIndex(newValue)}
  centered
  textColor="inherit"
  TabIndicatorProps={{ style: { backgroundColor: '#66BB6A' } }} // nếu muốn màu gạch dưới
>
  <Tab
    label="Hoạt động"
    sx={{
      color: tabIndex === 0 ? '#66BB6A' : 'white',
      fontWeight: 'bold'
    }}
  />
  <Tab
    label="Ngừng hoạt động"
    sx={{
      color: tabIndex === 1 ? '#66BB6A' : 'white',
      fontWeight: 'bold'
    }}
  />
</Tabs>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          {tabIndex === 0 && (
            <Button variant="contained" color="success" onClick={() => handleOpen()}>
              Thêm người dùng
            </Button>
          )}
        </Box>
        {loading ? (
          <Typography align="center" color="#fff">Đang tải dữ liệu...</Typography>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, maxWidth: '100%', overflowX: 'auto', mx: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Tên đăng nhập</b></TableCell>
                  <TableCell><b>Họ tên</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>SĐT</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                  <TableCell><b>Địa chỉ</b></TableCell>
                  {tabIndex === 0 && <TableCell></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {(tabIndex === 0 ? activeUsers : inactiveUsers).map(u => (
                  <TableRow key={u.UserID}>
                    <TableCell>{u.UserID}</TableCell>
                    <TableCell>{u.userName}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.address}</TableCell>
                    {tabIndex === 0 && (
                      <TableCell>
                        <Button variant="outlined" color="primary" size="small" onClick={() => handleOpen(u)}>
                          Sửa
                        </Button>
                        <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => setDeleteUser(u)}>
                          Ngừng hoạt động
                        </Button>
                      </TableCell>
                    )}
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
        <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
          <DialogTitle>Xác nhận ngừng hoạt động người dùng</DialogTitle>
          <DialogContent>Bạn có chắc chắn muốn ngừng hoạt động user "{deleteUser?.userName}"?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteUser(null)}>Hủy</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>Xác nhận</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}