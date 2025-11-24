import React from 'react';
import Card from './Card.jsx';

export default function Account({session}){
  if(!session) return <Card><p className="text-sm">Vui lòng đăng nhập để xem thông tin tài khoản.</p></Card>;
  return (
    <Card>
      <div className="text-xl font-semibold mb-2">Tài khoản của tôi</div>
      <div className="text-sm space-y-1">
        <div><span className="text-gray-500">Họ tên:</span> {session.name}</div>
        <div><span className="text-gray-500">Email:</span> {session.email}</div>
        <div><span className="text-gray-500">Vai trò:</span> {session.role}</div>
      </div>
    </Card>
  );
}