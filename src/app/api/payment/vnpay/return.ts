import { NextResponse } from 'next/server';
import crypto from 'crypto';

const vnp_HashSecret = 'HWK09QI7ILEUQRPINQXSMRXAZRG1TEE1';

export async function GET(req: Request) {
  const url = new URL(req.url);
  let vnp_Params = Object.fromEntries(url.searchParams.entries());
  const receivedSecureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedKeys = Object.keys(vnp_Params).sort();
  const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  // Thêm log debug
  console.log('VNPAY CALLBACK PARAMS:', vnp_Params);
  console.log('VNPAY CALLBACK signData:', signData);
  console.log('VNPAY CALLBACK signed:', signed);
  console.log('VNPAY CALLBACK receivedSecureHash:', receivedSecureHash);

  if (signed === receivedSecureHash) {
    // TODO: Cập nhật trạng thái đơn hàng tại đây nếu cần
    return NextResponse.json({ message: 'Thanh toán thành công!' });
  } else {
    return NextResponse.json({ message: 'Sai chữ ký!' }, { status: 400 });
  }
} 