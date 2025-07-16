import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Tạo user staff test
    const staff = await prisma.user.create({
      data: {
        userName: 'staff1',
        password: '123456',
        fullName: 'Nhân viên 1',
        email: 'staff1@alaphone.com',
        phone: '0123456789',
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tạo staff thành công',
      staff: {
        id: staff.UserID,
        userName: staff.userName,
        fullName: staff.fullName,
        phone: staff.phone,
        role: staff.role
      }
    });

  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi tạo staff' 
    }, { status: 500 });
  }
} 