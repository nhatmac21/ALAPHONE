import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promotionID, productID, userID } = body;

    // Chỉ kiểm tra user nếu userID có giá trị
    if (userID !== null && userID !== undefined) {
      const user = await prisma.user.findUnique({
        where: { UserID: userID }
      });
      // Có thể kiểm tra quyền ở đây nếu cần
    }

    // Kiểm tra promotion có tồn tại và đang active
    const promotion = await prisma.promotion.findUnique({
      where: { DiscountID: promotionID }
    });

    if (!promotion || !promotion.isActive) {
      return NextResponse.json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' }, { status: 400 });
    }

    // Kiểm tra sản phẩm có tồn tại
    const product = await prisma.product.findUnique({
      where: { ProductID: productID }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Sản phẩm không tồn tại' }, { status: 400 });
    }

    // Tạo promo code cho sản phẩm
    const promoCode = await prisma.promo_code.create({
      data: {
        productID,
        discountID: promotionID,
        userID: userID ?? null,
        code: generatePromoCode()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Áp dụng mã giảm giá thành công',
      promoCode 
    });

  } catch (error) {
    console.error('Error applying promotion:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi áp dụng mã giảm giá' 
    }, { status: 500 });
  }
}

function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 