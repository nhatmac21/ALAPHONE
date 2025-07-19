import { NextResponse } from 'next/server';
import crypto from 'crypto';
import qs from 'qs';

const vnp_TmnCode = 'LPV8MJWS';
const vnp_HashSecret = 'HWK09QI7ILEUQRPINQXSMRXAZRG1TEE1';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'https://34310ad8884b.ngrok-free.app/api/payment/vnpay/return';

export async function POST(req: Request) {
  try {
    const { name, phone, address, cart, total } = await req.json();
    const date = new Date();
    const vnp_TxnRef = date.getTime().toString();
    
    const vnp_OrderInfo = `Thanh toan don hang Alaphone`;
    const vnp_Amount = Math.round(Number(total) * 100); // Đảm bảo là số nguyên
    const vnp_IpAddr = '127.0.0.1';
    // Định dạng yyyyMMddHHmmss
    const pad = (n: number) => n.toString().padStart(2, '0');
    const vnp_CreateDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

    let vnp_Params: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef,
      vnp_OrderInfo,
      vnp_OrderType: 'other',
      vnp_Amount,
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate,
    };

    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params.vnp_SecureHash = vnp_SecureHash;
    const paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });
    return NextResponse.json({ paymentUrl });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi tạo link thanh toán VNPay!' }, { status: 500 });
  }
} 