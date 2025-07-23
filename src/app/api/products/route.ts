import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showInactive = searchParams.get('showInactive') === 'true';

    // Lấy danh sách sản phẩm bao gồm stockQuantity
    const products = await prisma.product.findMany({
      where: showInactive ? {} : { isActive: true },
      select: {
        ProductID: true,
        name: true,
        description: true,
        price: true,
        stockQuantity: true, // Thêm stockQuantity vào kết quả
        category: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        brand: true,
        productvariant: {
          select: {
            VariantID: true,
            image: true,
            RAM: true,
            ROM: true,
            color: true,
          },
        },
      },
    });

    // Lấy promoCodes cho từng sản phẩm (nếu có)
    let productsWithPromo = products;
    try {
      const now = new Date();
      const productIDs = products.map(p => p.ProductID).filter(Boolean);
      let allPromoCodes: any[] = [];
      if (productIDs.length > 0) {
        allPromoCodes = await prisma.promo_code.findMany({
          where: {
            productID: { in: productIDs },
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
      }
      productsWithPromo = products.map(p => ({
        ...p,
        promoCodes: allPromoCodes.filter(pc => pc.productID === p.ProductID)
      }));
    } catch (promoError) {
      // Nếu lỗi khi lấy promo_code, chỉ trả về sản phẩm
      productsWithPromo = products;
    }

    return NextResponse.json({ products: productsWithPromo, total: productsWithPromo.length });
  } catch (error: any) {
    console.error("API /api/products error:", error);
    return NextResponse.json({ products: [], total: 0, message: 'Lỗi lấy danh sách sản phẩm!', error: error.message }, { status: 500 });
  }
} 