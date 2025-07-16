import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userID, productID, orderID, reason } = await req.json();
    if (!userID || !productID || !orderID || !reason) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin!' }, { status: 400 });
    }
    // Kiểm tra đơn hàng hợp lệ và thuộc về user
    const order = await prisma.orders.findFirst({
      where: {
        OrderID: orderID,
        userID,
        status: { in: ['received', 'delivered'] },
        orderitem: {
          some: {
            productvariant: {
              ProductID: productID,
            },
          },
        },
      },
    });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng hợp lệ!' }, { status: 404 });
    }
    // Kiểm tra đã từng gửi yêu cầu trả hàng cho sản phẩm này chưa
    const existed = await prisma.returns.findFirst({ where: { orderID, reason } });
    if (existed) {
      return NextResponse.json({ success: false, message: 'Bạn đã gửi yêu cầu trả hàng cho sản phẩm này rồi!' }, { status: 409 });
    }
    // Lưu yêu cầu trả hàng
    await prisma.returns.create({
      data: {
        orderID,
        reason,
        status: 'pending',
        createdAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, message: 'Gửi yêu cầu trả hàng thành công!' });
  } catch (error) {
    console.log('Lỗi khi gửi yêu cầu trả hàng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi gửi yêu cầu trả hàng!' }, { status: 500 });
  }
} 