import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const userID = Number(searchParams.get('userID'));
    if (!userID) {
      return NextResponse.json({ success: false, message: 'Thiếu userID!' }, { status: 400 });
    }
    // Lấy danh sách đơn hàng của user kèm thông tin sản phẩm chi tiết
    const orders = await prisma.orders.findMany({
      where: { userID },
      orderBy: { createdAt: 'desc' },
      include: {
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
    return NextResponse.json({ success: false, message: 'Lỗi lấy lịch sử đơn hàng!' }, { status: 500 });
  }
} 