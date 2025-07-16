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
    // Số suất còn lại (nếu có logic, ví dụ: promoCode.limit, promoCode.used)
    // slotText = `Còn ${promoCode.limit - promoCode.used}/${promoCode.limit} suất`;
  }

  // Tính toán thống kê đánh giá
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1) : 0;
  const ratingCounts = [5,4,3,2,1].map(star => reviews.filter(r => r.rating === star).length);

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
            {/* Block giảm giá nổi bật */}
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
                  {slotText && (
                    <Chip label={slotText} color="warning" icon={<LocalFireDepartmentIcon />} sx={{ fontWeight: 700, ml: 2 }} />
                  )}
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" color="success.main" fontWeight={600}>{timeText}</Typography>
                </Stack>
              </Box>
            )}
            {/* End block giảm giá */}
            <Typography variant="h4" fontWeight={800} color="success.main" mb={2}>{Number(product.price).toLocaleString('vi-VN')} ₫</Typography>
            <Typography mb={1}><b>Hãng:</b> {product.brand}</Typography>
            <Typography mb={1}><b>Danh mục:</b> {product.category}</Typography>
            <Typography mb={1}><b>Bảo hành:</b> {product.warranty ? new Date(product.warranty).toLocaleDateString() : '-'}</Typography>
            <Typography mb={1}><b>Tồn kho:</b> {product.stockQuantity}</Typography>
            <Typography mb={2}><b>Mô tả:</b> {product.description}</Typography>
            <Stack direction="row" spacing={2} mb={2}>
              <Box px={2} py={0.5} borderRadius={2} bgcolor="#232b36" color="#a3e635" fontWeight={700} fontSize={15}>Màu: {variant.color || '-'}</Box>
              <Box px={2} py={0.5} borderRadius={2} bgcolor="#232b36" color="#a3e635" fontWeight={700} fontSize={15}>RAM: {variant.RAM || '-'}</Box>
              <Box px={2} py={0.5} borderRadius={2} bgcolor="#232b36" color="#a3e635" fontWeight={700} fontSize={15}>ROM: {variant.ROM || '-'}</Box>
              <Box px={2} py={0.5} borderRadius={2} bgcolor="#232b36" color="#a3e635" fontWeight={700} fontSize={15}>Bộ nhớ: {variant.storage || '-'}</Box>
            </Stack>
            <Button variant="contained" color="primary" size="large" onClick={() => {
              // Lấy cart hiện tại từ localStorage
              const cartData = localStorage.getItem("cart");
              let cart = [];
              try { cart = cartData ? JSON.parse(cartData) : []; } catch { cart = []; }
              // Thêm sản phẩm với variant hiện tại
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
              // Nếu đã có trong giỏ thì tăng số lượng
              const idx = cart.findIndex((p:any) => p.id === item.id && p.color === item.color && p.ram === item.ram && p.rom === item.rom);
              if (idx >= 0) {
                cart[idx].quantity = (cart[idx].quantity || 1) + 1;
              } else {
                cart.push(item);
              }
              localStorage.setItem("cart", JSON.stringify(cart));
              setSnackbar({ open: true, message: "Đã thêm vào giỏ hàng!" });
            }}>
              Thêm vào giỏ hàng
            </Button>
          </Box>
        </Stack>
        {/* Đánh giá sản phẩm */}
        <Box mt={6}>
          <Typography variant="h5" fontWeight={700} mb={2}>Đánh giá sản phẩm</Typography>
          <Box display="flex" alignItems="center" gap={4}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight={800} color="warning.main">{avgRating}</Typography>
              <Rating value={Number(avgRating)} precision={0.1} readOnly size="large" />
              <Typography color="text.secondary">{totalReviews} đánh giá</Typography>
            </Box>
            <Box flex={1}>
              { [5,4,3,2,1].map((star, idx) => (
                <Box key={star} display="flex" alignItems="center" mb={0.5}>
                  <Typography width={24}>{star}</Typography>
                  <Rating value={star} readOnly size="small" />
                  <Box flex={1} mx={1} bgcolor="#e0e0e0" borderRadius={1} height={8} position="relative">
                    <Box bgcolor="#4caf50" borderRadius={1} height={8} width={`${(ratingCounts[idx]/totalReviews)*100||0}%`} position="absolute" top={0} left={0} />
                  </Box>
                  <Typography width={32} textAlign="right">{ratingCounts[idx]}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box mt={3}>
            {reviews.length === 0 ? (
              <Typography color="text.secondary">Chưa có đánh giá nào cho sản phẩm này.</Typography>
            ) : (
              reviews.map((r, idx) => (
                <Box key={r.ReviewID || idx} mb={3} p={2} borderRadius={2} bgcolor="#232b36" color="#fff" boxShadow={1}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Typography fontWeight={700} color="#a3e635">{r.user?.fullName || r.user?.userName || 'Ẩn danh'}</Typography>
                    <Rating value={r.rating} readOnly size="small" />
                    <Typography color="#a3e635" fontWeight={600} fontSize={14}>
                      {r.date ? new Date(r.date).toLocaleDateString('vi-VN') : ''}
                    </Typography>
                  </Stack>
                  <Typography color="#fff">{r.comment}</Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
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