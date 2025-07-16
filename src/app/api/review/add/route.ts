import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log('---[REVIEW API]---');
    const body = await req.json();
    console.log('Received body:', body);
    const { userID, productID, rating, comment } = body;
    if (!userID || !productID || !rating) {
      console.log('Missing info:', { userID, productID, rating });
      return NextResponse.json({ success: false, message: 'Thiếu thông tin!' }, { status: 400 });
    }
    // Kiểm tra user đã mua sản phẩm này và đơn đã giao xong hoặc đã nhận
    const deliveredOrder = await prisma.orders.findFirst({
      where: {
        userID,
        status: { in: ['delivered', 'received'] },
        orderitem: {
          some: {
            productvariant: {
              ProductID: productID,
            },
          },
        },
      },
    });
    console.log('deliveredOrder:', deliveredOrder);
    if (!deliveredOrder) {
      console.log('Không tìm thấy đơn hàng phù hợp để đánh giá');
      return NextResponse.json({ success: false, message: 'Chỉ được đánh giá sản phẩm đã mua và đã giao xong!' }, { status: 403 });
    }
    // Kiểm tra đã từng đánh giá sản phẩm này chưa
    const existed = await prisma.review.findFirst({ where: { userID, productID } });
    console.log('existed review:', existed);
    if (existed) {
      console.log('Đã đánh giá sản phẩm này rồi');
      return NextResponse.json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi!' }, { status: 409 });
    }
    // Tạo review
    await prisma.review.create({
      data: {
        userID,
        productID,
        rating,
        comment,
        date: new Date(),
      },
    });
    console.log('Review created thành công');
    return NextResponse.json({ success: true, message: 'Đánh giá thành công!' });
  } catch (error) {
    console.log('Lỗi khi tạo review:', error);
    return NextResponse.json({ success: false, message: 'Lỗi đánh giá!' }, { status: 500 });
  }
} 