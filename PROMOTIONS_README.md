# Tính năng Quản lý Mã giảm giá cho Staff

## Tổng quan
Tính năng này cho phép user có role "staff" tạo và quản lý mã giảm giá, sau đó áp dụng chúng cho các sản phẩm cụ thể.

## Các tính năng chính

### 1. Tạo mã giảm giá
- Staff có thể tạo mã giảm giá mới với các thông tin:
  - Tên mã giảm giá
  - Mô tả
  - Loại giảm giá (phần trăm hoặc số tiền cố định)
  - Giá trị giảm
  - Thời gian hiệu lực (từ ngày - đến ngày)
  - Trạng thái kích hoạt

### 2. Áp dụng mã giảm giá cho sản phẩm
- Staff chọn sản phẩm và mã giảm giá để áp dụng
- Hệ thống tự động tạo mã code ngẫu nhiên 8 ký tự
- Mỗi sản phẩm có thể có nhiều mã giảm giá khác nhau

### 3. Quản lý và theo dõi
- Xem danh sách tất cả mã giảm giá đã tạo
- Xem danh sách mã giảm giá đã được áp dụng cho sản phẩm
- Theo dõi trạng thái hoạt động của từng mã

## Cấu trúc Database

### Bảng `promotion`
```sql
- DiscountID (Primary Key)
- name: Tên mã giảm giá
- description: Mô tả
- type: Loại (percentage/amount)
- value: Giá trị giảm
- startDate: Ngày bắt đầu
- endDate: Ngày kết thúc
- isActive: Trạng thái hoạt động
- createdAt, updatedAt: Timestamps
```

### Bảng `promo_code`
```sql
- PromoCodeID (Primary Key)
- productID: ID sản phẩm
- discountID: ID mã giảm giá
- userID: ID user tạo
- code: Mã code ngẫu nhiên
```

## API Endpoints

### 1. Tạo mã giảm giá
```
POST /api/promotion/add
Body: {
  name: string,
  description: string,
  type: 'percentage' | 'amount',
  value: number,
  startDate: string,
  endDate: string,
  isActive: boolean,
  userID: number
}
```

### 2. Lấy danh sách mã giảm giá
```
GET /api/promotion/list
Response: {
  success: boolean,
  promotions: Promotion[]
}
```

### 3. Áp dụng mã giảm giá cho sản phẩm
```
POST /api/promotion/apply
Body: {
  promotionID: number,
  productID: number,
  userID: number
}
```

### 4. Lấy danh sách mã đã áp dụng
```
GET /api/promotion/codes
Response: {
  success: boolean,
  promoCodes: PromoCode[]
}
```

## Giao diện người dùng

### Trang quản lý mã giảm giá
- **URL**: `/staff/promotions`
- **Quyền truy cập**: Chỉ user có role "staff"
- **Tính năng**:
  - Nút tạo mã giảm giá mới
  - Form chọn sản phẩm và mã giảm giá để áp dụng
  - Danh sách mã giảm giá đã tạo
  - Danh sách mã đã áp dụng cho sản phẩm

### Trang demo
- **URL**: `/demo/promotions`
- **Mục đích**: Tạo tài khoản staff test và hướng dẫn sử dụng

## Hướng dẫn sử dụng

### Bước 1: Tạo tài khoản staff
1. Truy cập `/demo/promotions`
2. Nhấn "Tạo tài khoản staff test"
3. Ghi nhớ thông tin đăng nhập

### Bước 2: Đăng nhập
1. Truy cập `/login`
2. Sử dụng thông tin đăng nhập staff

### Bước 3: Truy cập trang quản lý
1. Click vào tên staff ở header
2. Chọn "Quản lý mã giảm giá"

### Bước 4: Tạo mã giảm giá
1. Nhấn "Tạo mã giảm giá mới"
2. Điền đầy đủ thông tin
3. Nhấn "Tạo mã giảm giá"

### Bước 5: Áp dụng cho sản phẩm
1. Chọn sản phẩm từ dropdown
2. Chọn mã giảm giá từ dropdown
3. Nhấn "Áp dụng mã giảm giá"

## Thiết kế UI/UX

### Màu sắc chủ đạo
- **Primary**: Xanh lá (#4caf50)
- **Success**: Xanh lá đậm (#45a049)
- **Background**: Xanh lá nhạt (#f8fff8)

### Components sử dụng
- Material-UI v7.2.0
- Cards với border màu xanh lá cho trạng thái active
- Chips để hiển thị trạng thái
- Dialog cho form tạo mã giảm giá
- Responsive design với Box thay vì Grid

## Bảo mật

### Kiểm tra quyền
- Tất cả API endpoints đều kiểm tra role "staff"
- Chỉ staff mới có thể tạo và áp dụng mã giảm giá

### Validation
- Kiểm tra dữ liệu đầu vào
- Validate thời gian hiệu lực
- Kiểm tra sự tồn tại của sản phẩm và mã giảm giá

## Lưu ý quan trọng

1. **Mã code tự động**: Hệ thống tự động tạo mã code 8 ký tự ngẫu nhiên
2. **Thời gian hiệu lực**: Mã giảm giá chỉ hoạt động trong khoảng thời gian đã định
3. **Trạng thái active**: Chỉ mã giảm giá active mới có thể được áp dụng
4. **Quyền hạn**: Chỉ staff mới có quyền truy cập tính năng này
5. **Responsive**: Giao diện hoạt động tốt trên mobile và desktop

## Troubleshooting

### Lỗi thường gặp
1. **"Không có quyền"**: Đảm bảo user có role "staff"
2. **"Mã giảm giá không hợp lệ"**: Kiểm tra trạng thái active và thời gian hiệu lực
3. **"Sản phẩm không tồn tại"**: Kiểm tra lại danh sách sản phẩm

### Debug
- Kiểm tra console browser để xem lỗi JavaScript
- Kiểm tra network tab để xem API calls
- Kiểm tra database để xem dữ liệu được lưu 