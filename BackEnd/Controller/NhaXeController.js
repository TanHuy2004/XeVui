const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API Thêm nhà xe
router.post('/bus-company', async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận được từ client:", req.body);

        const { busCompanyID, name, phone, address } = req.body;

        if (!busCompanyID || !name || !phone || !address) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra ID nhà xe đã tồn tại
        const checkBusCompanyQuery = `SELECT 1 FROM BusCompany WHERE BusCompanyID = @busCompanyID`;
        const checkBusCompanyResult = await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(checkBusCompanyQuery);

        if (checkBusCompanyResult.recordset.length > 0) {
            console.log("⚠️ Mã nhà xe đã tồn tại!");
            return res.status(409).json({ field: "busCompanyID", message: "Mã nhà xe đã tồn tại!" });
        }

        // Thêm nhà xe mới vào database
        const insertQuery = `INSERT INTO BusCompany (BusCompanyID, Name, Phone, Address) VALUES (@busCompanyID, @name, @phone, @address)`;
        console.log("📝 Thực thi truy vấn SQL:", insertQuery);

        await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .query(insertQuery);

        console.log("✅ Thêm nhà xe thành công!");
        res.status(201).json({ message: 'Thêm nhà xe thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Lấy thông tin nhà xe
router.get('/bus-company', async (req, res) => {
    try {
        console.log("📥 Yêu cầu lấy danh sách nhà xe");

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        const selectQuery = `SELECT BusCompanyID, Name, Phone, Address FROM BusCompany`;
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

// API Cập nhật nhà xe
router.put('/bus-company', async (req, res) => {
    try {
        console.log("📥 Dữ liệu cập nhật từ client:", req.body);

        const { busCompanyID, name, phone, address } = req.body;

        if (!busCompanyID || !name || !phone || !address) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem mã nhà xe có tồn tại không
        const checkBusCompanyQuery = `SELECT 1 FROM BusCompany WHERE BusCompanyID = @busCompanyID`;
        console.log("🔍 Kiểm tra mã nhà xe:", checkBusCompanyQuery);
        const checkBusCompanyResult = await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(checkBusCompanyQuery);

        if (checkBusCompanyResult.recordset.length === 0) {
            console.log("⚠️ Mã nhà xe không tồn tại!");
            return res.status(404).json({ message: 'Mã nhà xe chưa được đăng ký!' });
        }

        // Nếu tồn tại, tiến hành cập nhật
        const updateQuery = `UPDATE BusCompany SET Name = @name, Phone = @phone, Address = @address WHERE BusCompanyID = @busCompanyID`;
        console.log("📝 Thực thi truy vấn SQL:", updateQuery);

        await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .query(updateQuery);

        console.log("✅ Cập nhật nhà xe thành công!");
        res.status(200).json({ message: 'Sửa nhà xe thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Xóa nhà xe
router.delete('/bus-company/:busCompanyID', async (req, res) => {
    try {
        const { busCompanyID } = req.params;
        console.log("🗑️ Yêu cầu xóa nhà xe với ID:", busCompanyID);

        if (!busCompanyID || busCompanyID.length !== 5) {
            console.log("⚠️ ID nhà xe không hợp lệ!");
            return res.status(400).json({ message: 'ID nhà xe không hợp lệ. Mã phải có đúng 5 ký tự.' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem nhà xe có tồn tại không
        const checkBusCompanyQuery = `SELECT 1 FROM BusCompany WHERE BusCompanyID = @busCompanyID`;
        const checkBusCompanyResult = await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(checkBusCompanyQuery);

        if (checkBusCompanyResult.recordset.length === 0) {
            console.log("⚠️ Nhà xe không tồn tại!");
            return res.status(404).json({ message: 'Mã nhà xe không tồn tại' });
        }

        // Xóa nhà xe
        const deleteQuery = `DELETE FROM BusCompany WHERE BusCompanyID = @busCompanyID`;
        console.log("📝 Thực thi truy vấn SQL:", deleteQuery);

        await pool.request()
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(deleteQuery);

        console.log("✅ Xóa nhà xe thành công!");
        res.status(200).json({ message: 'Xóa nhà xe thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;
