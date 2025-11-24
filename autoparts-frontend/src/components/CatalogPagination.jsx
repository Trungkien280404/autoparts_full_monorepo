import React from 'react';
import Button from './Button.jsx';

export default function CatalogPagination({ page, totalPages, onPrev, onNext, onGo }) {
  // Tạo mảng số trang để hiển thị
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Logic hiển thị rút gọn nếu quá nhiều trang (tùy chọn, ở đây làm đơn giản trước)
  const visiblePages = pages.filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1));

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button 
        variant="outline" 
        onClick={onPrev} 
        disabled={page === 1}
        className="px-3"
      >
        Trước
      </Button>

      {visiblePages.map((p, index) => {
        // Thêm dấu ... nếu khoảng cách giữa các trang lớn hơn 1
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && p - prevPage > 1;

        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="text-gray-400">...</span>}
            <button
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => onGo(p)}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <Button 
        variant="outline" 
        onClick={onNext} 
        disabled={page === totalPages}
        className="px-3"
      >
        Sau
      </Button>
    </div>
  );
}