import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const promoCodes = await prisma.promo_code.findMany({
      include: {
        product: {
          select: {
            ProductID: true,
            name: true,
            price: true
          }
        },
        promotion: {
          select: {
            DiscountID: true,
            name: true,
            type: true,
            value: true,
            isActive: true
          }
        },
        user: {
          select: {
            UserID: true,
            fullName: true,
            userName: true
          }
        }
      },
      orderBy: {
        productID: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      promoCodes 
    });

  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi lấy danh sách mã giảm giá' 
    }, { status: 500 });
  }
} 