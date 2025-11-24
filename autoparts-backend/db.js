// db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Kết nối đến CSDL bằng chuỗi kết nối trong file .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Hàm để chạy truy vấn SQL.
 * @param {string} text - Câu lệnh SQL (ví dụ: 'SELECT * FROM users WHERE id = $1')
 * @param {Array} params - Mảng giá trị cho các tham số (ví dụ: [1])
 * @returns {Promise<pg.QueryResult>} Kết quả từ CSDL
 */
export const query = (text, params) => pool.query(text, params);

// Xuất pool mặc định để dùng cho các giao dịch (transactions)
export default pool;