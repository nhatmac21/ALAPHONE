import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = Number(params.id);
    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu mã đơn hàng!' }, { status: 400 });
    }
    const order = await prisma.orders.findUnique({
      where: { OrderID: orderId },
      include: {
        orderitem: {
          include: {
            productvariant: {
              select: {
                image: true,
                RAM: true,
                ROM: true,
                color: true,
              }
            }
          }
        }
      }
    });
    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng!' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi lấy chi tiết đơn hàng!' }, { status: 500 });
  }
} 