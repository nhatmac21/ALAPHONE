import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();
    if (!orderID) {
      return NextResponse.json({ success: false, message: 'Thiếu orderID!' }, { status: 400 });
    }
    const order = await prisma.orders.findUnique({ where: { OrderID: orderID } });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng!' }, { status: 404 });
    }
    if (order.status !== 'delivered') {
      return NextResponse.json({ success: false, message: 'Chỉ xác nhận đơn đã giao!' }, { status: 400 });
    }
    await prisma.orders.update({
      where: { OrderID: orderID },
      data: { status: 'received' },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi xác nhận nhận hàng!' }, { status: 500 });
  }
} 