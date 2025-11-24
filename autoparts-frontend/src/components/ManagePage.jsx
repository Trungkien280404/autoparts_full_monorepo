import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';

// Import các component con
// Chú ý: Đảm bảo các file này đều dùng "export default"
import ManageProducts from './ManageProducts.jsx';
import ManageOrders from './ManageOrders.jsx';

export default function ManagePage() {
  // Mặc định vào tab 'products' để admin quản lý sản phẩm trước
  const [subRoute, setSubRoute] = useState('products');

  const TabBtn = ({ active, children, onClick }) => (
    <button
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${active
        ? 'bg-gray-900 text-white shadow-lg shadow-gray-300 transform scale-105'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* MENU TABS */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <TabBtn active={subRoute === 'products'} onClick={() => setSubRoute('products')}>
          📦 Quản lý Sản phẩm
        </TabBtn>
        <TabBtn active={subRoute === 'users'} onClick={() => setSubRoute('users')}>
          👥 Quản lý Người dùng
        </TabBtn>
        <TabBtn active={subRoute === 'orders'} onClick={() => setSubRoute('orders')}>
          🛒 Quản lý Đơn hàng
        </TabBtn>
      </div>

      {/* KHUNG HIỂN THỊ NỘI DUNG */}
      <div className="min-h-[600px]">
        {subRoute === 'products' && <ManageProducts />}
        {subRoute === 'orders' && <ManageOrders />}
        {subRoute === 'users' && <UserManager />}
      </div>
    </div>
  );
}

/** ========= Component Quản lý Người dùng ========= */
// (Đặt ở đây cho gọn vì logic đơn giản, không cần tách file riêng nếu không muốn)
function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Các vai trò trong hệ thống
  const rolesToSet = ['user', 'staff', 'admin'];

  useEffect(() => {
    setLoading(true);
    Api.adminGetUsers()
      .then(data => {
        // Sắp xếp theo thứ tự: Admin -> Staff -> User
        const rolePriority = { admin: 1, staff: 2, user: 3 };
        const sorted = data.sort((a, b) => {
          const pA = rolePriority[a.role] || 4;
          const pB = rolePriority[b.role] || 4;
          return pA - pB;
        });
        setUsers(sorted);
      })
      .catch(err => setError(err.message || 'Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id, newRole) {
    if (loading) return;
    // Optimistic Update: Cập nhật giao diện ngay lập tức
    const oldUsers = [...users];
    setUsers(users.map(u => (u.id === id ? { ...u, role: newRole } : u)));

    try {
      await Api.adminUpdateUserRole(id, newRole);
      // Thành công: Không làm gì thêm
    } catch (e) {
      // Thất bại: Hoàn tác lại giao diện cũ và báo lỗi
      setUsers(oldUsers);
      alert('Lỗi cập nhật vai trò: ' + e.message);
    }
  }

  async function handleDelete(id) {
    if (loading) return;
    if (!confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng này không?')) return;

    setLoading(true);
    try {
      await Api.adminDeleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert('Lỗi xóa người dùng: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <div className="text-xl font-bold text-gray-800">
          Danh sách Người dùng ({users.length})
        </div>
        {loading && <span className="text-xs text-blue-500 animate-pulse font-medium">Đang đồng bộ dữ liệu...</span>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-[600px]">
          {/* Header Bảng */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-5">Thông tin cá nhân</div>
            <div className="col-span-4">Vai trò hệ thống</div>
            <div className="col-span-3 text-right">Hành động</div>
          </div>

          {/* Nội dung Bảng */}
          <div className="divide-y divide-gray-100 bg-white max-h-[60vh] overflow-y-auto custom-scrollbar">
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-blue-50 transition duration-150">

                {/* Cột Thông tin */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${user.role === 'admin' ? 'bg-purple-600' : user.role === 'staff' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate" title={user.name}>{user.name}</div>
                    <div className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</div>
                  </div>
                </div>

                {/* Cột Vai trò */}
                <div className="col-span-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`w-full border rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer transition-colors ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' :
                      user.role === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' :
                        'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-400'
                      }`}
                    disabled={loading}
                  >
                    {rolesToSet.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                  </select>
                </div>

                {/* Cột Hành động */}
                <div className="col-span-3 text-right">
                  <Button
                    variant="ghost"
                    className="!px-3 !py-1.5 !text-xs text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors"
                    onClick={() => handleDelete(user.id)}
                    disabled={loading}
                  >
                    Xóa User
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400 text-sm italic">
                Chưa có người dùng nào trong hệ thống.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}