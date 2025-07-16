import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productID = Number(params.id);
    if (!productID) {
      return NextResponse.json({ success: false, message: 'Thiếu ProductID!' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { ProductID: productID },
      include: {
        productvariant: true,
      },
    });
    if (!product) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm!' }, { status: 404 });
    }
    // Lấy các promo_code active, còn hạn, áp dụng cho sản phẩm này
    const now = new Date();
    const promoCodes = await prisma.promo_code.findMany({
      where: {
        productID,
        promotion: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        }
      },
      include: {
        promotion: true
      }
    });
    const reviews = await prisma.review.findMany({
      where: { productID },
      include: { user: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, product, promoCodes, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy chi tiết sản phẩm!' }, { status: 500 });
  }
} 