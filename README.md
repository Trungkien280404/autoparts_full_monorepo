# AutoParts Portal

AutoParts Portal là một ứng dụng web full-stack hiện đại được thiết kế để quản lý kinh doanh phụ tùng ô tô. Ứng dụng bao gồm danh mục sản phẩm toàn diện, chức năng giỏ hàng, quản lý người dùng và đơn hàng, cùng tính năng AI tiên tiến để phát hiện hư hỏng xe và gợi ý phụ tùng.

## 🚀 Tính năng

### Tính năng Người dùng
- **Danh mục Sản phẩm**: Duyệt và tìm kiếm phụ tùng ô tô dễ dàng.
- **Giỏ hàng**: Thêm sản phẩm, điều chỉnh số lượng và thanh toán mượt mà.
- **Quản lý Đơn hàng**: Theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Hoàn thành) và xác nhận đã nhận hàng.
- **AI Chẩn đoán Hư hỏng**: Tải lên hình ảnh xe bị hư hỏng để tự động phát hiện hãng xe, dòng xe và các bộ phận bị hỏng.
- **Tài khoản Người dùng**: Quản lý hồ sơ và xem lịch sử đơn hàng.

### Tính năng Quản trị (Admin)
- **Dashboard**: Thống kê thời gian thực về người dùng, đơn hàng, doanh thu và lưu lượng truy cập.
- **Quản lý Sản phẩm**: Thêm, sửa, xóa sản phẩm với hỗ trợ tải lên hình ảnh.
- **Quản lý Đơn hàng**: Xem tất cả đơn hàng và cập nhật trạng thái của chúng.
- **Quản lý Người dùng**: Quản lý vai trò người dùng (Admin, Nhân viên, Người dùng).

## 🛠️ Công nghệ Sử dụng

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Biểu đồ**: Chart.js, React-chartjs-2
- **Icons**: Custom SVG Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Cơ sở dữ liệu**: PostgreSQL
- **Xác thực**: JWT (JSON Web Tokens)
- **Upload file**: Multer

### AI / Machine Learning
- **Ngôn ngữ**: Python
- **Mô hình**: Google Gemini 1.5 Flash
- **Thư viện**: `google-generativeai`, `opencv-python`, `python-dotenv`

## 📋 Yêu cầu Tiên quyết

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
- [Node.js](https://nodejs.org/) (v16 trở lên)
- [Python](https://www.python.org/) (v3.8 trở lên)
- [PostgreSQL](https://www.postgresql.org/)

## ⚙️ Cài đặt & Thiết lập

### 1. Clone Repository
```bash
git clone <repository-url>
cd autoparts_full
```

### 2. Thiết lập Backend
Di chuyển vào thư mục backend và cài đặt các gói phụ thuộc:
```bash
cd autoparts-backend
npm install
```

Tạo file `.env` trong `autoparts-backend/` với các biến sau:
```env
PORT=4000
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
# Cấu hình Database (điều chỉnh nếu cần)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=autoparts
DB_PASSWORD=your_db_password
DB_PORT=5432
```

**Thiết lập Cơ sở dữ liệu:**
Đảm bảo PostgreSQL đang chạy và tạo database tên là `autoparts`. Ứng dụng giả định đã có các bảng `users`, `products`, `orders`, và `order_items`. Bạn có thể cần chạy script migration (không bao gồm trong README này) để tạo cấu trúc bảng.

### 3. Thiết lập Frontend
Di chuyển vào thư mục frontend và cài đặt các gói phụ thuộc:
```bash
cd ../autoparts-frontend
npm install
```

Tạo file `.env` trong `autoparts-frontend/` (tùy chọn, mặc định là localhost:4000):
```env
VITE_API_URL=http://localhost:4000
```

### 4. Môi trường Python (cho AI)
Di chuyển vào thư mục backend (nơi chứa `detector.py`) và cài đặt các thư viện Python:
```bash
cd ../autoparts-backend
pip install google-generativeai opencv-python python-dotenv
```

## 🚀 Chạy Ứng dụng

### Khởi chạy Backend
```bash
cd autoparts-backend
npm start
```
Server sẽ chạy tại `http://localhost:4000`.

### Khởi chạy Frontend
Mở một terminal mới:
```bash
cd autoparts-frontend
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:5173`.

## 📂 Cấu trúc Dự án

```
autoparts_full/
├── autoparts-backend/      # Node.js Express Server
│   ├── server.js           # Điểm khởi chạy chính
│   ├── db.js               # Kết nối Database
│   ├── detector.py         # Logic AI (Python)
│   └── uploads/            # Hình ảnh đã upload
├── autoparts-frontend/     # React Vite Application
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── api.js          # Tích hợp API
│   │   └── App.jsx         # Component chính
│   └── ...
└── README.md               # Tài liệu dự án
```

## 🔒 Lưu ý Bảo mật
- **Biến môi trường**: Không bao giờ commit file `.env` lên version control. File `.gitignore` đã được cấu hình để loại bỏ chúng.
- **JWT**: Hãy thay đổi `JWT_SECRET` khi triển khai thực tế (production).

## 🤝 Đóng góp
Mọi đóng góp đều được hoan nghênh! Vui lòng fork repository và gửi pull request.

## 📄 Giấy phép
[MIT](https://choosealicense.com/licenses/mit/)
