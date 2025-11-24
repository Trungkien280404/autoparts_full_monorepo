import React, { useState } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import { Spinner } from './Icons.jsx'; // Import Spinner

export default function Checkout({ cart, onCheckoutSuccess, onCancel, removeFromCart }) {
  // State lưu thông tin người mua
  const [info, setInfo] = useState({ name: '', phone: '', address: '' });
  // State lưu phương thức thanh toán (mặc định là COD)
  const [method, setMethod] = useState('cod'); // 'cod' hoặc 'banking'
  const [loading, setLoading] = useState(false);

  // Tính tổng tiền đơn hàng
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  // Xử lý đặt hàng
  async function handleOrder() {
    // 1. Validate: Yêu cầu nhập đủ thông tin
    if (!info.name || !info.phone || !info.address) {
      return alert('Vui lòng điền đầy đủ thông tin giao hàng (Tên, SĐT, Địa chỉ).');
    }

    // 2. Validate số điện thoại (cơ bản)
    if (!/^\d{10,11}$/.test(info.phone)) {
      return alert('Số điện thoại không hợp lệ (phải có 10-11 số).');
    }

    setLoading(true);
    try {
      // 3. Gọi API tạo đơn hàng với đầy đủ thông tin
      // Backend đã được update để nhận { items, info, method }
      await Api.checkout(
        cart.map(i => ({ pid: i.id, qty: i.qty })), // Danh sách items (chỉ cần id và qty)
        info,   // Thông tin người nhận { name, phone, address }
        method  // Phương thức thanh toán ('cod' hoặc 'banking')
      );

      // 4. Thông báo thành công
      alert(`🎉 Đặt hàng thành công!\nCảm ơn ${info.name} đã mua hàng.\nChúng tôi sẽ liên hệ SĐT ${info.phone} để giao hàng.`);

      // 5. Gọi callback để App.jsx xử lý (xóa giỏ, chuyển trang)
      onCheckoutSuccess();
    } catch (e) {
      alert('Lỗi đặt hàng: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Nếu giỏ hàng trống, hiển thị thông báo và nút quay lại
  if (cart.length === 0) {
    return (
      <Card className="text-center py-12 flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">🛒</div>
        <div className="text-xl font-medium text-gray-900 mb-2">Giỏ hàng của bạn đang trống</div>
        <div className="text-gray-500 mb-6">Hãy quay lại và chọn thêm sản phẩm nhé!</div>
        <Button onClick={onCancel}>Quay lại mua sắm</Button>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-fade-in pb-10">
      {/* CỘT TRÁI: FORM THÔNG TIN & THANH TOÁN */}
      <div className="space-y-6">
        {/* 1. Thông tin giao hàng */}
        <Card>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <span className="bg-gray-100 p-1 rounded text-base">📍</span> Thông tin giao hàng
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn A"
                value={info.name}
                onChange={e => setInfo({ ...info, name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <Input
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={info.phone}
                onChange={e => setInfo({ ...info, phone: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow bg-white"
                rows="3"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                value={info.address}
                onChange={e => setInfo({ ...info, address: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        {/* 2. Phương thức thanh toán */}
        <Card>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <span className="bg-gray-100 p-1 rounded text-base">💳</span> Phương thức thanh toán
          </div>
          <div className="space-y-3">
            {/* Option 1: COD */}
            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${method === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <div className="mt-0.5">
                <input
                  type="radio" name="payment" value="cod"
                  checked={method === 'cod'} onChange={() => setMethod('cod')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                <div className="text-sm text-gray-500 mt-0.5">Bạn sẽ thanh toán tiền mặt cho shipper khi nhận được hàng. An toàn và tiện lợi.</div>
              </div>
            </label>

            {/* Option 2: Banking */}
            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${method === 'banking' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <div className="mt-0.5">
                <input
                  type="radio" name="payment" value="banking"
                  checked={method === 'banking'} onChange={() => setMethod('banking')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div className="w-full">
                <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                <div className="text-sm text-gray-500 mt-0.5">Thanh toán qua VietQR, Momo hoặc ZaloPay.</div>

                {/* Hiển thị thông tin CK nếu chọn Banking */}
                {method === 'banking' && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-100 text-sm text-gray-700 animate-fade-in">
                    <p className="font-medium text-blue-800 mb-1">Thông tin chuyển khoản:</p>
                    <p>• Ngân hàng: <b>MB Bank</b></p>
                    <p>• STK: <b>0000123456789</b></p>
                    <p>• Chủ TK: <b>AUTO PARTS SHOP</b></p>
                    <p className="mt-1 text-xs text-gray-500 italic">Nội dung: [SĐT của bạn]</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </Card>
      </div>

      {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
      <div className="space-y-6">
        {/* Danh sách sản phẩm */}
        <Card>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <span className="bg-gray-100 p-1 rounded text-base">📦</span> Sản phẩm ({cart.length})
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 group relative border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 relative">
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                  <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-medium">
                    x{item.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.brand}</div>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <div className="text-sm font-semibold text-gray-900">
                    {(item.price * item.qty).toLocaleString()}₫
                  </div>
                  {item.qty > 1 && (
                    <div className="text-[10px] text-gray-400">
                      {item.price.toLocaleString()}₫/cái
                    </div>
                  )}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 underline cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="sticky top-24 border-t-4 border-t-gray-900">
          <div className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Tạm tính ({cart.reduce((acc, item) => acc + item.qty, 0)} sản phẩm):</span>
              <span>{total.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Phí vận chuyển:</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300">
              <span className="font-semibold text-gray-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-red-600 tracking-tight">{total.toLocaleString()}₫</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 hover:text-gray-900"
              onClick={onCancel}
              disabled={loading}
            >
              Quay lại
            </Button>
            <Button
              className="flex-[2] bg-gray-900 hover:bg-black text-white py-3 shadow-lg shadow-gray-300 hover:shadow-gray-400 transition-all transform active:scale-[0.98]"
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner /> Đang xử lý...
                </div>
              ) : (
                `Đặt hàng ngay`
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Bằng việc đặt hàng, bạn đồng ý với điều khoản dịch vụ của AutoParts.
          </p>
        </Card>
      </div>
    </div>
  );
}