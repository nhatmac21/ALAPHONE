"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography, TextField, Button, Snackbar, CircularProgress, Stack } from "@mui/material";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/product/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProduct(data.product);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: any) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          price: Number(product.price),
          brand: product.brand,
          description: product.description,
          stockQuantity: Number(product.stockQuantity),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Cập nhật thành công!" });
        setTimeout(() => router.push("/staff"), 1200);
      } else {
        setSnackbar({ open: true, message: data.message || "Lỗi cập nhật!" });
      }
    } catch {
      setSnackbar({ open: true, message: "Lỗi kết nối server!" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;
  if (!product) return <Typography color="error">Không tìm thấy sản phẩm!</Typography>;

  return (
    <Box maxWidth={500} mx="auto" mt={6} bgcolor="#18232e" p={4} borderRadius={3} boxShadow={6}>
      <Typography variant="h5" fontWeight={700} color="#a3e635" mb={3} align="center">
        Cập nhật sản phẩm
      </Typography>
      <form onSubmit={handleSave}>
        <Stack spacing={2}>
          <TextField label="Tên sản phẩm" name="name" value={product.name || ""} onChange={handleChange} required InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />
          <TextField label="Giá" name="price" type="number" value={product.price || ""} onChange={handleChange} required InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />
          <TextField label="Hãng" name="brand" value={product.brand || ""} onChange={handleChange} required InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />
          <TextField label="Mô tả" name="description" value={product.description || ""} onChange={handleChange} multiline minRows={2} InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ textarea: { color: '#fff' }, input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />
          <TextField label="Tồn kho" name="stockQuantity" type="number" value={product.stockQuantity || 0} onChange={handleChange} required InputLabelProps={{ style: { color: '#a3e635' } }} sx={{ input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#a3e635' }, bgcolor: '#232b36' }} />
          <Button type="submit" variant="contained" color="success" size="large" disabled={saving} sx={{ fontWeight: 700, borderRadius: 2, fontSize: 18 }}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{ style: { background: '#22c55e', color: '#fff', fontWeight: 700 } }}
      />
    </Box>
  );
} 