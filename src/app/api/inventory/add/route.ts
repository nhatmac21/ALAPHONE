import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userID, variantID, quantity } = await req.json();
    if (!userID || !variantID || !quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin hoặc số lượng không hợp lệ!' }, { status: 400 });
    }
    // Kiểm tra user có phải staff không
    const user = await prisma.user.findUnique({ where: { UserID: userID } });
    if (!user || user.role !== 'staff') {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền nhập kho!' }, { status: 403 });
    }
    // Ghi log nhập kho
    await prisma.inventory_log.create({
      data: {
        userID,
        variantID,
        quantity,
      },
    });
    // Cộng stockQuantity vào product (tìm product theo variantID)
    const variant = await prisma.productvariant.findUnique({ where: { VariantID: variantID } });
    if (!variant || !variant.ProductID) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biến thể sản phẩm!' }, { status: 404 });
    }
    await prisma.product.update({
      where: { ProductID: Number(variant.ProductID) },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });
    return NextResponse.json({ success: true, message: 'Nhập kho thành công!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi nhập kho!' }, { status: 500 });
  }
} 