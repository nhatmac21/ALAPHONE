import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, value, startDate, endDate, isActive } = body;

    // Không kiểm tra userID, chỉ cần xác thực nếu cần
    // Tạo promotion mới
    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        type,
        value: parseFloat(value),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tạo mã giảm giá thành công',
      promotion 
    });

  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi tạo mã giảm giá' 
    }, { status: 500 });
  }
} 