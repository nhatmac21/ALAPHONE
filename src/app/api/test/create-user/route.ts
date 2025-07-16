import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Tạo user test
    const user = await prisma.user.create({
      data: {
        userName: 'testuser',
        password: '123456',
        fullName: 'Người dùng test',
        email: 'test@example.com',
        phone: '0123456789',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tạo user thành công',
      user: {
        id: user.UserID,
        userName: user.userName,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi tạo user' 
    }, { status: 500 });
  }
} 