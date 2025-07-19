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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const productID = Number(params.id);
    if (!productID) {
      return NextResponse.json({ success: false, message: 'Thiếu ProductID!' }, { status: 400 });
    }
    const body = await req.json();
    const updateData: any = {};
    if (typeof body.name === 'string') updateData.name = body.name;
    if (typeof body.price === 'number') updateData.price = body.price;
    if (typeof body.brand === 'string') updateData.brand = body.brand;
    if (typeof body.description === 'string') updateData.description = body.description;
    if (typeof body.stockQuantity === 'number') updateData.stockQuantity = body.stockQuantity;
    if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'Không có trường nào hợp lệ để cập nhật!' }, { status: 400 });
    }
    const updated = await prisma.product.update({
      where: { ProductID: productID },
      data: updateData,
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật sản phẩm!' }, { status: 500 });
  }
} 