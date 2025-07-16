import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, phone, address, cart, payment, email } = await req.json();
    if (!name || !phone || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: 'Thiếu thông tin hoặc giỏ hàng trống!' }, { status: 400 });
    }

    // Kiểm tra số điện thoại hợp lệ: bắt đầu bằng 0, đủ 10 số
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ message: 'Số điện thoại không hợp lệ! Số điện thoại phải bắt đầu bằng 0 và có 10 số.' }, { status: 400 });
    }

    // Kiểm tra user đã tồn tại chưa (theo phone)
    let user = await prisma.user.findFirst({ where: { phone } });
    let password = '';
    if (!user) {
      password = '123456';
      user = await prisma.user.create({
        data: {
          userName: name,
          fullName: name,
          email: email || '',
          phone,
          address,
          password: '123456',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Tạo đơn hàng
    const total = cart.reduce((sum: number, item: any) => sum + item.price * (item.quantity || 1), 0);
    const order = await prisma.orders.create({
      data: {
        userID: user.UserID,
        totalAmount: total,
        shippingAddress: address,
        PaymentMethod: payment,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Tạo các orderitem cho từng sản phẩm trong cart
    for (const item of cart) {
      await prisma.orderitem.create({
        data: {
          orderID: order.OrderID,
          variantID: item.variantID || item.id || item.ProductID, // đảm bảo đúng variantID
          quantity: item.quantity || 1,
          price: item.price,
          discount: item.discount || 0,
        },
      });
    }

    // Trừ stockQuantity cho từng sản phẩm
    for (const item of cart) {
      await prisma.product.update({
        where: { ProductID: item.id || item.ProductID },
        data: {
          stockQuantity: {
            decrement: item.quantity || 1,
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Đặt hàng thành công!',
      orderId: order.OrderID,
      user: { name: user.userName, phone: user.phone, address: user.address },
      password: password || undefined,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ message: 'Lỗi xử lý đặt hàng!' }, { status: 500 });
  }
} 