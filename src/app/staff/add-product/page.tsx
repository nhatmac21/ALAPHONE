"use client";
import React, { useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';

// Sửa type cho variant
interface Variant {
  color: string;
  storage: string;
  RAM: string;
  ROM: string;
  image: string;
  file?: File; // Thêm thuộc tính file
}

const emptyVariant: Variant = { color: '', storage: '', RAM: '', ROM: '', image: '', file: undefined };

export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: '', brand: '', warranty: ''
  });
  const [variants, setVariants] = useState<Variant[]>([{ ...emptyVariant }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Sửa lại hàm handleVariantChange để nhận cả input và textarea
  const handleVariantChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "file") return; // Không xử lý file ở đây
    const newVariants = [...variants];
    newVariants[idx][name as keyof Omit<Variant, "file">] = value;
    setVariants(newVariants);
  };

  // Thêm hàm xử lý file input cho biến thể
  const handleVariantFileChange = (idx: number, file?: File) => {
    const newVariants = [...variants];
    newVariants[idx].file = file;
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { ...emptyVariant }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); setError('');
    // Validate
    if (!product.name || !product.price || !product.stockQuantity || !product.category || !product.brand) {
      setError('Vui lòng nhập đầy đủ thông tin sản phẩm chính!');
      return;
    }
    if (variants.some(v => !v.color || !v.storage || !v.RAM || !v.ROM || (!v.image && !v.file))) {
      setError('Vui lòng nhập đầy đủ thông tin cho tất cả biến thể!');
      return;
    }
    setLoading(true);
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) throw new Error('Chưa đăng nhập!');
      const user = JSON.parse(userData);
      const uploadedVariants = await Promise.all(variants.map(async (v) => {
        let imageUrl = v.image;
        if (v.file) {
          const formData = new FormData();
          formData.append('file', v.file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error('Lỗi upload ảnh! ' + (err.error || res.statusText));
          }
          const data = await res.json();
          if (!data.url) throw new Error('Lỗi upload ảnh!');
          imageUrl = data.url;
        }
        return { ...v, image: imageUrl, file: undefined };
      }));
      const res = await fetch('/api/product/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: user.id || user.UserID,
          product: {
            ...product,
            price: Number(product.price),
            stockQuantity: Number(product.stockQuantity),
            warranty: product.warranty || undefined,
          },
          variants: uploadedVariants,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Thêm sản phẩm thành công!');
        setProduct({ name: '', description: '', price: '', stockQuantity: '', category: '', brand: '', warranty: '' });
        setVariants([{ ...emptyVariant }]);
      } else {
        setError(data.message || 'Lỗi thêm sản phẩm!');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6} bgcolor="#fff" p={4} borderRadius={3} boxShadow={6}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={3} align="center">
        Thêm sản phẩm mới (Staff)
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField label="Tên sản phẩm" name="name" value={product.name} onChange={handleProductChange} required fullWidth />
          <TextField label="Mô tả" name="description" value={product.description} onChange={handleProductChange} multiline rows={2} fullWidth />
          <Stack direction={{xs:'column',sm:'row'}} spacing={2}>
            <TextField label="Giá" name="price" value={product.price} onChange={handleProductChange} type="number" required fullWidth />
            <TextField label="Tồn kho" name="stockQuantity" value={product.stockQuantity} onChange={handleProductChange} type="number" required fullWidth />
          </Stack>
          <Stack direction={{xs:'column',sm:'row'}} spacing={2}>
            <TextField label="Danh mục" name="category" value={product.category} onChange={handleProductChange} required fullWidth />
            <TextField label="Hãng" name="brand" value={product.brand} onChange={handleProductChange} required fullWidth />
          </Stack>
          <TextField label="Bảo hành (yyyy-mm-dd)" name="warranty" value={product.warranty} onChange={handleProductChange} fullWidth />
          <Box>
            <Typography fontWeight={600} color="primary" mb={1}>Biến thể sản phẩm</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 8 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Màu sắc</th>
                    <th style={{ textAlign: 'left' }}>Bộ nhớ</th>
                    <th style={{ textAlign: 'left' }}>RAM</th>
                    <th style={{ textAlign: 'left' }}>ROM</th>
                    <th style={{ textAlign: 'left' }}>Ảnh</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={idx}>
                      <td>
                        <TextField label="Màu sắc" placeholder="Màu sắc" name="color" value={v.color} onChange={e => handleVariantChange(idx, e)} required fullWidth size="small" />
                      </td>
                      <td>
                        <TextField label="Bộ nhớ" placeholder="Bộ nhớ" name="storage" value={v.storage} onChange={e => handleVariantChange(idx, e)} required fullWidth size="small" />
                      </td>
                      <td>
                        <TextField label="RAM" placeholder="RAM" name="RAM" value={v.RAM} onChange={e => handleVariantChange(idx, e)} required fullWidth size="small" />
                      </td>
                      <td>
                        <TextField label="ROM" placeholder="ROM" name="ROM" value={v.ROM} onChange={e => handleVariantChange(idx, e)} required fullWidth size="small" />
                      </td>
                      <td>
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{ minWidth: 80, fontSize: 12, p: 0.5 }}
                          >
                            {v.file ? "Đã chọn" : "Chọn ảnh"}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={e => handleVariantFileChange(idx, e.target.files?.[0])}
                            />
                          </Button>
                          {v.file && (
                            <Typography variant="caption" display="block" mt={0.5}>
                              {v.file.name}
                            </Typography>
                          )}
                          {v.file && (
                            <Box mt={0.5}>
                              <img
                                src={URL.createObjectURL(v.file)}
                                alt="preview"
                                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                              />
                            </Box>
                          )}
                          {!v.file && (
                            <TextField
                              label="URL"
                              placeholder="URL ảnh"
                              name="image"
                              value={v.image}
                              onChange={e => handleVariantChange(idx, e)}
                              size="small"
                              fullWidth
                            />
                          )}
                        </Box>
                      </td>
                      <td>
                        <IconButton color="error" onClick={() => removeVariant(idx)} disabled={variants.length === 1}><DeleteIcon /></IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <Button onClick={addVariant} variant="outlined" color="primary" sx={{ mt: 1 }}>+ Thêm biến thể</Button>
          </Box>
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
            {loading ? "Đang thêm..." : "Thêm sản phẩm"}
          </Button>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </form>
    </Box>
  );
} 