import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Đặt hàng thành công!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Cảm ơn bạn đã đặt hàng tại Alaphone.<br />
            Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.
          </p>
          <p className="text-green-700 font-semibold mb-2">
            Vui lòng lưu lại mã đơn hàng và thông tin tài khoản (nếu có) để tra cứu đơn hàng sau này.
          </p>
          <Link href="/" className="inline-block mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
} 