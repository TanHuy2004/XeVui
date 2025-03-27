const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

// API Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const pool = await poolPromise;

        // Check if email exists
        const userQuery = 'SELECT MatKhau FROM Login WHERE Email = @email';
        const userResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(userQuery);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Email chưa được đăng ký' });
        }

        // Return the password
        const password = userResult.recordset[0].MatKhau;
        return res.json({ password });

    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
