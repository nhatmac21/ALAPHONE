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
    setUser(null);
    setAnchorEl(null);
    window.location.reload();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: '#111827', boxShadow: 'none', borderBottom: 'none', mb: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h5" fontWeight={900} sx={{ color: '#43a047', letterSpacing: 1 }}>
              Alaphone
            </Typography>
          </Link>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {isLoading ? null : user ? (
            <>
              {user.role === 'staff' ? (
                <>
                  <Button
                    color="primary"
                    onClick={handleMenuClick}
                    startIcon={<AccountCircleIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    {user.fullName || user.name || user.userName || 'Staff'}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleMenuClose}>
                      <Link href="/staff/add-product" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon fontSize="small" />
                        Thêm sản phẩm
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                      <Link href="/staff/inventory" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" />
                        Quản lý kho
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                      <Link href="/staff/promotions" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalOfferIcon fontSize="small" />
                        Quản lý mã giảm giá
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                      <Link href="/staff/orders" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountCircleIcon color="primary" />
                    <Typography color="primary" fontWeight={600}>
                      {user.fullName || user.name || user.userName || 'User'}
                    </Typography>
                  </Box>
                  <Link href="/order" style={{ textDecoration: 'none' }}>
                    <Button color="success" variant="outlined" sx={{ fontWeight: 600, borderRadius: 2, borderColor: '#22c55e', color: '#22c55e', '&:hover': { background: '#bbf7d0', borderColor: '#22c55e' } }}>
                      Lịch sử mua hàng
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    Đăng xuất
                  </Button>
                </>
              )}
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button color="primary" variant="text" startIcon={<AccountCircleIcon />} sx={{ fontWeight: 600 }}>
                Đăng nhập
              </Button>
            </Link>
          )}
          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <IconButton color="success" size="large">
              <ShoppingCartIcon fontSize="large" />
            </IconButton>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 