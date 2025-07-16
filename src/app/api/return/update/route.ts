import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { returnID, status, reason } = await req.json();
    if (!returnID || !status || (status === 'rejected' && !reason)) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin!' }, { status: 400 });
    }
    const updateData: any = { status };
    if (status === 'rejected') updateData.processedAt = reason;
    else updateData.processedAt = new Date().toISOString();
    await prisma.returns.update({
      where: { returnID },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật trạng thái trả hàng!' }, { status: 500 });
  }
} 