"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress, Paper, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';

interface Product {
  ProductID: number;
  name: string;
}
interface ProductVariant {
  VariantID: number;
  color?: string;
  storage?: string;
  product?: Product | null;
}
interface OrderItem {
  OI_ID: number;
  variantID: number;
  quantity: number;
  price: number;
  discount: number;
  productvariant?: ProductVariant | null;
}

interface Order {
  OrderID: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  PaymentMethod: string;
  orderitem: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Dialog đánh giá
  const [openReview, setOpenReview] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState("");
  // Dialog trả hàng
  const [openReturn, setOpenReturn] = useState(false);
  const [returnProduct, setReturnProduct] = useState<Product | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      setError("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userData);
    fetch(`/api/order/history?userID=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        else setError(data.message || "Không lấy được đơn hàng");
      })
      .catch(() => setError("Lỗi kết nối server!"))
      .finally(() => setLoading(false));
  }, []);

  // Hàm xác nhận đã nhận hàng
  const handleConfirmReceived = async (orderID: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xác nhận đã nhận hàng?")) return;
    const res = await fetch("/api/order/confirm-received", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID }),
    });
    if (res.ok) {
      setOrders(orders => orders.map(o => o.OrderID === orderID ? { ...o, status: "received" } : o));
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Typography variant="h4" fontWeight={700} color="primary" align="center" mb={4}>
          Lịch sử đơn hàng
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : orders.length === 0 ? (
          <Typography align="center" color="#fff">Bạn chưa có đơn hàng nào.</Typography>
        ) : (
          <Stack spacing={3}>
            {orders.map(order => (
              <Paper key={order.OrderID} sx={{ p: 3, borderRadius: 3, background: '#232b36', color: '#a3e635' }} elevation={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight={700} color="#a3e635" fontSize={22}>Mã đơn: #{order.OrderID}</Typography>
                  <Chip
  label={
    order.status === "pending" ? "Đang giao" :
    order.status === "delivered" ? "Đã giao" :
    order.status === "received" ? "Đã nhận" :
    order.status === "cancelled" ? "Đã hủy" :
    "Chờ xử lý"
  }
  color={
    order.status === "delivered" ? "success" :
    order.status === "cancelled" ? "error" :
    order.status === "received" ? "info" :
    "warning"
  }
  sx={{ fontWeight: 700, fontSize: 16 }}
/>
                </Stack>
                <Typography fontSize={16} color="#fff" mb={0.5}>Ngày đặt: <span style={{ color: '#a3e635', fontWeight: 600 }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</span></Typography>
                <Typography fontSize={16} color="#fff" mb={0.5}>Tổng tiền: <span style={{ color: '#22c55e', fontWeight: 700 }}>{order.totalAmount?.toLocaleString("vi-VN")} ₫</span></Typography>
                <Typography fontSize={16} color="#fff" mb={0.5}>Địa chỉ giao hàng: <span style={{ color: '#a3e635', fontWeight: 600 }}>{order.shippingAddress || '-'}</span></Typography>
                <Typography fontSize={16} color="#fff" mb={0.5}>Phương thức thanh toán: <span style={{ color: '#a3e635', fontWeight: 600 }}>{order.PaymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.PaymentMethod === "vnpay" ? "VNPay" : order.PaymentMethod || '-'}</span></Typography>
                {/* Nút xác nhận đã nhận hàng */}
                {order.status === "delivered" && (
                  <Button variant="contained" color="success" sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }} onClick={() => handleConfirmReceived(order.OrderID)}>
                    Xác nhận đã nhận hàng
                  </Button>
                )}
                <Box mt={2}>
                  <Typography fontWeight={700} color="#a3e635" fontSize={18}>Sản phẩm:</Typography>
                  <ul className="ml-4 list-disc">
                    {order.orderitem.map(item => {
                      const pv = item.productvariant;
                      const p = pv?.product;
                      return (
                        <li key={item.OI_ID} className="text-white text-sm mb-1">
                          <span style={{ color: '#a3e635', fontWeight: 600 }}>
                            {p ? `#${p.ProductID} - ${p.name}` : 'Sản phẩm không xác định'}
                          </span>
                          {pv?.color && <span> | Màu: {pv.color}</span>}
                          {pv?.storage && <span> | Bộ nhớ: {pv.storage}</span>}
                          <span> | SL: {item.quantity}</span>
                          <span> | Giá: {item.price?.toLocaleString('vi-VN')} ₫</span>
                          {item.discount ? <span> | Giảm: {item.discount?.toLocaleString('vi-VN')} ₫</span> : null}
                          {/* Nút đánh giá và trả hàng */}
                          {order.status === "received" && p && (
                            <>
                              <Button size="small" variant="outlined" color="success" sx={{ ml: 2, fontWeight: 600, borderRadius: 2 }} onClick={() => { setReviewProduct(p); setOpenReview(true); }}>
                                Đánh giá
                              </Button>
                              <Button size="small" variant="outlined" color="error" sx={{ ml: 1, fontWeight: 600, borderRadius: 2 }} onClick={() => { setReturnProduct(p); setOpenReturn(true); }}>
                                Trả hàng
                              </Button>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
        {/* Dialog đánh giá */}
        <Dialog open={openReview} onClose={() => setOpenReview(false)}>
          <DialogTitle color="success.main" fontWeight={700}>Đánh giá sản phẩm</DialogTitle>
          <DialogContent>
            <Typography mb={1} fontWeight={600}>{reviewProduct?.name}</Typography>
            <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} size="large" />
            <TextField
              label="Nhận xét của bạn"
              multiline
              minRows={3}
              fullWidth
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReview(false)} color="primary">Hủy</Button>
            <Button
              onClick={async () => {
                if (!reviewProduct || !reviewRating) return;
                const userData = localStorage.getItem("userData");
                if (!userData) {
                  setSnackbar({ open: true, message: "Bạn cần đăng nhập để đánh giá!" });
                  return;
                }
                const user = JSON.parse(userData);
                const res = await fetch("/api/review/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userID: user.id,
                    productID: reviewProduct.ProductID,
                    rating: reviewRating,
                    comment: reviewComment,
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  setSnackbar({ open: true, message: "Đánh giá thành công!" });
                  setOpenReview(false);
                  setReviewComment("");
                  setReviewRating(5);
                } else {
                  setSnackbar({ open: true, message: data.message || "Đánh giá thất bại!" });
                }
              }}
              color="success"
              variant="contained"
            >
              Gửi đánh giá
            </Button>
          </DialogActions>
        </Dialog>
        {/* Dialog trả hàng */}
        <Dialog open={openReturn} onClose={() => setOpenReturn(false)}>
          <DialogTitle color="error.main" fontWeight={700}>Trả hàng</DialogTitle>
          <DialogContent>
            <Typography mb={1} fontWeight={600}>{returnProduct?.name}</Typography>
            <TextField
              label="Lý do trả hàng"
              multiline
              minRows={3}
              fullWidth
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReturn(false)} color="primary">Hủy</Button>
            <Button
              onClick={async () => {
                if (!returnProduct || !returnReason) return;
                const userData = localStorage.getItem("userData");
                if (!userData) {
                  setSnackbar({ open: true, message: "Bạn cần đăng nhập để trả hàng!" });
                  return;
                }
                const user = JSON.parse(userData);
                // Tìm orderID chứa sản phẩm này
                let orderID = null;
                for (const order of orders) {
                  if (order.orderitem.some(item => item.productvariant?.product?.ProductID === returnProduct.ProductID)) {
                    orderID = order.OrderID;
                    break;
                  }
                }
                if (!orderID) {
                  setSnackbar({ open: true, message: "Không tìm thấy đơn hàng phù hợp!" });
                  return;
                }
                const res = await fetch("/api/return/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userID: user.id,
                    productID: returnProduct.ProductID,
                    orderID,
                    reason: returnReason,
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  setSnackbar({ open: true, message: "Gửi yêu cầu trả hàng thành công!" });
                  setOpenReturn(false);
                  setReturnReason("");
                } else {
                  setSnackbar({ open: true, message: data.message || "Gửi yêu cầu thất bại!" });
                }
              }}
              color="error"
              variant="contained"
            >
              Gửi yêu cầu
            </Button>
          </DialogActions>
        </Dialog>
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