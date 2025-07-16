import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        orderitem: {
          include: {
            productvariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách đơn hàng!' }, { status: 500 });
  }
} 