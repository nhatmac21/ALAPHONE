import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Lấy danh sách user (bỏ isDeleted)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { OR: [{ isDeleted: false }, { isDeleted: true }] },
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

    if (!data.UserID) {
      return NextResponse.json({ success: false, message: "Thiếu UserID!" }, { status: 400 });
    }

    // 1. Tìm user trong DB
    const existingUser = await prisma.user.findUnique({
      where: { UserID: data.UserID },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Không tìm thấy user!" }, { status: 404 });
    }

    // 2. Nếu có yêu cầu đổi mật khẩu -> kiểm tra oldPassword
    if (data.password && data.oldPassword) {
      if (data.oldPassword !== existingUser.password) {
        return NextResponse.json({ success: false, message: "Mật khẩu cũ không đúng!" }, { status: 400 });
      }
    }

    // 3. Tạo object dữ liệu hợp lệ để update
    const updateData: any = {};
    const allowed = [
      "userName", "fullName", "email", "phone",
      "address", "birthDate", "gender", "password",
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    updateData.updatedAt = new Date();

    // 4. Thực hiện cập nhật
    const updatedUser = await prisma.user.update({
      where: { UserID: data.UserID },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi cập nhật user!",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Xóa mềm user
export async function DELETE(req: Request) {
  try {
    const { UserID } = await req.json();
    if (!UserID) return NextResponse.json({ success: false, message: 'Thiếu UserID!' }, { status: 400 });
    await prisma.user.update({ where: { UserID }, data: { isDeleted: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi xóa user!' }, { status: 500 });
  }
} 