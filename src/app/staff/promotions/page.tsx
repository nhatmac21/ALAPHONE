"use client";
import React, { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

interface Product {
  ProductID: number;
  name: string;
  price: number;
}

interface Promotion {
  DiscountID: number;
  name: string;
  description: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

interface PromoCode {
  PromoCodeID: number;
  code: string;
  product: {
    ProductID: number;
    name: string;
    price: number;
  };
  promotion: {
    DiscountID: number;
    name: string;
    type: string;
    value: number;
    isActive: boolean;
  };
  user: {
    UserID: number;
    fullName: string;
    userName: string;
  };
}

interface User {
  id: number;
  role: string;
  fullName?: string;
  userName?: string;
}

interface UserOption {
  UserID: number;
  fullName: string;
  userName: string;
  phone: string;
}

export default function StaffPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  // Form states for new promotion
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
    fetchPromoCodes();
    fetchUsers();
    
    // Lấy user từ localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotion/list');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      // Nếu data là mảng sản phẩm, lấy trực tiếp
      // Nếu data là object có mảng, lấy data.products
      let productsArr = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
      // Chỉ lấy các trường cần thiết
      productsArr = productsArr.map((p: any) => ({
        ProductID: p.ProductID,
        name: p.name,
        price: p.price
      }));
      setProducts(productsArr);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/promotion/codes');
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.promoCodes);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      let usersArr = Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []);
      usersArr = usersArr.map((u: any) => ({
        UserID: u.UserID,
        fullName: u.fullName || '',
        userName: u.userName || '',
        phone: u.phone || ''
      }));
      setUsers(usersArr);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); 
    setError("");
    
    if (!user || user.role !== 'staff') {
      setError("Bạn không có quyền tạo mã giảm giá!");
      return;
    }

    if (!formData.name || !formData.value || !formData.startDate || !formData.endDate) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/promotion/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userID: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Tạo mã giảm giá thành công!");
        setFormData({
          name: '',
          description: '',
          type: 'percentage',
          value: '',
          startDate: '',
          endDate: '',
          isActive: true
        });
        setOpenDialog(false);
        fetchPromotions();
      } else {
        setError(data.message || "Lỗi tạo mã giảm giá!");
      }
    } catch {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromotion = async () => {
    if (!selectedProduct || !selectedPromotion) {
      setError("Vui lòng chọn sản phẩm và mã giảm giá!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/promotion/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productID: selectedProduct.ProductID, 
          promotionID: selectedPromotion.DiscountID,
          userID: selectedUser ? selectedUser.UserID : null 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Áp dụng mã giảm giá thành công!");
        setSelectedProduct(null);
        setSelectedPromotion(null);
        setSelectedUser(null);
        fetchPromoCodes(); // Refresh danh sách
      } else {
        setError(data.message || "Lỗi áp dụng mã giảm giá!");
      }
    } catch {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box maxWidth={1200} mx="auto" mt={4} p={3}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={4} align="center">
        Quản lý mã giảm giá (Staff)
      </Typography>

      {/* Create Promotion Button */}
      <Box mb={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ 
            bgcolor: '#4caf50', 
            '&:hover': { bgcolor: '#45a049' },
            px: 4,
            py: 1.5
          }}
        >
          Tạo mã giảm giá mới
        </Button>
      </Box>

      {/* Apply Promotion Section */}
      <Card sx={{ mb: 4, bgcolor: '#f8fff8' }}>
        <CardContent>
          <Typography variant="h6" color="primary" mb={3}>
            Áp dụng mã giảm giá cho sản phẩm
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <Autocomplete
              options={Array.isArray(products) ? products : []}
              getOptionLabel={(product) => product.name}
              value={selectedProduct}
              onChange={(_, product) => setSelectedProduct(product)}
              renderInput={(params) => <TextField {...params} label="Chọn sản phẩm" fullWidth />}
              isOptionEqualToValue={(a, b) => a?.ProductID === b?.ProductID}
            />
            <Autocomplete
              options={Array.isArray(promotions) ? promotions.filter(p => p.isActive) : []}
              getOptionLabel={(promotion) => `${promotion.name} (${promotion.type === 'percentage' ? promotion.value + '%' : promotion.value + 'đ'})`}
              value={selectedPromotion}
              onChange={(_, promotion) => setSelectedPromotion(promotion)}
              renderInput={(params) => <TextField {...params} label="Chọn mã giảm giá" fullWidth />}
              isOptionEqualToValue={(a, b) => a?.DiscountID === b?.DiscountID}
            />
            <Autocomplete
              options={Array.isArray(users) ? users : []}
              getOptionLabel={(user) => user.fullName ? `${user.fullName} (${user.phone})` : user.phone}
              value={selectedUser}
              onChange={(_, user) => setSelectedUser(user)}
              renderInput={(params) => <TextField {...params} label="Chọn khách hàng (không bắt buộc)" fullWidth InputProps={{ ...params.InputProps, startAdornment: <PersonIcon sx={{ color: '#4caf50', mr: 1 }} /> }} />}
              isOptionEqualToValue={(a, b) => a?.UserID === b?.UserID}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyPromotion}
              disabled={loading || !selectedProduct || !selectedPromotion}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
            >
              {loading ? "Đang áp dụng..." : "Áp dụng mã giảm giá"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <Typography variant="h6" color="primary" mb={3}>
        Danh sách mã giảm giá
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={3}>
        {promotions.map((promotion) => (
          <Box key={promotion.DiscountID} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: promotion.isActive ? '#f8fff8' : '#f5f5f5',
              border: promotion.isActive ? '2px solid #4caf50' : '2px solid #ccc'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {promotion.name}
                  </Typography>
                  <Chip 
                    label={promotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    color={promotion.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {promotion.description}
                </Typography>

                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Loại:</Typography>
                    <Typography variant="body2">
                      {promotion.type === 'percentage' ? 'Phần trăm' : 'Số tiền'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Giá trị:</Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {promotion.type === 'percentage' ? `${promotion.value}%` : `${promotion.value.toLocaleString()}đ`}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Từ ngày:</Typography>
                    <Typography variant="body2">{formatDate(promotion.startDate)}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Đến ngày:</Typography>
                    <Typography variant="body2">{formatDate(promotion.endDate)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Create Promotion Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">Tạo mã giảm giá mới</Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleCreatePromotion}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField
                label="Tên mã giảm giá"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                fullWidth
              />
              
              <TextField
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                multiline
                rows={3}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  label="Loại giảm giá"
                >
                  <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                  <MenuItem value="amount">Số tiền (đ)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Giá trị giảm"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                required
                fullWidth
                inputProps={{ min: 0, max: formData.type === 'percentage' ? 100 : undefined }}
              />

              <TextField
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Ngày kết thúc"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    color="primary"
                  />
                }
                label="Kích hoạt ngay"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
            >
              {loading ? "Đang tạo..." : "Tạo mã giảm giá"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Applied Promo Codes */}
      <Typography variant="h6" color="primary" mb={3} mt={6}>
        Mã giảm giá đã được áp dụng
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={3}>
        {promoCodes.map((promoCode) => (
          <Box key={promoCode.PromoCodeID} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: promoCode.promotion.isActive ? '#f8fff8' : '#f5f5f5',
              border: promoCode.promotion.isActive ? '2px solid #4caf50' : '2px solid #ccc'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {promoCode.code}
                  </Typography>
                  <Chip 
                    label={promoCode.promotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    color={promoCode.promotion.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
                
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Sản phẩm:</Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                      {promoCode.product.name}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Mã giảm giá:</Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {promoCode.promotion.name}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Giá trị:</Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {promoCode.promotion.type === 'percentage' ? `${promoCode.promotion.value}%` : `${promoCode.promotion.value.toLocaleString()}đ`}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>Tạo bởi:</Typography>
                    <Typography variant="body2">
                      {promoCode.user ? (promoCode.user.fullName || promoCode.user.userName) : "Tất cả khách hàng"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Messages */}
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 