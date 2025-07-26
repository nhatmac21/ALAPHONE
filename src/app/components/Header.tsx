'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';



interface User {
  id: number;
  name?: string;
  phone: string;
  email?: string;
  fullName?: string;
  userName?: string;
  role?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const isAdminPage = location.pathname.startsWith("/admin");
const isAdmin = user?.role === "admin";
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('cart');
    setUser(null);
    setAnchorEl(null);
    window.location.href = '/';
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: '#111827', boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: '#43a047', letterSpacing: 1, cursor: 'pointer' }}
            onClick={() => {
              if (!user) router.push('/');
              else if (user.role?.toLowerCase() === 'admin') router.push('/admin');
              else if (user.role?.toLowerCase() === 'staff') router.push('/staff');
              else router.push('/');
            }}
          >
            Alaphone
          </Typography>
        </Box>

        {/* Menu phải */}
        <Box display="flex" alignItems="center" gap={2}>
          {isLoading ? null : user ? (
            user.role === 'staff' ? (
              <>
                <Button
                  onClick={handleMenuClick}
                  startIcon={<AccountCircleIcon sx={{ color: '#43a047' }} />}
                  sx={{ fontWeight: 600, color: '#43a047' }}
                >
                  {user.fullName || user.name || user.userName || 'Staff'}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/staff/add-product" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 6 }}>
                      <AddIcon fontSize="small" />
                      Thêm sản phẩm
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/staff/inventory" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 6 }}>
                      <InventoryIcon fontSize="small" />
                      Quản lý kho
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/staff/promotions" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 6 }}>
                      <LocalOfferIcon fontSize="small" />
                      Quản lý mã giảm giá
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link href="/staff/orders" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 6 }}>
                      <InventoryIcon fontSize="small" />
                      Quản lý đơn hàng
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* Customer */}
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountCircleIcon sx={{ color: '#43a047' }} />
                  <Typography
                    fontWeight={600}
                    sx={{
                      color: '#43a047',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => router.push('/user')}
                  >
                    {user.fullName || user.name || user.userName || 'User'}
                  </Typography>
                </Box>
                {/* Lịch sử mua hàng */}
                
               {!isAdminPage && !isAdmin && (
  <Link href="/order" style={{ textDecoration: 'none' }}>
    <Button
      variant="outlined"
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        borderColor: '#43a047',
        color: '#43a047',
        '&:hover': {
          background: '#bbf7d0',
          borderColor: '#43a047'
        }
      }}
    >
      Lịch sử mua hàng
    </Button>
  </Link>
)}
                {/* Logout */}
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ fontWeight: 600, color: '#ef4444' }}
                >
                  Đăng xuất
                </Button>
              </>
            )
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button
                  startIcon={<AccountCircleIcon sx={{ color: '#43a047' }} />}
                  sx={{ fontWeight: 600, color: '#43a047' }}
                >
                  Đăng nhập
                </Button>
              </Link>
            </>
          )}

          {/* Giỏ hàng - chỉ hiện nếu không phải admin hoặc staff */}
          {(!user || (user.role !== 'admin' && user.role !== 'staff')) && (
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <IconButton size="large">
                <ShoppingCartIcon sx={{ color: '#43a047' }} fontSize="large" />
              </IconButton>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}