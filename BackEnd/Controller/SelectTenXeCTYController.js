const express = require('express'); 
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API lấy danh sách công ty xe
router.get('/selectTenXeCTY', async (req, res) => {
    try {
        console.log("📥 Yêu cầu lấy danh sách nhà xe");

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        const selectQuery = `SELECT BusCompanyID, Name FROM BusCompany`;
        console.log("📝 Thực thi truy vấn SQL:", selectQuery);

        const result = await pool.request().query(selectQuery);

        if (!result.recordset || result.recordset.length === 0) {
            console.log("⚠️ Không có dữ liệu nhà xe");
            return res.status(404).json({ message: 'Không có dữ liệu nhà xe' });
        }

        console.log("✅ Lấy danh sách nhà xe thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});
module.exports = router;
