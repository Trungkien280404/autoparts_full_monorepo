import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import CatalogPagination from './CatalogPagination.jsx';
import { PART_LABELS } from '../constants.js';

export default function Catalog({ cart, onAddToCart, onDecreaseFromCart, onCheckout }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('default');
  const [part, setPart] = useState('all');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Api.products()
      .then(setProducts)
      .catch(err => console.error("Lỗi tải sản phẩm:", err));
  }, []);

  // Tạo danh sách Part duy nhất
  const parts = ['all', ...Array.from(new Set(products.map(p => p.part)))];

  // Lọc và Sắp xếp sản phẩm
  const filtered = products
    .filter(p =>
      (part === 'all' || p.part === part) &&
      (q === '' || p.name.toLowerCase().includes(q.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return 0; // default
    });

  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function go(n) { setPage(n); }
  function prev() { setPage(p => Math.max(1, p - 1)); }
  function next() { setPage(p => Math.min(totalPages, p + 1)); }

  // Tính tổng tiền
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="grid lg:grid-cols-3 gap-4 animate-fade-in">
      {/* LEFT: Danh mục sản phẩm */}
      <div className="lg:col-span-2">
        <Card className="relative overflow-hidden h-full">
          {/* Nền Gradient */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: "#ffffff",
              backgroundImage: `radial-gradient(circle at top left, rgba(173, 109, 244, 0.15), transparent 70%)`,
              filter: "blur(60px)",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="relative z-10">
            <div className="text-xl font-bold mb-4 text-gray-800">Danh mục sản phẩm</div>

            {/* Bộ lọc */}
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <Input
                placeholder="🔍 Tìm kiếm tên sản phẩm..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className="md:col-span-2"
              />

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer hover:border-blue-400 transition-colors"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="name_asc">Tên: A - Z</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer hover:border-blue-400 transition-colors"
                value={part}
                onChange={e => setPart(e.target.value)}
              >
                <option value="all">Tất cả Loại</option>
                {parts.filter(k => k !== 'all').map((k, index) => (
                  <option key={`part-${index}-${k}`} value={k}>
                    {PART_LABELS[k] || k}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid sản phẩm */}
            {pageItems.length > 0 ? (
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
                {pageItems.map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                    <div className="h-40 w-full bg-gray-50 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image' }}
                      />
                      {p.stock <= 5 && p.stock > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                          Sắp hết
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{p.brand}</span>
                        <span className="text-gray-400">{PART_LABELS[p.part] || p.part}</span>
                      </div>

                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 flex-1" title={p.name}>
                        {p.name}
                      </h3>

                      <div className="mt-auto pt-3 border-t border-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-blue-600">{p.price.toLocaleString()}₫</span>
                          <span className="text-xs text-gray-400">Kho: {p.stock}</span>
                        </div>

                        <Button
                          className="w-full py-2 text-sm bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
                          onClick={() => onAddToCart(p)}
                          disabled={p.stock <= 0}
                        >
                          {p.stock > 0 ? '+ Thêm vào giỏ' : 'Hết hàng'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>Không tìm thấy sản phẩm nào.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <CatalogPagination page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGo={go} />
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT: GIỎ HÀNG (SIDEBAR) */}
      <div>
        <Card className="sticky top-24 h-fit border-t-4 border-t-gray-900 shadow-md">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🛒 Giỏ hàng
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {cartCount} món
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm">Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto max-h-[50vh] custom-scrollbar pr-1 space-y-3 mb-4">
                {cart.map(i => (
                  <div key={i.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition group">
                    <div className="w-14 h-14 rounded-md border border-gray-200 bg-white overflow-hidden flex-shrink-0">
                      <img src={i.img} className="w-full h-full object-cover" alt={i.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Img' }} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1" title={i.name}>{i.name}</div>
                      <div className="text-xs text-gray-500 flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                            onClick={() => onDecreaseFromCart(i.id)}
                            title="Giảm số lượng"
                          >
                            -
                          </button>
                          <span>SL: x{i.qty}</span>
                          <button
                            className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                            onClick={() => onAddToCart(i)}
                            title="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900">{(i.qty * i.price).toLocaleString()}₫</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-sm text-gray-500">Tổng thanh toán</div>
                  <div className="font-bold text-xl text-red-600">{total.toLocaleString()}₫</div>
                </div>

                <Button
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-300 hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                  onClick={onCheckout}
                >
                  <span>Thanh toán ngay</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}