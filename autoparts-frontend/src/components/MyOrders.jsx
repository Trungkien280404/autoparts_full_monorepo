import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';

const STATUS_MAP = {
  pending: { label: 'Đang xử lý', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  shipping: { label: 'Đang giao hàng', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  completed: { label: 'Hoàn thành', color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled: { label: 'Đã hủy', color: 'text-red-700 bg-red-50 border-red-200' }
};

export default function MyOrders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    Api.myOrders()
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleReceive = async (id) => {
    if (!confirm("Bạn đã nhận được hàng và muốn xác nhận hoàn thành đơn hàng?")) return;
    try {
      await Api.receiveOrder(id);
      loadData(); // Reload list
    } catch (e) {
      alert(e.message || "Lỗi xác nhận");
    }
  };

  return (
    <Card>
      <div className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>Đơn hàng của tôi</span>
        <Button variant="outline" onClick={loadData} disabled={loading} className="text-xs py-1 px-2 h-8">
          Làm mới
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">Chưa có đơn hàng nào.</div>
      ) : (
        <div className="grid gap-4">
          {data.map(o => {
            const statusInfo = STATUS_MAP[o.status] || { label: o.status, color: 'text-gray-600 bg-gray-50' };

            return (
              <div key={o.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition bg-white">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="font-bold text-gray-800">Đơn hàng #{o.id}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <div className="font-bold text-blue-600 mt-1">
                      {Number(o.total).toLocaleString()}₫
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="text-sm flex justify-between items-center text-gray-700">
                      <span className="flex-1">
                        <span className="font-medium">x{it.qty}</span> {it.product?.name || `(Sản phẩm ${it.pid} đã xóa)`}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {(it.product?.price || 0).toLocaleString()}₫
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                {o.status === 'shipping' && (
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <Button
                      onClick={() => handleReceive(o.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-4"
                    >
                      ✅ Đã nhận được hàng
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}