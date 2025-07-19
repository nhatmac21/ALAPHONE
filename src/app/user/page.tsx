"use client";
import { useEffect, useState } from "react";
import { TextField, Button, Box, Typography, MenuItem, Snackbar } from "@mui/material";

interface User {
  UserID: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthDate?: string;
  gender?: string;
}

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setForm({
        UserID: u.UserID,
        userName: u.userName,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        address: u.address,
        birthDate: u.birthDate || '',
        gender: u.gender || '',
      });
    }
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Xử lý birthDate: nếu rỗng thì không gửi lên, nếu có thì chuyển thành ISO string
      const submitForm = { ...form };
      if (!submitForm.birthDate) {
        delete submitForm.birthDate;
      } else {
        // Nếu birthDate là yyyy-MM-dd thì chuyển sang ISO string
        if (/^\d{4}-\d{2}-\d{2}$/.test(submitForm.birthDate)) {
          submitForm.birthDate = new Date(submitForm.birthDate).toISOString();
        }
      }
      // Xử lý gender: nếu rỗng thì gửi ''
      if (submitForm.gender === undefined || submitForm.gender === null) submitForm.gender = '';
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setSnackbar({ open: true, message: "Cập nhật thành công!" });
        setUser(updated);
        localStorage.setItem("userData", JSON.stringify(updated));
      } else {
        setSnackbar({ open: true, message: "Cập nhật thất bại!" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Có lỗi xảy ra!" });
    }
    setLoading(false);
  };

  if (!user) return <Typography align="center" mt={8}>Không tìm thấy thông tin người dùng.</Typography>;

  return (
    <Box maxWidth={500} mx="auto" mt={6} bgcolor="#232b36" p={4} borderRadius={4} boxShadow={6}>
      <Typography variant="h5" fontWeight={700} color="#a3e635" mb={3} align="center">Thông tin cá nhân</Typography>
      <TextField label="Họ tên" name="fullName" value={form.fullName || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } } }} />
      <TextField label="Email" name="email" value={form.email || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } } }} />
      <TextField label="Số điện thoại" name="phone" value={form.phone || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } } }} />
      <TextField label="Địa chỉ" name="address" value={form.address || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } } }} />
      <TextField label="Ngày sinh" name="birthDate" type="date" value={form.birthDate ? form.birthDate.slice(0,10) : ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } } }} />
      <TextField select label="Giới tính" name="gender" value={form.gender || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: '#fff' } }} SelectProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#a3e635' }, '&:hover fieldset': { borderColor: '#a3e635' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } }, '& .MuiSelect-select': { color: '#fff' } }}>
        <MenuItem value="">Không xác định</MenuItem>
        <MenuItem value="male">Nam</MenuItem>
        <MenuItem value="female">Nữ</MenuItem>
        <MenuItem value="other">Khác</MenuItem>
      </TextField>
      <Button variant="contained" color="success" fullWidth sx={{ mt: 2, fontWeight: 700 }} onClick={handleSave} disabled={loading}>
        {loading ? "Đang lưu..." : "Lưu thông tin"}
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
} 