import React, { useState } from 'react';
import Button from './Button.jsx';
import AuthModal from './AuthModal.jsx';

export default function Header({ current, onNavigate, session, setSession }) {
  const [showAuth, setShowAuth] = useState(false);

  // Hàm chọn variant: Nếu là tab hiện tại thì dùng 'primary' (đen), ngược lại 'ghost' (nhạt)
  const getVariant = (tabName) => current === tabName ? 'primary' : 'ghost';

  const isAdmin = session?.role === 'admin';

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto p-4 flex items-center gap-2">
        <div
          className="font-bold text-2xl cursor-pointer text-gray-900 tracking-tight mr-4"
          // Nếu là admin thì về trang dashboard, ngược lại về trang chủ
          onClick={() => onNavigate(isAdmin ? 'dashboard' : 'home')}
        >
          AutoParts
        </div>

        {/* Menu chính */}
        <nav className="flex items-center gap-1">

          {/* NHÓM KHÁCH HÀNG (Ẩn với Admin) */}
          {!isAdmin && (
            <>
              <Button
                variant={getVariant('home')}
                onClick={() => onNavigate('home')}
              >
                Sản phẩm
              </Button>

              <Button
                variant={getVariant('diagnose')}
                onClick={() => onNavigate('diagnose')}
              >
                Chẩn đoán ảnh
              </Button>
            </>
          )}

          {/* NHÓM QUẢN TRỊ (Chỉ hiện với Admin) */}
          {isAdmin && (
            <>
              <Button
                variant={getVariant('dashboard')}
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={getVariant('manage')}
                onClick={() => onNavigate('manage')}
              >
                Quản lý
              </Button>
            </>
          )}

          {/* ĐƠN HÀNG (Chỉ hiện với User thường đã đăng nhập) */}
          {session && !isAdmin && (
            <Button
              variant={getVariant('orders')}
              onClick={() => onNavigate('orders')}
            >
              Đơn hàng của tôi
            </Button>
          )}
        </nav>

        {/* Khu vực tài khoản (Bên phải) */}
        <div className="ml-auto flex items-center gap-3">
          {session ? (
            <>
              <div className="text-sm text-right hidden sm:block">
                <div className="font-medium">{session.name}</div>
                <div className="text-xs text-gray-500 uppercase">{session.role}</div>
              </div>

              <Button
                variant="outline"
                onClick={() => onNavigate('account')}
                className="!px-3"
              >
                Tài khoản
              </Button>

              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  setSession(null);
                  onNavigate('home'); // Đăng xuất xong về trang chủ
                }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowAuth(true)}>
              Đăng nhập / Đăng ký
            </Button>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(s) => {
            setSession(s.user);
            setShowAuth(false);
            // Nếu đăng nhập là admin, tự động chuyển sang Dashboard
            if (s.user.role === 'admin') onNavigate('dashboard');
          }}
        />
      )}
    </header>
  );
}