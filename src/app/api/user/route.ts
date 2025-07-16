import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Lấy danh sách user (bỏ isDeleted)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { OR: [{ isDeleted: false }, { isDeleted: null }] },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách user!' }, { status: 500 });
  }
}

// Tạo user mới
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await prisma.user.create({ data });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi tạo user!' }, { status: 500 });
  }
}

// Cập nhật user
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.UserID) return NextResponse.json({ success: false, message: 'Thiếu UserID!' }, { status: 400 });
    const user = await prisma.user.update({ where: { UserID: data.UserID }, data });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật user!' }, { status: 500 });
  }
} 