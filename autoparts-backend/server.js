// server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import fsOriginal from 'fs'; // Dùng fs thường cho các hàm đồng bộ như existsSync
import path from 'path';
import bcrypt from 'bcryptjs';
const bcryptModule = bcrypt.default || bcrypt;
import pool, { query } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Vẫn cần cho các API gửi JSON

// --- 1. CẤU HÌNH UPLOAD ẢNH SẢN PHẨM (Lưu vào ổ cứng) ---
const uploadDir = path.join(process.cwd(), 'uploads');
// Tạo thư mục nếu chưa có
if (!fsOriginal.existsSync(uploadDir)) {
  fsOriginal.mkdirSync(uploadDir);
}
// Mở thư mục uploads để frontend có thể xem ảnh qua URL
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Đặt tên file: timestamp-tenfilegoc (xóa khoảng trắng để tránh lỗi URL)
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
  }
})
const uploadProduct = multer({ storage: storage });
// -----------------------------------------------------

// Dữ liệu này có thể giữ lại (để tham khảo)
const PART_LABELS = {
  headlight: 'Đèn pha',
  mirror: 'Gương chiếu hậu',
  windshield: 'Kính chắn gió',
  fog_light: 'Đèn sương mù',
  mudguard: 'Chắn bùn',
};

const resetStore = Object.create(null);
const { PORT = 4000, JWT_SECRET = 'secret' } = process.env;
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

const auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Yêu cầu quyền Admin' });
  }
  next();
};

// ===== Auth (GIỮ NGUYÊN) =====
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!password || String(password).length < 4) return res.status(400).json({ message: 'Mật khẩu yếu' });
  try {
    const existingUser = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(409).json({ message: 'Email đã tồn tại' });
    const salt = await bcryptModule.genSalt(10);
    const passwordHash = await bcryptModule.hash(password, salt);
    const sql = 'INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING email, role, name';
    const result = await query(sql, [name || email.split('@')[0], email, 'user', passwordHash]);
    const u = result.rows[0];
    const token = signToken({ email: u.email, role: u.role, name: u.name });
    res.status(201).json({ token, user: { email: u.email, role: u.role, name: u.name } });
  } catch (err) { res.status(500).json({ message: 'Lỗi máy chủ' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const u = result.rows[0];
    if (!u || !(await bcryptModule.compare(password, u.password))) return res.status(401).json({ message: 'Sai thông tin' });
    const token = signToken({ email: u.email, role: u.role, name: u.name });
    res.json({ token, user: { email: u.email, role: u.role, name: u.name } });
  } catch (err) { res.status(500).json({ message: 'Lỗi máy chủ' }); }
});

// ... (Giữ nguyên các API forgot password) ...
// ===== Forgot Password (IMPLEMENTED) =====
app.post('/api/auth/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const userRes = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetStore[email] = { code, expires: Date.now() + 15 * 60 * 1000 }; // 15 mins

    console.log(`\n[MOCK EMAIL] Code xác minh cho ${email}: ${code}\n`);

    res.json({ message: 'Mã xác minh đã được gửi (kiểm tra console)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/auth/verify-reset', (req, res) => {
  const { email, code } = req.body;
  const entry = resetStore[email];

  if (!entry || entry.code !== code) return res.status(400).json({ message: 'Mã không đúng' });
  if (Date.now() > entry.expires) return res.status(400).json({ message: 'Mã đã hết hạn' });

  res.json({ ok: true });
});

app.post('/api/auth/reset', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const entry = resetStore[email];

  if (!entry || entry.code !== code) return res.status(400).json({ message: 'Mã không hợp lệ' });
  if (Date.now() > entry.expires) return res.status(400).json({ message: 'Mã đã hết hạn' });
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ message: 'Mật khẩu quá ngắn' });

  try {
    const salt = await bcryptModule.genSalt(10);
    const hash = await bcryptModule.hash(newPassword, salt);

    await query('UPDATE users SET password = $1 WHERE email = $2', [hash, email]);

    // Auto login
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    const u = userRes.rows[0];
    const token = signToken({ email: u.email, role: u.role, name: u.name });

    delete resetStore[email];

    res.json({ ok: true, token, user: { email: u.email, role: u.role, name: u.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// ===== Products (ĐÃ CẬP NHẬT: BỎ BRAND, THÊM UPLOAD) =====

app.get('/api/products', async (req, res) => {
  try {
    // Bỏ cột brand khỏi query (nếu bảng đã xóa cột) hoặc select * cũng được nếu cột vẫn còn
    const result = await query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Lỗi máy chủ' }); }
});

// CREATE PRODUCT (Sửa lỗi 400)
app.post('/api/products', auth, uploadProduct.single('image'), async (req, res) => {
  // Lấy dữ liệu từ form-data
  const { name, part, price, stock } = req.body;

  // Chuyển đổi kiểu dữ liệu
  const priceNum = Number(price);
  const stockNum = Number(stock);

  // Tạo URL ảnh (nếu có file)
  let imgUrl = '';
  if (req.file) {
    // Sửa lỗi đường dẫn ảnh trên Windows (thay \ bằng /)
    imgUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  } else {
    imgUrl = req.body.img || '';
  }

  // Validate: BỎ KIỂM TRA BRAND
  if (!name || !part || isNaN(priceNum)) {
    // Log ra để debug xem thiếu trường nào
    console.log("Dữ liệu nhận được:", req.body);
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm (Tên, Loại, Giá)' });
  }

  try {
    // Câu lệnh SQL: Đảm bảo KHÔNG CÓ cột brand
    const sql = `
      INSERT INTO products (name, part, price, stock, img) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [name, part, priceNum, isNaN(stockNum) ? 0 : stockNum, imgUrl];

    const result = await query(sql, values);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo sản phẩm' });
  }
});

// UPDATE PRODUCT (Cũng cần sửa tương tự)
app.put('/api/products/:id', auth, uploadProduct.single('image'), async (req, res) => {
  const { id } = req.params;
  try {
    const currentResult = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const p = currentResult.rows[0];

    const { name, part, price, stock } = req.body;

    let newImg = p.img;
    if (req.file) {
      newImg = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Giữ nguyên giá trị cũ nếu không gửi mới
    const newName = name !== undefined ? name : p.name;
    const newPart = part !== undefined ? part : p.part;
    const newPrice = price !== undefined ? Number(price) : p.price;
    const newStock = stock !== undefined ? Number(stock) : p.stock;

    // SQL Update: BỎ cột brand
    const sql = `
      UPDATE products 
      SET name = $1, part = $2, price = $3, stock = $4, img = $5 
      WHERE id = $6 
      RETURNING *
    `;
    const values = [newName, newPart, newPrice, newStock, newImg, id];

    const result = await query(sql, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật' });
  }
});
app.delete('/api/products/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ ok: true, removed: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Lỗi máy chủ' }); }
});


// ===== Orders (GIỮ NGUYÊN LOGIC QUẢN LÝ ĐƠN HÀNG MỚI) =====
app.post('/api/orders', auth, async (req, res) => {
  const { items, info, method } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productIds = items.map(it => it.pid);
    const productResult = await client.query(`SELECT id, name, price, stock FROM products WHERE id = ANY($1::int[])`, [productIds]);
    let total = 0;
    const productsMap = new Map(productResult.rows.map(p => [p.id, p]));

    for (const it of items) {
      const p = productsMap.get(Number(it.pid));
      if (!p) throw new Error(`SP lỗi: ${it.pid}`);
      if (p.stock < it.qty) throw new Error(`Hết hàng: ${p.name}`);
      total += p.price * it.qty;
    }

    const orderSql = `INSERT INTO orders (user_id, total, customer_name, customer_phone, customer_address, payment_method, status) VALUES ((SELECT id FROM users WHERE email = $1), $2, $3, $4, $5, $6, 'pending') RETURNING id, createdAt`;
    const values = [
      req.user.email,
      total,
      info?.name || '',
      info?.phone || '',
      info?.address || '',
      method || 'cod'
    ];

    const orderResult = await client.query(orderSql, values);
    const orderId = orderResult.rows[0].id;
    const orderCreatedAt = orderResult.rows[0].createdAt;

    for (const it of items) {
      await client.query('INSERT INTO order_items (order_id, product_id, qty) VALUES ($1, $2, $3)', [orderId, it.pid, it.qty]);
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [it.qty, it.pid]);
    }
    await client.query('COMMIT');
    res.status(201).json({ id: orderId, userEmail: req.user.email, total, items, createdAt: orderCreatedAt });
  } catch (err) { await client.query('ROLLBACK'); res.status(400).json({ message: err.message }); } finally { client.release(); }
});

// API lấy danh sách đơn hàng cho Admin (đã có đủ thông tin)
app.get('/api/admin/orders', auth, adminAuth, async (req, res) => {
  try {
    const sql = `
      SELECT o.*, 
      (SELECT json_agg(json_build_object(
        'qty', oi.qty, 
        'pid', p.id, 
        'product_name', p.name, 
        'img', p.img, 
        'price', p.price
      )) 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = o.id) as items 
      FROM orders o 
      ORDER BY o.createdAt DESC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Lỗi máy chủ' }); }
});

app.put('/api/admin/orders/:id', auth, adminAuth, async (req, res) => {
  const { status } = req.body;
  await query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
  res.json({ ok: true });
});

app.get('/api/orders/my', auth, async (req, res) => {
  const sql = `SELECT o.*, (SELECT json_agg(json_build_object('qty', oi.qty, 'pid', p.id, 'product', p)) FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id) as items FROM orders o WHERE o.user_id = (SELECT id FROM users WHERE email = $1) ORDER BY o.createdAt DESC`;
  const result = await query(sql, [req.user.email]);
  res.json(result.rows);
});

app.put('/api/orders/:id/receive', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Chỉ cho phép xác nhận khi đơn hàng đang ở trạng thái 'shipping' và thuộc về user này
    const sql = `
            UPDATE orders 
            SET status = 'completed' 
            WHERE id = $1 
              AND user_id = (SELECT id FROM users WHERE email = $2) 
              AND status = 'shipping' 
            RETURNING *
        `;
    const result = await query(sql, [id, req.user.email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Không thể xác nhận (Đơn không tồn tại, không phải của bạn, hoặc chưa được giao)' });
    }

    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== Stats & Admin Users (GIỮ NGUYÊN) =====
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  const result = await query('SELECT id, name, email, role FROM users ORDER BY id ASC');
  res.json(result.rows);
});
app.put('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user', 'staff'].includes(role)) return res.status(400).json({ message: 'Role invalid' });
  await query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
  res.json({ ok: true });
});
app.delete('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  await query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Stats (Rút gọn, logic giống cũ)
// Stats
app.get('/api/stats/overview', auth, async (req, res) => {
  try {
    const userRes = await query('SELECT COUNT(*) FROM users');
    const orderRes = await query('SELECT COUNT(*) FROM orders');
    const revenueRes = await query('SELECT SUM(total) FROM orders');
    const productRes = await query('SELECT COUNT(*) FROM products');

    // Top week
    const topWeekSql = `
            SELECT p.name, p.part as brand, SUM(oi.qty) as qty
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.createdAt >= NOW() - INTERVAL '7 days'
            GROUP BY p.id, p.name, p.part
            ORDER BY qty DESC
            LIMIT 5
        `;
    const topWeekRes = await query(topWeekSql);

    // Top month
    const topMonthSql = `
            SELECT p.name, p.part as brand, SUM(oi.qty) as qty
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.createdAt >= NOW() - INTERVAL '30 days'
            GROUP BY p.id, p.name, p.part
            ORDER BY qty DESC
            LIMIT 5
        `;
    const topMonthRes = await query(topMonthSql);

    res.json({
      users: parseInt(userRes.rows[0].count),
      orders: parseInt(orderRes.rows[0].count),
      revenue: parseInt(revenueRes.rows[0].sum || 0),
      products: parseInt(productRes.rows[0].count),
      topWeek: topWeekRes.rows,
      topMonth: topMonthRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy thống kê' });
  }
});

app.get('/api/stats/traffic', auth, async (req, res) => {
  try {
    // Lấy số lượng đơn hàng theo ngày trong 30 ngày qua
    const sql = `
            SELECT to_char(createdAt, 'YYYY-MM-DD') as date, COUNT(*) as count
            FROM orders
            WHERE createdAt >= NOW() - INTERVAL '30 days'
            GROUP BY date
            ORDER BY date ASC
        `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy traffic' });
  }
});
app.post('/api/traffic/ping', async (req, res) => { res.json({ ok: true }); });


// ===== ML Diagnose (GIỮ NGUYÊN - TÍCH HỢP PYTHON) =====
const uploadMem = multer({ storage: multer.memoryStorage() });

app.post('/api/ml/diagnose', uploadMem.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Thiếu file ảnh' });
  }
  const fileBuffer = req.file.buffer;
  const tempDir = path.join(process.cwd(), 'temp_uploads');
  const tempFilePath = path.join(tempDir, `${Date.now()}_${req.file.originalname}`);

  try {
    if (!fsOriginal.existsSync(tempDir)) fsOriginal.mkdirSync(tempDir);
    await fs.writeFile(tempFilePath, fileBuffer);

    const pythonProcess = spawn('python', ['detector.py', tempFilePath]);
    let resultData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (errorData) console.warn(`[Python Warnings]: ${errorData}`);
        if (code !== 0) {
          return reject(new Error(`Python Error: ${errorData}`));
        }
        resolve();
      });
    });
    const jsonResult = JSON.parse(resultData);
    res.json(jsonResult);

  } catch (error) {
    console.error('Error ML:', error);
    res.status(500).json({ message: 'Lỗi AI Server' });
  } finally {
    try { await fs.unlink(tempFilePath); } catch (e) { }
  }
});

// ===== Start =====
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));