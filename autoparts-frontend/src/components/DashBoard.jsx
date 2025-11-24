// src/components/DashBoard.jsx
import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
// === CHÚ Ý DÒNG NÀY ===
// Chúng ta dùng "import { TrafficChart }" (nhập có tên, có dấu {})
// để khớp với file ở trên.
import { TrafficChart } from './TrafficChart.jsx';

// Đặt component này ngay bên dưới function Dashboard() trong file DashBoard.jsx
// Hoặc giữ nguyên vị trí cũ nếu bạn chưa tách.

function Stat({ label, value, icon, comparison, color = 'bg-gray-50' }) {
    // Logic đơn giản để hiển thị % so sánh (ví dụ: +15%)
    const isPositive = comparison && comparison > 0;
    
    return (
        <div className={`rounded-2xl border p-4 ${color} flex items-center justify-between`}>
            <div className="flex-1">
                <div className="text-xs text-gray-600">{label}</div>
                <div className="text-2xl font-bold mt-1">
                    {value}
                </div>
                {/* Thêm Ngữ cảnh/So sánh */}
                {comparison !== undefined && (
                    <div className={`text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? `+${comparison}%` : `${comparison}%`} so với tháng trước
                    </div>
                )}
            </div>
            {/* Hiển thị Icon */}
            {icon && (
                <div className="ml-4 p-2 rounded-full bg-white/50">
                    {icon}
                </div>
            )}
        </div>
    );
}

// Các Icon SVG cần thiết (Thêm vào file DashBoard.jsx/App.jsx của bạn)
const IconUser = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 7.292 4 4 0 010-7.292zM18 16c0-1.892-3.79-3.417-8.417-3.417S1.167 14.108 1.167 16" /></svg>;
const IconOrder = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconRevenue = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v5a2 2 0 002 2h4a2 2 0 002-2v-5c0-1.105-1.343-2-3-2zM4 14h16M8 11V6a4 4 0 118 0v5" /></svg>;
const IconProduct = <svg xmlns="http://www.w3c.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 16h14M3 6h18M3 18h18" /></svg>;

// Component Dashboard chính (dùng export default)
export default function DashBoard(){
  const [ov,setOv] = useState(null);
  const [traffic,setTraffic] = useState([]);

  useEffect(()=>{
    Api.overview().then(setOv).catch(()=>{});
    Api.traffic().then(setTraffic).catch(()=>{});
  },[]);

  const topWeek = ov?.topWeek || [];
  const topMonth = ov?.topMonth || [];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* 1. THẺ TỔNG QUAN */}
      <Card className="lg:col-span-3">
        <div className="text-xl font-semibold mb-3">Tổng quan</div>
        {!ov ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : (
          <div className="grid md:grid-cols-4 gap-3">
            <Stat label="Người dùng" value={ov.users} icon={IconUser} color="bg-indigo-50" comparison={15} />
            <Stat label="Đơn hàng" value={ov.orders} icon={IconOrder} color="bg-purple-50" comparison={-5} />
            <Stat label="Doanh thu (₫)" value={ov.revenue.toLocaleString()} icon={IconRevenue} color="bg-green-50" comparison={10} />
            <Stat label="Mặt hàng (kho)" value={ov.products ?? '-'} icon={IconProduct} color="bg-red-50" />
          </div>
        )}
      </Card>

      {/* 2. THẺ BIỂU ĐỒ LƯỢT TRUY CẬP */}
    <Card className="lg:col-span-2">
    <div className="text-xl font-semibold mb-3">Lượt truy cập (30 ngày qua)</div>
    <div className="relative h-72"> 
        {traffic.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
        ) : (
        /* THAY THẾ DÒNG BIỂU ĐỒ BẰNG DÒNG TEXT NÀY */
        <TrafficChart trafficData={traffic} />
        )}
    </div>
    </Card>

      {/* 3. CỘT TOP SẢN PHẨM */}
      <div className="space-y-4 lg:col-span-1">
          <Card>
            <div className="text-xl font-semibold mb-3">Top tuần</div>
            {topWeek.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
            ) : (
              <ul className="text-sm list-disc ml-5 space-y-1">
                {topWeek.map((t,i)=>(
                  <li key={i}>{t.name} — {t.qty} món · {t.brand}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="text-xl font-semibold mb-3">Top tháng</div>
            {topMonth.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
            ) : (
              <ul className="text-sm list-disc ml-5 space-y-1">
                {topMonth.map((t,i)=>(
                  <li key={i}>{t.name} — {t.qty} món · {t.brand}</li>
                ))}
              </ul>
            )}
          </Card>
      </div>
    </div>
  );
}