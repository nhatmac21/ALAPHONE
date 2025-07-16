import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const returns = await prisma.returns.findMany({
      include: {
        orders: {
          include: {
            user: true,
            orderitem: true,
          },
        },
        refund: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, returns });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách yêu cầu trả hàng!' }, { status: 500 });
  }
} 