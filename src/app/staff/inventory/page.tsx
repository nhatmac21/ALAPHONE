"use client";
import React, { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';

interface ProductVariant {
  VariantID: number;
  color: string;
  RAM: string;
  ROM: string;
  product: { name: string };
}

interface User {
  id: number;
  role: string;
  fullName?: string;
  userName?: string;
}

export default function StaffInventoryPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selected, setSelected] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        // Flatten all variants with product name
        const allVariants: ProductVariant[] = [];
        data.forEach((p: any) => {
          (p.productvariant || []).forEach((v: any) => {
            allVariants.push({ ...v, product: { name: p.name } });
          });
        });
        setVariants(allVariants);
      });
    // Lấy user từ localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (!user || user.role !== 'staff') {
      setError("Bạn không có quyền nhập kho!");
      return;
    }
    if (!selected || !quantity || quantity <= 0) {
      setError("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: user.id, variantID: selected.VariantID, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Nhập kho thành công!", type: 'success' });
        setQuantity(1);
        setSelected(null);
      } else {
        setSnackbar({ open: true, message: data.message || "Lỗi nhập kho!", type: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: "Lỗi kết nối server!", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6} bgcolor="#18232e" p={4} borderRadius={3} boxShadow={6}>
      <Typography variant="h5" fontWeight={700} color="#a3e635" mb={3} align="center">
        Nhập kho sản phẩm (Staff)
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Autocomplete
            options={variants}
            getOptionLabel={v => `${v.product.name} - ${v.RAM}/${v.ROM} - ${v.color}`}
            value={selected}
            onChange={(_, v) => setSelected(v)}
            renderInput={(params) => <TextField {...params} label="Chọn sản phẩm" required InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />}
            isOptionEqualToValue={(a, b) => a?.VariantID === b?.VariantID}
          />
          <TextField
            label="Số lượng nhập kho"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
            required
            InputLabelProps={{ style: { color: '#a3e635' } }}
            sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }}
          />
          <Button type="submit" variant="contained" color="success" size="large" disabled={loading} sx={{ fontWeight: 700, borderRadius: 2, fontSize: 18 }}>
            {loading ? "Đang nhập..." : "Nhập kho"}
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{ style: { background: snackbar.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 } }}
      />
    </Box>
  );
} 