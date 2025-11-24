# 🚗 AutoParts – Web Bán Phụ Kiện Ô Tô + Nhận Diện Hỏng Hóc Xe

## 🧩 Giới thiệu
**AutoParts** là một ứng dụng web fullstack (React + Node.js + Express) mô phỏng hệ thống bán phụ kiện ô tô trực tuyến, kèm tính năng **nhận diện bộ phận xe bị hỏng** bằng **AI model (Mask R-CNN)**.

## AutoParts là một ứng dụng web Full-Stack gồm React (frontend) và Node.js + Express (backend), hỗ trợ:

✅ Quản lý & bán phụ kiện ô tô
✅ Chẩn đoán bộ phận xe bị hỏng bằng mô hình AI (Mask R-CNN)
✅ Dashboard thống kê
✅ Admin CRUD sản phẩm
✅ Đăng nhập / đăng ký (JWT)

Ứng dụng phù hợp cho học tập, demo, nghiên cứu AI + web thực tế.
---

## ⚙️ Cấu trúc thư mục
autoparts_full/
├── server.js # Backend Express chính (API)
├── src/
│ ├── api.js # Hàm gọi API frontend
│ ├── components/
│ │ ├── ManageProducts.jsx # CRUD sản phẩm (admin)
│ │ ├── Diagnose.jsx # Nhận diện hỏng hóc (frontend)
│ │ └── ... (các component khác)
│ └── App.jsx # Entry chính React
├── public/
│ └── index.html
├── model/
│ └── mask_rcnn_model_20240606_105647.pth # File model AI
└── README.md


---

## 💻 Yêu cầu hệ thống

| Thành phần | Phiên bản khuyến nghị |
|-------------|------------------------|
| Node.js     | >= 18.0.0             |
| npm         | >= 9.0.0              |
| Python      | >= 3.10               |
| PyTorch     | >= 2.0.0              |
| torchvision | >= 0.15.0             |

## Frontend

Vite + React
TailwindCSS

---

## 🚀 Cách chạy dự án

### 1️⃣ Cài đặt thư viện

```bash
# Cài dependencies cho backend
npm install

# Cài dependencies cho frontend (trong thư mục src nếu tách riêng)
cd src
npm install
2️⃣ Chạy server backend
node server.js
# hoặc nếu có nodemon
npx nodemon server.js
3️⃣ Chạy frontend
npm run dev


🖥️ Frontend – UI nhận diện (Diagnose.jsx)

Upload ảnh
Gọi API
Hiển thị nhãn dự đoán
Gợi ý sản phẩm phù hợp

📊 Dashboard
Thống kê doanh thu
Thống kê người dùng
Lượt truy cập
Sản phẩm bán chạy theo tuần / tháng