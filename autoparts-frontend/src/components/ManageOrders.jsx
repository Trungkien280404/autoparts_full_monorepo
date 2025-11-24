import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải danh sách đơn hàng khi vào trang
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    Api.adminGetOrders()
      .then(setOrders)
      .catch(err => alert('Lỗi tải đơn hàng: ' + err.message))
      .finally(() => setLoading(false));
  };

  // Hàm cập nhật trạng thái
  const updateStatus = async (orderId, newStatus) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng #${orderId} sang "${newStatus}"?`)) return;
    
    try {
      await Api.adminUpdateOrderStatus(orderId, newStatus);
      // Cập nhật lại danh sách local để UI thay đổi ngay
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      alert('Lỗi cập nhật: ' + e.message);
    }
  };

  // Hàm hiển thị badge trạng thái đẹp mắt
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-blue-100 text-blue-800 border-blue-200",
      shipping: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = {
      pending: "Chờ xử lý",
      paid: "Đã thanh toán",
      shipping: "Đang giao (Ship COD)",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-semibold">Quản lý Đơn hàng ({orders.length})</div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header đơn hàng: ID, Ngày, Trạng thái */}
            <div className="flex flex-wrap justify-between items-start border-b border-gray-100 pb-3 mb-3 gap-2">
              <div>
                <div className="font-bold text-lg text-gray-800">Đơn hàng #{order.id}</div>
                <div className="text-sm text-gray-500">{new Date(order.createdat).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  {order.payment_method === 'cod' ? '💸 Thanh toán khi nhận (COD)' : '💳 Chuyển khoản'}
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">👤 Người nhận:</div>
                <div><span className="font-medium">{order.customer_name}</span></div>
                <div>📞 {order.customer_phone}</div>
                <div className="truncate" title={order.customer_address}>🏠 {order.customer_address}</div>
              </div>
              
              {/* Chi tiết sản phẩm */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">📦 Sản phẩm:</div>
                <ul className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                  {order.items && order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-xs">
                      <span className="truncate w-2/3" title={item.product_name}>
                        {item.qty}x {item.product_name || `SP #${item.pid}`}
                      </span>
                      <span className="font-medium">{(item.price * item.qty).toLocaleString()}₫</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 mt-2 pt-1 text-right font-bold text-red-600">
                  Tổng: {parseFloat(order.total).toLocaleString()}₫
                </div>
              </div>
            </div>

            {/* Hành động của Admin (Chỉ hiện khi đơn chưa hoàn thành/hủy) */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500 flex items-center mr-2">Cập nhật trạng thái:</span>
                
                {order.status === 'pending' && (
                  <>
                    <Button 
                        className="!px-3 !py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => updateStatus(order.id, 'paid')}
                    >
                        Xác nhận đã TT
                    </Button>
                    <Button 
                        className="!px-3 !py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => updateStatus(order.id, 'shipping')}
                    >
                        Gửi Ship COD
                    </Button>
                  </>
                )}

                {order.status === 'paid' && (
                    <Button 
                        className="!px-3 !py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => updateStatus(order.id, 'shipping')}
                    >
                        Gửi hàng
                    </Button>
                )}

                {order.status === 'shipping' && (
                    <Button 
                        className="!px-3 !py-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatus(order.id, 'completed')}
                    >
                        Hoàn thành đơn
                    </Button>
                )}

                <Button 
                    variant="ghost"
                    className="!px-3 !py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(order.id, 'cancelled')}
                >
                    Hủy đơn
                </Button>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-10">Chưa có đơn hàng nào.</div>
        )}
      </div>
    </Card>
  );
}