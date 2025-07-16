import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userID, product, variants } = await req.json();
    if (!userID || !product || !variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin sản phẩm hoặc biến thể!' }, { status: 400 });
    }
    // Kiểm tra quyền staff
    const user = await prisma.user.findUnique({ where: { UserID: userID } });
    if (!user || user.role !== 'staff') {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền thêm sản phẩm!' }, { status: 403 });
    }
    // Tạo product
    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        brand: product.brand,
        warranty: product.warranty ? new Date(product.warranty) : undefined,
      },
    });
    // Tạo các variant
    for (const v of variants) {
      await prisma.productvariant.create({
        data: {
          ProductID: newProduct.ProductID,
          color: v.color,
          storage: v.storage,
          RAM: v.RAM,
          ROM: v.ROM,
          image: v.image,
        },
      });
    }
    return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi thêm sản phẩm!' }, { status: 500 });
  }
} 