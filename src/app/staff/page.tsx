"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import RestoreIcon from '@mui/icons-material/Restore';
import BlockIcon from '@mui/icons-material/Block';
import { useRouter } from "next/navigation";

export default function StaffDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [showInactive, setShowInactive] = useState(false);
  const router = useRouter();

  const fetchProducts = () => {
    setLoading(true);
    fetch(`/api/products${showInactive ? '?showInactive=true' : ''}`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => setSnackbar({ open: true, message: "Lỗi kết nối server!" })) 
      .finally(() => setLoading(false));
      
  };
console.log("Products loaded:", products);
  useEffect(() => {
    // Kiểm tra role
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "staff") {
      router.replace("/");
      return;
    }
    fetchProducts();
    // eslint-disable-next-line
  }, [router, showInactive]);

  const handleSetActive = async (productID: number, isActive: boolean) => {
    try {
      const res = await fetch(`/api/product/${productID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: isActive ? 'Đã khôi phục sản phẩm!' : 'Đã ngừng kinh doanh sản phẩm!' });
        fetchProducts();
      } else {
        setSnackbar({ open: true, message: data.message || 'Lỗi thao tác!' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Lỗi kết nối server!' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setSnackbar({ open: true, message: "Đã đăng xuất!" });
    setTimeout(() => router.replace("/login"), 1000);
  };

  const menu = [
    { text: "Thêm sản phẩm", icon: <AddIcon />, href: "/staff/add-product" },
    { text: "Quản lý kho", icon: <InventoryIcon />, href: "/staff/inventory" },
    { text: "Quản lý mã giảm giá", icon: <LocalOfferIcon />, href: "/staff/promotions" },
    { text: "Quản lý đơn hàng", icon: <AssignmentIcon />, href: "/staff/orders" },
    { text: "Quản lý trả hàng", icon: <StoreIcon />, href: "/staff/returns" },
  ];

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#111827">
      {/* Sidebar */}
      <Drawer variant="permanent" PaperProps={{ sx: { width: 240, bgcolor: '#18232e', color: '#fff', borderRight: 'none' } }}>
        <Box height={64} display="flex" alignItems="center" justifyContent="center" bgcolor="#232b36">
          <Typography fontWeight={900} fontSize={24} color="#a3e635">Staff Panel</Typography>
        </Box>
        <Divider />
        <List>
          {menu.map((item, idx) => (
            <ListItem key={item.text} onClick={() => router.push(item.href)} sx={{ '&:hover': { bgcolor: '#232b36' }, cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: '#a3e635' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItem>
          ))}
          <ListItem onClick={handleLogout} sx={{ mt: 2, cursor: 'pointer' }}>
            <ListItemIcon sx={{ color: '#ef4444' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Đăng xuất" primaryTypographyProps={{ color: '#ef4444', fontWeight: 700 }} />
          </ListItem>
        </List>
      </Drawer>
      {/* Main content */}
      <Box flex={1} p={4} sx={{ marginLeft: '240px' }}>
        <Typography variant="h4" fontWeight={800} color="#a3e635" mb={4}>Quản lý sản phẩm</Typography>
        <Stack direction="row" spacing={2} mb={2}>
          <Button variant={!showInactive ? "contained" : "outlined"} color="success" onClick={() => setShowInactive(false)}>
            Đang kinh doanh
          </Button>
          <Button variant={showInactive ? "contained" : "outlined"} color="warning" onClick={() => setShowInactive(true)}>
            Ngừng kinh doanh
          </Button>
        </Stack>
        <TableContainer component={Paper} sx={{ bgcolor: '#232b36', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Hãng</TableCell>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Giá</TableCell>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Tồn kho</TableCell>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ color: '#a3e635', fontWeight: 700 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#fff' }}>Đang tải...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#fff' }}>Không có sản phẩm nào.</TableCell></TableRow>
              ) : products
                  .filter((p: any) => showInactive ? p.isActive === false : p.isActive !== false)
                  .map((p: any) => (
                    <TableRow key={p.ProductID} hover>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{p.name}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{p.brand}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{Number(p.price).toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{p.stockQuantity ?? 0}</TableCell>
                      <TableCell sx={{ color: p.isActive ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{p.isActive ? (p.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng') : 'Ngừng kinh doanh'}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="info" size="small" sx={{ mr: 1 }} onClick={() => router.push(`/staff/edit-product/${p.ProductID}`)}>
                          Cập nhật
                        </Button>
                        {p.isActive ? (
                          <IconButton color="error" title="Ngừng kinh doanh" onClick={() => handleSetActive(p.ProductID, false)}>
                            <BlockIcon />
                          </IconButton>
                        ) : (
                          <IconButton color="success" title="Khôi phục" onClick={() => handleSetActive(p.ProductID, true)}>
                            <RestoreIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Box>
    </Box>
  );
} 