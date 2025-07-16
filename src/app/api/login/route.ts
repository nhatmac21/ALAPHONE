import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin!' }, { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { phone, password } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Số điện thoại hoặc mật khẩu không đúng!' }, { status: 401 });
    }
    // Trả về thông tin user (ẩn mật khẩu)
    const { password: _, ...userInfo } = user;
    // Tạo token giả lập (nếu muốn bảo mật hơn thì dùng JWT)
    const token = 'dummy-token';
    return NextResponse.json({ success: true, user: userInfo, token });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi đăng nhập!' }, { status: 500 });
  }
} 