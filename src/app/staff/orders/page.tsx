"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { format, isWithinInterval, parseISO } from "date-fns";

interface User {
  userName?: string;
  fullName?: string;
  phone?: string;
}

interface OrderItem {
  orderItemID: number;
  quantity: number;
  price: number;
  productvariant: {
    product: { name: string };
    RAM: string;
    ROM: string;
    color: string;
  };
}

interface Order {
  OrderID: number;
  user: User;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  PaymentMethod: string;
  orderitem: OrderItem[];
}

const statusColor: Record<string, "success" | "warning" | "error" | "default"> = {
  pending: "warning",
  delivered: "success",
  cancelled: "error",
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    fetch("/api/order/list")
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  // Lọc orders client-side
  const filteredOrders = orders.filter(order => {
    // Lọc trạng thái
    if (statusFilter && order.status !== statusFilter) return false;
    // Lọc khách hàng (tên, SĐT)
    const customer = (order.user?.fullName || order.user?.userName || "") + (order.user?.phone || "");
    if (search && !customer.toLowerCase().includes(search.toLowerCase())) return false;
    // Lọc theo ngày
    if (dateFrom && dateTo) {
      const created = parseISO(order.createdAt);
      if (!isWithinInterval(created, { start: parseISO(dateFrom), end: parseISO(dateTo) })) return false;
    }
    return true;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const updateStatus = async (orderID: number, status: string) => {
    setUpdating(true);
    const res = await fetch("/api/order/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID, status }),
    });
    if (res.ok) {
      setOrders(orders => orders.map(o => o.OrderID === orderID ? { ...o, status } : o));
      if (selectedOrder && selectedOrder.OrderID === orderID) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    }
    setUpdating(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} color="success.main" mb={3} align="center">
        Quản lý đơn hàng
      </Typography>
      {/* Bộ lọc */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center" justifyContent="center">
        <TextField
          select
          label="Trạng thái"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="pending">Chờ xử lý</MenuItem>
          <MenuItem value="delivered">Đã giao</MenuItem>
          <MenuItem value="cancelled">Đã hủy</MenuItem>
        </TextField>
        <TextField
          label="Tìm khách hàng (tên, SĐT)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          type="date"
          label="Từ ngày"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <TextField
          type="date"
          label="Đến ngày"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table>
          <TableHead sx={{ background: "#e8f5e9" }}>
            <TableRow>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.OrderID} hover>
                <TableCell>#{order.OrderID}</TableCell>
                <TableCell>{order.user?.fullName || order.user?.userName || "-"}</TableCell>
                <TableCell>{order.user?.phone || "-"}</TableCell>
                <TableCell sx={{ color: "#22c55e", fontWeight: 700 }}>{order.totalAmount.toLocaleString("vi-VN")} ₫</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColor[order.status] || "default"} sx={{ fontWeight: 700, textTransform: "capitalize" }} />
                </TableCell>
                <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="success" size="small" onClick={() => handleOpenDetail(order)} sx={{ fontWeight: 600, borderRadius: 2, borderColor: "#22c55e", color: "#22c55e", mr: 1 }}>
                    Xem chi tiết
                  </Button>
                  {order.status === "pending" && (
                    <>
                      <Button variant="contained" color="success" size="small" sx={{ fontWeight: 600, borderRadius: 2, mr: 1 }} disabled={updating} onClick={() => updateStatus(order.OrderID, "delivered")}>Đã giao</Button>
                      <Button variant="contained" color="error" size="small" sx={{ fontWeight: 600, borderRadius: 2 }} disabled={updating} onClick={() => updateStatus(order.OrderID, "cancelled")}>Hủy</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog chi tiết đơn hàng */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700} color="success.main">Chi tiết đơn hàng #{selectedOrder?.OrderID}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography fontWeight={600} mb={1}>Khách hàng: {selectedOrder.user?.fullName || selectedOrder.user?.userName || "-"}</Typography>
              <Typography mb={1}>SĐT: {selectedOrder.user?.phone || "-"}</Typography>
              <Typography mb={1}>Địa chỉ: {selectedOrder.shippingAddress}</Typography>
              <Typography mb={1}>Phương thức thanh toán: {selectedOrder.PaymentMethod}</Typography>
              <Typography mb={1}>Trạng thái: <Chip label={selectedOrder.status} color={statusColor[selectedOrder.status] || "default"} size="small" /></Typography>
              <Typography mb={2}>Ngày đặt: {format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm")}</Typography>
              <Typography fontWeight={700} mb={1}>Sản phẩm:</Typography>
              <ul>
                {selectedOrder.orderitem.map(item => (
                  <li key={item.orderItemID} style={{ marginBottom: 8 }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{item.productvariant.product.name}</span> | RAM: {item.productvariant.RAM} | ROM: {item.productvariant.ROM} | Màu: {item.productvariant.color} | SL: {item.quantity} | Giá: {item.price.toLocaleString('vi-VN')} ₫
                  </li>
                ))}
              </ul>
              <Typography fontWeight={700} color="#22c55e">Tổng tiền: {selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 