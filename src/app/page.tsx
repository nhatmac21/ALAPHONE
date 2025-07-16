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
  productvariant: ProductVariant[];
  promoCodes?: {
    id: number;
    promotion: {
      type: 'percentage' | 'fixed';
      value: number;
    };
    limit: number;
    used: number;
  }[];
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
  const [imgIndexes, setImgIndexes] = useState<{[key:number]:number}>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

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

  // Lọc sản phẩm theo tên hoặc hãng
  const filteredProducts = (products || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  function buyNow(product: Product) {
    const cart = [{ ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/checkout";
  }

  return (
    <main className="min-h-screen" style={{ background: '#111827', color: '#fff' }}>
      <div className="container mx-auto px-4">
        {user && (
          <Box bgcolor="#18232e" borderRadius={4} p={3} mb={4} maxWidth={420} mx="auto" boxShadow={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Box bgcolor="#a3e63522" borderRadius="50%" width={64} height={64} display="flex" alignItems="center" justifyContent="center" mb={1}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#a3e635" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" />
                <ellipse cx="12" cy="17" rx="7" ry="4" />
              </svg>
            </Box>
            <Typography fontWeight={800} fontSize={22} color="#a3e635" align="center">
              Chào mừng, {user.fullName || user.name || user.userName || ''}!
            </Typography>
            <Typography fontSize={15} color="#fff" align="center" mb={1}>
              Số điện thoại: <span style={{ color: '#a3e635' }}>{user.phone}</span>
            </Typography>
            <Link href="/order">
              <Button variant="contained" color="success" sx={{ fontWeight: 700, borderRadius: 3, px: 4, py: 1.2, fontSize: 16, background: 'linear-gradient(90deg,#22c55e,#4ade80)', color: 'white', '&:hover': { background: 'linear-gradient(90deg,#4ade80,#22c55e)' } }}>
                XEM LỊCH SỬ ĐƠN HÀNG
              </Button>
            </Link>
          </Box>
        )}
        <Typography variant="h4" fontWeight={700} color="primary" align="center" mb={4}>
          Danh sách điện thoại
        </Typography>
        <Box mb={3} display="flex" justifyContent="center">
          <TextField
            label="Tìm kiếm sản phẩm..."
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 350, input: { color: '#fff' }, label: { color: '#a3e635' }, fieldset: { borderColor: '#22c55e' } }}
            InputLabelProps={{ style: { color: '#a3e635' } }}
          />
        </Box>
        {loading ? (
          <Typography align="center" color="#fff">Đang tải dữ liệu...</Typography>
        ) : (
          <>
          <Box display="grid" gridTemplateColumns={{xs:'1fr',sm:'1fr 1fr',md:'1fr 1fr 1fr',lg:'1fr 1fr 1fr 1fr'}} gap={3}>
            {filteredProducts.map((p) => {
              const v = p.productvariant?.[0];
              const images = v?.images && v.images.length > 0 ? v.images : v?.image ? [v.image] : [];
              const imgIdx = imgIndexes[p.ProductID] || 0;
              // Lấy promoCode đầu tiên (ưu tiên)
              const promoCode = p.promoCodes && p.promoCodes[0];
              let discount = 0;
              let priceAfter = p.price;
              let discountType = '';
              let promoText = '';
              let slotText = '';
              if (promoCode && promoCode.promotion) {
                discount = Number(promoCode.promotion.value);
                discountType = promoCode.promotion.type;
                if (discountType === 'percentage') {
                  priceAfter = Math.round(Number(p.price) * (1 - discount / 100));
                  promoText = `-${discount}%`;
                } else {
                  priceAfter = Math.max(0, Number(p.price) - discount);
                  promoText = `-${discount.toLocaleString('vi-VN')}đ`;
                }
                // slotText = `Còn ${promoCode.limit - promoCode.used}/${promoCode.limit} suất`;
              }
              return (
                <Link key={p.ProductID} href={`/product/${p.ProductID}`} style={{ textDecoration: 'none' }}>
                  <Card sx={{ boxShadow: 6, borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 12, transform: 'scale(1.03)' }, display: 'flex', flexDirection: 'column', minHeight: 480, height: 480, background: '#1e293b', color: '#fff' }}>
                    <Box position="relative" bgcolor="#0f172a">
                      {images.length > 1 && (
                        <IconButton onClick={() => handlePrevImg(p.ProductID, images)} sx={{ position: 'absolute', top: '50%', left: 8, zIndex: 2, bgcolor: 'white', '&:hover': { bgcolor: '#bbf7d0' } }} size="small">
                          <ChevronLeftIcon />
                        </IconButton>
                      )}
                      <CardMedia
                        component="img"
                        height="200"
                        image={images[imgIdx] || "/no-image.png"}
                        alt={p.name}
                        sx={{ objectFit: 'cover', width: '100%', height: 200, background: '#fff', borderRadius: 2, boxShadow: 1 }}
                      />
                      {images.length > 1 && (
                        <IconButton onClick={() => handleNextImg(p.ProductID, images)} sx={{ position: 'absolute', top: '50%', right: 8, zIndex: 2, bgcolor: 'white', '&:hover': { bgcolor: '#bbf7d0' } }} size="small">
                          <ChevronRightIcon />
                        </IconButton>
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                      <div>
                        <Typography variant="h6" fontWeight={700} color="primary" mb={1}>{p.name}</Typography>
                        {/* Block giảm giá nổi bật */}
                        {promoCode && promoCode.promotion && (
                          <Box mb={1} p={1.2} borderRadius={2} bgcolor="#f8fff8" border="2px solid #4caf50" boxShadow={2} display="flex" alignItems="center" gap={1}>
                            <LocalFireDepartmentIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                            <Typography variant="h6" fontWeight={800} color="error" mr={1} fontSize={18}>
                              {priceAfter.toLocaleString('vi-VN')}₫
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              {Number(p.price).toLocaleString('vi-VN')}₫
                            </Typography>
                            <Typography variant="body2" color="error" fontWeight={700} ml={1}>{promoText}</Typography>
                            {slotText && (
                              <Typography variant="body2" color="warning.main" fontWeight={700} ml={1}>{slotText}</Typography>
                            )}
                          </Box>
                        )}
                        {/* End block giảm giá */}
                        <Typography variant="h5" fontWeight={800} color="success.main" mb={1} fontSize={20}>{p.price?.toLocaleString("vi-VN")} ₫</Typography>
                        <Typography fontSize={13} color="#fff" mb={0.5}>Hãng: {p.brand}</Typography>
                        <Typography fontSize={13} color="#fff" mb={0.5}>RAM: {v?.RAM || "-"} | ROM: {v?.ROM || "-"}</Typography>
                        <Typography fontSize={13} color="#fff" mb={0.5}>Màu sắc: {v?.color || "-"}</Typography>
                      </div>
                      <Box mt={2} display="flex" justifyContent="center" gap={1}>
                        <Button variant="contained" color="primary" size="medium" sx={{ fontWeight: 700, boxShadow: 4, borderRadius: 2, minWidth: 90, fontSize: 14, px: 2, py: 1, letterSpacing: 1, background: 'linear-gradient(90deg,#22c55e,#4ade80,#22d3ee)', color: 'white', '&:hover': { background: 'linear-gradient(90deg,#22d3ee,#4ade80,#22c55e)' } }} onClick={e => { e.preventDefault(); addToCart(p); }}>
                          Thêm vào giỏ hàng
                        </Button>
                        <Button variant="outlined" color="success" size="medium" sx={{ fontWeight: 700, borderRadius: 2, minWidth: 90, fontSize: 14, px: 2, py: 1, letterSpacing: 1, borderColor: '#22c55e', color: '#22c55e', '&:hover': { background: '#bbf7d0', borderColor: '#22c55e' } }} onClick={e => { e.preventDefault(); buyNow(p); }}>
                          Mua ngay
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </Box>
          {/* Pagination UI */}
          <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
            <Button variant="outlined" color="success" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
            {Array.from({length: Math.ceil(total / pageSize)}, (_, i) => i + 1).map(pn => (
              <Button key={pn} variant={pn === page ? "contained" : "outlined"} color="success" onClick={() => setPage(pn)}>{pn}</Button>
            ))}
            <Button variant="outlined" color="success" disabled={page === Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)}>Sau</Button>
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
