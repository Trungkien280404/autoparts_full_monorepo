import React, { useState, useEffect } from 'react';
import { Api } from '../api.js';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import { PART_LABELS } from '../constants.js';
import { Spinner } from './Icons.jsx';

export default function ManageProducts() {
  const [list, setList] = useState([]);
  // Initialize price and stock as empty strings to force user input
  const [draft, setDraft] = useState({ id: null, name: '', part: 'headlight', price: '', stock: '', img: '', imageFile: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Api.products()
      .then(setList)
      .catch(err => setError("Không thể tải danh sách sản phẩm"))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(product) {
    setError('');
    setDraft({ ...product, imageFile: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setError('');
    setDraft({ id: null, name: '', part: 'headlight', price: '', stock: '', img: '', imageFile: null });
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setDraft({ ...draft, imageFile: file, img: previewUrl });
    }
  };

  async function handleSubmit() {
    setError('');
    const { id, name, part, price, stock, imageFile } = draft;

    if (!name || !name.trim()) {
      return setError('Vui lòng nhập tên sản phẩm.');
    }
    if (!part) {
      return setError('Vui lòng chọn loại phụ tùng.');
    }

    // Validate Price
    if (price === '' || price === null) {
      return setError('Bạn vui lòng nhập giá.');
    }
    if (Number(price) <= 0) {
      return setError('Giá bán phải lớn hơn 0.');
    }

    // Validate Stock
    if (stock === '' || stock === null) {
      return setError('Bạn vui lòng nhập số lượng kho.');
    }
    if (Number(stock) < 0) {
      return setError('Số lượng kho không được âm.');
    }

    // Validate Image for new products
    if (!id && !imageFile && !draft.img) {
      return setError('Vui lòng chọn ảnh cho sản phẩm mới.');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('part', part);
    formData.append('price', price);
    formData.append('stock', stock);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (draft.img && !id) {
      if (!draft.img.startsWith('http')) return setError('Vui lòng chọn ảnh sản phẩm.');
    }

    setLoading(true);
    try {
      let p;
      if (id) {
        p = await Api.updateProduct(id, formData);
        setList(prev => prev.map(x => x.id === id ? p : x));
      } else {
        p = await Api.createProduct(formData);
        setList(prev => [p, ...prev]);
      }
      cancelEdit();
    } catch (e) {
      console.error(e);
      setError(e.message || "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    setLoading(true);
    try {
      await Api.deleteProduct(id);
      setList(prev => prev.filter(x => x.id !== id));
      if (draft.id === id) cancelEdit();
    } catch (e) {
      setError(e.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* CỘT TRÁI: FORM THÊM/SỬA */}
      <Card className="h-fit">
        <div className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
          {draft.id ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
          {loading && <Spinner />}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg mb-4 text-sm flex items-center">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <Input
              placeholder="Ví dụ: Đèn pha Toyota Vios"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại phụ tùng</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={draft.part}
                onChange={e => setDraft({ ...draft, part: e.target.value })}
                disabled={loading}
              >
                {Object.entries(PART_LABELS).map(([key, label]) => {
                  if (['headlight', 'mirror', 'windshield', 'fog_light', 'mudguard'].includes(key)) {
                    return <option key={key} value={key}>{label}</option>
                  }
                  return null;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <Input
                type="number"
                placeholder="0"
                value={draft.stock}
                onChange={e => setDraft({ ...draft, stock: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
            <div className="relative w-full">
              <Input
                type="number"
                placeholder="0"
                value={draft.price}
                onChange={e => setDraft({ ...draft, price: e.target.value })}
                disabled={loading}
                className="pr-12 font-medium"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none text-sm font-bold">
                VNĐ
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition ${draft.img ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="text-xs text-gray-500">{draft.imageFile ? draft.imageFile.name : "Bấm để chọn ảnh"}</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={loading} />
            </label>
          </div>

          {draft.img && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img src={draft.img} alt="Preview" className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image' }}
              />
              {draft.imageFile && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md font-bold">
                  Ảnh Mới
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <Button className="w-full py-2.5 shadow-sm" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : (draft.id ? 'Lưu thay đổi' : 'Thêm sản phẩm')}
            </Button>

            {draft.id && (
              <Button variant="outline" className="w-full py-2.5" onClick={cancelEdit} disabled={loading}>
                Hủy chỉnh sửa & Tạo mới
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* RIGHT: DANH SÁCH SẢN PHẨM */}
      <Card className="h-fit">
        <div className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
          Danh sách sản phẩm ({list.length})
        </div>

        {loading && list.length === 0 && (
          <div className="text-center py-10 text-blue-500 animate-pulse">Đang tải dữ liệu...</div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-10 text-gray-400 italic">Chưa có sản phẩm nào trong kho.</div>
        )}

        <div className="grid gap-3 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
          {list.map(p => (
            <div key={p.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-blue-50 hover:border-blue-200 transition bg-white group shadow-sm">
              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={p.img} className="w-full h-full object-cover" alt={p.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Img' }}
                />
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEdit(p)}>
                <div className="font-semibold truncate text-gray-900 text-sm" title={p.name}>{p.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                    {PART_LABELS[p.part] || p.part}
                  </span>
                </div>
                <div className="text-sm font-bold text-blue-600 mt-1">
                  {p.price.toLocaleString()}₫
                  <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Kho: {p.stock}
                  </span>
                </div>
              </div>

              {/* Nút thao tác: Sử dụng Inline SVG */}
              <div className="flex flex-row gap-2">
                <button
                  className="h-10 w-10 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
                  onClick={() => startEdit(p)}
                  title="Sửa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  className="h-10 w-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                  onClick={() => remove(p.id)}
                  title="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}