const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

// API Đăng ký người dùng
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        // Kết nối đến database
        const pool = await poolPromise;

        // Kiểm tra xem username hoặc email đã tồn tại chưa
        const checkUserQuery = `SELECT * FROM Login WHERE TaiKhoan = @username OR Email = @email`;
        const checkUserResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .query(checkUserQuery);

        if (checkUserResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Tên tài khoản hoặc email đã tồn tại' });
        }

        // **Lưu mật khẩu thô vào database**
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)  // Không mã hóa mật khẩu
            .input('email', sql.NVarChar, email)
            .query('INSERT INTO Login (TaiKhoan, MatKhau, Email) VALUES (@username, @password, @email)');

        res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Đăng nhập người dùng
// API Đăng nhập người dùng
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem người dùng có tồn tại không
        const userCheckQuery = 'SELECT * FROM Login WHERE TaiKhoan = @username';
        const userCheckResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(userCheckQuery);

        if (userCheckResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const user = userCheckResult.recordset[0];

        // So sánh mật khẩu
        if (password !== user.MatKhau) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Trả về thông tin người dùng và vai trò
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            username: user.TaiKhoan,
            role: user.PhanQuyen || 'user', // Nếu vai trò NULL, mặc định là 'user'
        });

    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});

module.exports = router;
