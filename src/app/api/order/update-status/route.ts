import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderID, status, note } = await req.json();
    if (!orderID || !status) {
      return NextResponse.json({ success: false, message: 'Thiếu orderID hoặc status!' }, { status: 400 });
    }
    const validStatus = ['pending', 'delivered', 'cancelled'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ!' }, { status: 400 });
    }
    const updateData: any = { status };
    if (note) updateData.note = note;
    await prisma.orders.update({
      where: { OrderID: orderID },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng!' }, { status: 500 });
  }
} 