"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Rating from '@mui/material/Rating';
import Snackbar from '@mui/material/Snackbar';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [variantIdx, setVariantIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetch(`/api/product/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product);
        setPromoCodes(data.promoCodes || []);
        setReviews(data.reviews || []);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Typography align="center" mt={8}>Đang tải chi tiết sản phẩm...</Typography>;
  if (!product) return <Typography align="center" mt={8} color="error">Không tìm thấy sản phẩm!</Typography>;

  const variants = product.productvariant || [];
  const variant = variants[variantIdx] || {};

  // Lấy promoCode đầu tiên (ưu tiên), có thể mở rộng chọn nhiều
  const promoCode = promoCodes[0];
  let discount = 0;
  let priceAfter = Number(product.price);
  let discountType = '';
  let promoText = '';
  let timeText = '';
  let slotText = '';
  if (promoCode && promoCode.promotion) {
    discount = Number(promoCode.promotion.value);
    discountType = promoCode.promotion.type;
    if (discountType === 'percentage') {
      priceAfter = Math.round(Number(product.price) * (1 - discount / 100));
      promoText = `-${discount}%`;
    } else {
      priceAfter = Math.max(0, Number(product.price) - discount);
      promoText = `-${discount.toLocaleString('vi-VN')}đ`;
    }
    // Thời gian áp dụng
    const start = new Date(promoCode.promotion.startDate).toLocaleDateString('vi-VN');
    const end = new Date(promoCode.promotion.endDate).toLocaleDateString('vi-VN');
    timeText = `Chương trình áp dụng từ ${start} đến ${end}`;
  }

  // Tính toán thống kê đánh giá
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1) : 0;
  const ratingCounts = [5,4,3,2,1].map(star => reviews.filter(r => r.rating === star).length);

  const addToCart = () => {
    const cartData = localStorage.getItem("cart");
    let cart = [];
    try { cart = cartData ? JSON.parse(cartData) : []; } catch { cart = []; }
    const item = {
      ProductID: product.ProductID,
      id: product.ProductID,
      name: product.name,
      price: priceAfter,
      brand: product.brand,
      image: variant.image,
      ram: variant.RAM,
      rom: variant.ROM,
      color: variant.color,
      screen: product.screen,
      quantity: 1,
    };
    const idx = cart.findIndex((p: any) => p.id === item.id && p.color === item.color && p.ram === item.ram && p.rom === item.rom);
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push(item);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setSnackbar({ open: true, message: "Đã thêm vào giỏ hàng!" });
  };

  const buyNow = () => {
    const cart = [{
      ProductID: product.ProductID,
      id: product.ProductID,
      name: product.name,
      price: priceAfter,
      brand: product.brand,
      image: variant.image,
      ram: variant.RAM,
      rom: variant.ROM,
      color: variant.color,
      screen: product.screen,
      quantity: 1,
    }];
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/checkout";
  };

  return (
    <main style={{ background: '#111827', color: '#fff', minHeight: '100vh' }}>
      <Box maxWidth={900} mx="auto" mt={0} bgcolor="#18232e" p={4} borderRadius={3} boxShadow={6}>
        <Stack direction={{xs:'column',md:'row'}} spacing={4}>
          <Box flex={1}>
            <Card sx={{ mb: 2, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="320"
                image={variant.image || "/no-image.png"}
                alt={product.name}
                sx={{ objectFit: 'contain', background: '#f0fdf4' }}
              />
            </Card>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {variants.map((v: any, idx: number) => (
                <Chip
                  key={idx}
                  label={`${v.color || ''} ${v.RAM || ''}/${v.ROM || ''}`}
                  color={idx === variantIdx ? 'primary' : 'default'}
                  onClick={() => setVariantIdx(idx)}
                  sx={{ mb: 1, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
          <Box flex={2}>
            <Typography variant="h5" fontWeight={700} color="primary" mb={2}>{product.name}</Typography>
            {promoCode && promoCode.promotion && (
              <Box mb={2} p={2} borderRadius={2} bgcolor="#f8fff8" border="2px solid #4caf50" boxShadow={2}>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <LocalFireDepartmentIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                  <Typography variant="h4" fontWeight={800} color="error" mr={2}>
                    {priceAfter.toLocaleString('vi-VN')}₫
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {Number(product.price).toLocaleString('vi-VN')}₫
                  </Typography>
                  <Chip label={promoText} color="error" sx={{ fontWeight: 700, fontSize: 18, ml: 2 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" color="success.main" fontWeight={600}>{timeText}</Typography>
                </Stack>
              </Box>
            )}
            <Typography variant="h4" fontWeight={800} color="success.main" mb={2}>{Number(product.price).toLocaleString('vi-VN')} ₫</Typography>
            <Typography mb={1}><b>Hãng:</b> {product.brand}</Typography>
            <Typography mb={1}><b>Danh mục:</b> {product.category}</Typography>
            <Typography mb={1}><b>Bảo hành:</b> {product.warranty ? new Date(product.warranty).toLocaleDateString() : '-'}</Typography>
            <Typography mb={1}><b>Tồn kho:</b> {product.stockQuantity}</Typography>
            {product.stockQuantity <= 0 ? (
              <Typography fontSize={16} color="error" mb={2}>Sản phẩm đã hết hàng.</Typography>
            ) : (
              <Stack direction="row" spacing={2} mb={2}>
                <Button variant="contained" color="primary" size="large" onClick={addToCart}>
                  Thêm vào giỏ hàng
                </Button>
                <Button variant="contained" color="warning" size="large" onClick={buyNow}>
                  Mua ngay
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
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