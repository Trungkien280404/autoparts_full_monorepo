import React from 'react';
import Card from './Card.jsx';

export default function RequireAdmin({session}){
  return (
    <Card>
      <div className="text-xl font-semibold mb-2">Yêu cầu quyền hạn</div>
      <p className="text-sm">
        {session ? 
        `Bạn đang đăng nhập với vai trò "${session.role}". Cần quyền Admin để xem trang này.` : 
        `Vui lòng đăng nhập để truy cập.`}
      </p>
    </Card>
  );
}