"use client";
import React, { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Snackbar from '@mui/material/Snackbar';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';

interface ProductVariant {
  VariantID: number;
  image: string;
  RAM: string;
  ROM: string;
  color: string;
  images?: string[]; // hỗ trợ nhiều ảnh
}

interface Product {
  ProductID: number;
  name: string;
  price: number;
  brand: string;
  stockQuantity: number;
  productvariant: ProductVariant[];
  promoCodes?: {
    id: number;
    promotion: {
      type: 'percentage' | 'fixed';
      value: number;
    };
    limit: number;
    used: number;
    userID: number | null;
  }[];
  category?: string;
}

interface User {
  id: number;
  name?: string;
  phone: string;
  email?: string;
  fullName?: string;
  userName?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [imgIndexes, setImgIndexes] = useState<{ [key: number]: number }>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Điện thoại', 'Laptop', 'Tablet'];
  const brands = ['Tất cả', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products.map((p: any) => ({ ...p, id: p.ProductID })) : []);
        setTotal(data.total || 0);
        setLoading(false);
      });
    const cartData = localStorage.getItem("cart");
    if (cartData) setCart(JSON.parse(cartData));
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {}
    }
  }, [page, pageSize]);

  const addToCart = (product: Product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setSnackbar({ open: true, message: "Đã thêm vào giỏ hàng!" });
  };

  const handlePrevImg = (pid: number, images: string[]) => {
    setImgIndexes(prev => ({
      ...prev,
      [pid]: prev[pid] > 0 ? prev[pid] - 1 : images.length - 1
    }));
  };
  const handleNextImg = (pid: number, images: string[]) => {
    setImgIndexes(prev => ({
      ...prev,
      [pid]: prev[pid] < images.length - 1 ? prev[pid] + 1 : 0
    }));
  };

  const filteredProducts = (products || []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchBrand = selectedBrand === 'Tất cả' || p.brand === selectedBrand;
    const matchCategory = selectedCategory === 'Tất cả' || (p.category === selectedCategory);
    return matchSearch && matchBrand && matchCategory;
  });

  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  function buyNow(product: Product) {
    const cart = [{ ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/checkout";
  }

  return (
    <main className="min-h-screen" style={{ background: '#111827', color: '#fff' }}>
      <div className="container mx-auto px-4">
        <Typography variant="h4" fontWeight={700} color="primary" align="center" mb={4}>
          Danh sách sản phẩm
        </Typography>
        <Box mb={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="center" gap={2}>
          <TextField
            label="Tìm kiếm sản phẩm..."
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 250, input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#22c55e' } }}
            InputLabelProps={{ style: { color: '#a3e635' } }}
          />
          <TextField
            select
            label="Danh mục"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            sx={{
              width: 150,
              background: '#1e293b',
              borderRadius: 2,
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiSelect-icon': { color: '#a3e635' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#22c55e' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a3e635' },
              '& .MuiInputLabel-root': { color: '#a3e635' }
            }}
            SelectProps={{
              native: true,
              sx: {
                color: '#fff',
                background: '#1e293b',
              }
            }}
            InputLabelProps={{ style: { color: '#a3e635' } }}
          >
            {categories.map(c => <option key={c} value={c} style={{ color: '#fff', background: '#1e293b' }}>{c}</option>)}
          </TextField>
          <TextField
            select
            label="Hãng"
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            sx={{
              width: 150,
              background: '#1e293b',
              borderRadius: 2,
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiSelect-icon': { color: '#a3e635' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#22c55e' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a3e635' },
              '& .MuiInputLabel-root': { color: '#a3e635' }
            }}
            SelectProps={{
              native: true,
              sx: {
                color: '#fff',
                background: '#1e293b',
              }
            }}
            InputLabelProps={{ style: { color: '#a3e635' } }}
          >
            {brands.map(b => <option key={b} value={b} style={{ color: '#fff', background: '#1e293b' }}>{b}</option>)}
          </TextField>
        </Box>
        {loading ? (
          <Typography align="center" color="#fff">Đang tải dữ liệu...</Typography>
        ) : (
          <>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }} gap={3}>
              {pagedProducts.map((p) => {
                const v = p.productvariant?.[0];
                const images = v?.images && v.images.length > 0 ? v.images : v?.image ? [v.image] : [];
                const imgIdx = imgIndexes[p.ProductID] || 0;
                const promoCode = p.promoCodes?.find(pc => pc.userID === null || pc.userID === user?.id);
                let discount = 0;
                let priceAfter = p.price;
                let promoText = '';
                if (promoCode && promoCode.promotion) {
                  discount = Number(promoCode.promotion.value);
                  if (promoCode.promotion.type === 'percentage') {
                    priceAfter = Math.round(Number(p.price) * (1 - discount / 100));
                    promoText = `-${discount}%`;
                  } else {
                    priceAfter = Math.max(0, Number(p.price) - discount);
                    promoText = `-${discount.toLocaleString('vi-VN')}đ`;
                  }
                }
                return (
                  <Link key={p.ProductID} href={`/product/${p.ProductID}`} style={{ textDecoration: 'none' }}>
                    <Card sx={{ boxShadow: 6, borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 12, transform: 'scale(1.03)' }, display: 'flex', flexDirection: 'column', minHeight: 480, height: 480, background: '#1e293b', color: '#fff' }}>
                      <Box position="relative" bgcolor="#0f172a">
                        {promoCode && promoCode.promotion && (
                          <Box position="absolute" top={8} left={8} zIndex={3} bgcolor="#fff8e1" borderRadius={2} px={1.2} py={0.5} boxShadow={2} display="flex" alignItems="center" gap={0.5}>
                            <LocalFireDepartmentIcon sx={{ color: '#ff9800', fontSize: 18 }} />
                            <Typography fontWeight={800} color="error" fontSize={15}>
                              {priceAfter.toLocaleString('vi-VN')}₫
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: 13, ml: 0.5 }}>
                              {Number(p.price).toLocaleString('vi-VN')}₫
                            </Typography>
                            <Typography variant="body2" color="error" fontWeight={700} ml={0.5} fontSize={13}>{promoText}</Typography>
                          </Box>
                        )}
                        {images.length > 1 && (
                          <IconButton onClick={() => handlePrevImg(p.ProductID, images)} sx={{ position: 'absolute', top: '50%', left: 8, zIndex: 2, bgcolor: 'white', '&:hover': { bgcolor: '#bbf7d0' } }} size="small">
                            <ChevronLeftIcon />
                          </IconButton>
                        )}
                        <CardMedia
                          component="img"
                          height="240"
                          image={images[imgIdx] || "/no-image.png"}
                          alt={p.name}
                          sx={{ objectFit: 'contain', width: '100%', height: 240, background: '#1e293b', borderRadius: 3, boxShadow: 1, p: 1 }}
                        />
                        {images.length > 1 && (
                          <IconButton onClick={() => handleNextImg(p.ProductID, images)} sx={{ position: 'absolute', top: '50%', right: 8, zIndex: 2, bgcolor: 'white', '&:hover': { bgcolor: '#bbf7d0' } }} size="small">
                            <ChevronRightIcon />
                          </IconButton>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2, mt: 0.5 }}>
                        <div>
                          <Typography variant="h6" fontWeight={700} color="primary" mb={1}>{p.name}</Typography>
                          <Typography variant="h5" fontWeight={800} color="success.main" mb={1} fontSize={20}>{priceAfter.toLocaleString("vi-VN")} ₫</Typography>
                          <Typography fontSize={13} color="#fff" mb={0.5}>Hãng: {p.brand}</Typography>
                          <Typography fontSize={13} color="#fff" mb={0.5}>RAM: {v?.RAM || "-"} | ROM: {v?.ROM || "-"}</Typography>
                          <Typography fontSize={13} color="#fff" mb={0.5}>Màu sắc: {v?.color || "-"}</Typography>
                          {p.stockQuantity <= 0 ? (
                            <Typography fontSize={13} color="error" mb={0.5}>Hết hàng</Typography>
                          ) : null}
                        </div>
                        {p.stockQuantity > 0 ? (
                          <Box mt={2} display="flex" justifyContent="center" gap={1}>
                            <IconButton color="primary" size="small" sx={{ bgcolor: '#22c55e', color: 'white', '&:hover': { bgcolor: '#16a34a' }, borderRadius: 2 }} onClick={e => { e.preventDefault(); addToCart(p); }} title="Thêm vào giỏ hàng">
                              <AddShoppingCartIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="warning" size="small" sx={{ bgcolor: '#fbbf24', color: 'white', '&:hover': { bgcolor: '#f59e42' }, borderRadius: 2 }} onClick={e => { e.preventDefault(); buyNow(p); }} title="Mua ngay">
                              <FlashOnIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
              <Button variant="outlined" color="success" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
              {Array.from({ length: Math.ceil(filteredProducts.length / pageSize) }, (_, i) => i + 1).map(pn => (
                <Button key={pn} variant={pn === page ? "contained" : "outlined"} color="success" onClick={() => setPage(pn)}>{pn}</Button>
              ))}
              <Button variant="outlined" color="success" disabled={page === Math.ceil(filteredProducts.length / pageSize)} onClick={() => setPage(page + 1)}>Sau</Button>
            </Box>
          </>
        )}
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </main>
  );
}