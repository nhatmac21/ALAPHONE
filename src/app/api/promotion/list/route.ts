import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      promotions 
    });

  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi lấy danh sách mã giảm giá' 
    }, { status: 500 });
  }
} 