const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API Thêm khách hàng
router.post('/customer', async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận được từ client:", req.body);
        
        const { customerID, customerName, customerPhone, customerEmail, customerAddress } = req.body;

        if (!customerID || !customerName || !customerPhone || !customerEmail || !customerAddress) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra ID khách hàng đã tồn tại
        const checkCustomerQuery = `SELECT 1 FROM Customer WHERE ID_KH = @customerID`;
        const checkCustomerResult = await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .query(checkCustomerQuery);

        if (checkCustomerResult.recordset.length > 0) {
            console.log("⚠️ Mã khách hàng đã tồn tại!");
            return res.status(409).json({ field: "customerID", message: "Mã khách hàng đã tồn tại!" });
        }

        // Kiểm tra số điện thoại đã tồn tại
        const checkPhoneQuery = `SELECT 1 FROM Customer WHERE SDT = @customerPhone`;
        const checkPhoneResult = await pool.request()
            .input('customerPhone', sql.VarChar, customerPhone)
            .query(checkPhoneQuery);

        if (checkPhoneResult.recordset.length > 0) {
            console.log("⚠️ Số điện thoại đã tồn tại!");
            return res.status(409).json({ field: "customerPhone", message: "Số điện thoại đã tồn tại!" });
        }

        // Kiểm tra số Email đã tồn tại
        const checkEmailQuery = `SELECT 1 FROM Customer WHERE Email = @customerEmail`;
        const checkEmailResult = await pool.request()
            .input('customerEmail', sql.VarChar, customerEmail)
            .query(checkEmailQuery);

        if (checkEmailResult.recordset.length > 0) {
            console.log("⚠️ Email đã tồn tại!");
            return res.status(409).json({ field: "customerEmail", message: "Email đã tồn tại!" });
        }

        // Thêm khách hàng mới vào database
        const insertQuery = `INSERT INTO Customer (ID_KH, Ten_KH, SDT, Email, DiaChi) VALUES (@customerID, @customerName, @customerPhone, @customerEmail, @customerAddress)`;
        console.log("📝 Thực thi truy vấn SQL:", insertQuery);

        await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .input('customerName', sql.NVarChar, customerName)
            .input('customerPhone', sql.VarChar, customerPhone)
            .input('customerEmail', sql.VarChar, customerEmail)
            .input('customerAddress', sql.NVarChar, customerAddress)
            .query(insertQuery);

        console.log("✅ Thêm khách hàng thành công!");
        res.status(201).json({ message: 'Thêm khách hàng thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Lấy thông tin khách hàng
router.get('/customer', async (req, res) => {
    try {
        console.log("📥 Yêu cầu lấy danh sách khách hàng");

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        const selectQuery = `SELECT ID_KH AS customerID, Ten_KH AS customerName, SDT AS customerPhone, Email AS customerEmail, DiaChi AS customerAddress FROM Customer`;
        console.log("📝 Thực thi truy vấn SQL:", selectQuery);

        const result = await pool.request().query(selectQuery);


        console.log("✅ Lấy danh sách khách hàng thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});


// API Cập nhật khách hàng
router.put('/customer', async (req, res) => {
    try {
        console.log("📥 Dữ liệu cập nhật từ client:", req.body);

        const { customerID, customerName, customerPhone, customerEmail, customerAddress } = req.body;

        if (!customerID || !customerName || !customerPhone || !customerEmail || !customerAddress) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem mã khách hàng có tồn tại không
        const checkCustomerQuery = `SELECT 1 FROM Customer WHERE ID_KH = @customerID`;
        console.log("🔍 Kiểm tra mã khách hàng:", checkCustomerQuery);
        const checkCustomerResult = await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .query(checkCustomerQuery);

        if (checkCustomerResult.recordset.length === 0) {
            console.log("⚠️ Mã khách hàng không tồn tại!");
            return res.status(404).json({ message: 'Mã khách hàng chưa được đăng ký!' });
        }

        // Nếu tồn tại, tiến hành cập nhật
        const updateQuery = `UPDATE Customer SET Ten_KH = @customerName, SDT = @customerPhone, Email = @customerEmail, DiaChi = @customerAddress WHERE ID_KH = @customerID`;
        console.log("📝 Thực thi truy vấn SQL:", updateQuery);

        await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .input('customerName', sql.NVarChar, customerName)
            .input('customerPhone', sql.VarChar, customerPhone)
            .input('customerEmail', sql.VarChar, customerEmail)
            .input('customerAddress', sql.NVarChar, customerAddress)
            .query(updateQuery);

        console.log("✅ Cập nhật khách hàng thành công!");
        res.status(200).json({ message: 'Sửa khách hàng thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Xóa khách hàng
router.delete('/customer/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;
        console.log("🗑️ Yêu cầu xóa khách hàng với ID:", customerID);

        if (!customerID || customerID.length !== 5) {
            console.log("⚠️ ID khách hàng không hợp lệ!");
            return res.status(400).json({ message: 'ID khách hàng không hợp lệ. Mã phải có đúng 5 ký tự.' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem khách hàng có tồn tại không
        const checkCustomerQuery = `SELECT 1 FROM Customer WHERE ID_KH = @customerID`;
        const checkCustomerResult = await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .query(checkCustomerQuery);

        if (checkCustomerResult.recordset.length === 0) {
            console.log("⚠️ Khách hàng không tồn tại!");
            return res.status(404).json({ message: 'Mã khách hàng không tồn tại' });
        }

        // Xóa khách hàng
        const deleteQuery = `DELETE FROM Customer WHERE ID_KH = @customerID`;
        console.log("📝 Thực thi truy vấn SQL:", deleteQuery);

        await pool.request()
            .input('customerID', sql.VarChar, customerID)
            .query(deleteQuery);

        console.log("✅ Xóa khách hàng thành công!");
        res.status(200).json({ message: 'Xóa khách hàng thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;