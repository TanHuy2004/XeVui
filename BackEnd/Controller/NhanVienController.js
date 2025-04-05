const express = require('express'); 
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API Thêm nhân viên
router.post('/employee', async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận được từ client:", req.body); // Kiểm tra dữ liệu đầu vào

        const { employeeID, employeeName, employeeRole, employeePhone } = req.body;

        if (!employeeID || !employeeName || !employeeRole || !employeePhone) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra ID nhân viên đã tồn tại
        const checkEmployeeQuery = `SELECT 1 FROM Employee WHERE ID_NV = @employeeID`;
        const checkEmployeeResult = await pool.request()
        .input('employeeID', sql.VarChar, employeeID)
        .query(checkEmployeeQuery);

        if (checkEmployeeResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });
        }

// Kiểm tra Số điện thoại đã tồn tại
        const checkPhoneQuery = `SELECT 1 FROM Employee WHERE SDT = @employeePhone`;
        const checkPhoneResult = await pool.request()
        .input('employeePhone', sql.VarChar, employeePhone)
        .query(checkPhoneQuery);

        if (checkPhoneResult.recordset.length > 0) {
            return res.status(409).json({ field: "employeePhone", message: "Số điện thoại đã tồn tại!" });
        }


        // Thêm nhân viên mới vào database
        const insertQuery = `INSERT INTO Employee (ID_NV, Ten_NV, ChucVu, SDT) VALUES (@employeeID, @employeeName, @employeeRole, @employeePhone)`;
        console.log("📝 Thực thi truy vấn SQL:", insertQuery);

        await pool.request()
            .input('employeeID', sql.VarChar, employeeID)
            .input('employeeName', sql.NVarChar, employeeName)
            .input('employeeRole', sql.NVarChar, employeeRole)
            .input('employeePhone', sql.VarChar, employeePhone)
            .query(insertQuery);

        console.log("✅ Thêm nhân viên thành công!");
        res.status(201).json({ message: 'Thêm nhân viên thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Lấy thông tin nhân viên
router.get('/employee', async (req, res) => {
    try {
        console.log("📥 Yêu cầu lấy danh sách nhân viên");

        const pool = await poolPromise;

        // Kiểm tra kết nối database
        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Lấy danh sách nhân viên từ database
        const selectQuery = `SELECT ID_NV AS employeeID, Ten_NV AS employeeName, ChucVu AS employeeRole, SDT AS employeePhone FROM Employee`;
        console.log("📝 Thực thi truy vấn SQL:", selectQuery);

        const result = await pool.request().query(selectQuery);

        if (!result.recordset || result.recordset.length === 0) {
            console.log("⚠️ Không có dữ liệu nhân viên");
            return res.status(404).json({ message: 'Không có dữ liệu nhân viên' });
        }

        console.log("✅ Lấy danh sách nhân viên thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Cập nhật nhân viên
router.put('/employee', async (req, res) => {
    try {
        console.log("📥 Dữ liệu cập nhật từ client:", req.body); // Log incoming data

        const { employeeID, employeeName, employeeRole, employeePhone } = req.body;

        if (!employeeID || !employeeName || !employeeRole || !employeePhone) {
            console.log("⚠️ Thiếu thông tin đầu vào!"); // Log missing data
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra xem mã nhân viên có tồn tại không
        const checkEmployeeQuery = `SELECT 1 FROM Employee WHERE ID_NV = @employeeID`;
        console.log("🔍 Kiểm tra mã nhân viên:", checkEmployeeQuery); // Log query
        const checkEmployeeResult = await pool.request()
            .input('employeeID', sql.VarChar, employeeID)
            .query(checkEmployeeQuery);

            
        if (checkEmployeeResult.recordset.length === 0) {
            console.log("⚠️ Mã nhân viên không tồn tại!"); // Log non-existent ID
            return res.status(404).json({ message: 'Mã nhân viên chưa được đăng ký!' });
        }

        // Nếu tồn tại, tiến hành cập nhật
        const updateQuery = `UPDATE Employee SET Ten_NV = @employeeName, ChucVu = @employeeRole, SDT = @employeePhone WHERE ID_NV = @employeeID`;
        console.log("📝 Thực thi truy vấn SQL:", updateQuery); // Log update query

        await pool.request()
            .input('employeeID', sql.VarChar, employeeID)
            .input('employeeName', sql.NVarChar, employeeName)
            .input('employeeRole', sql.NVarChar, employeeRole)
            .input('employeePhone', sql.VarChar, employeePhone)
            .query(updateQuery);

        console.log("✅ Cập nhật nhân viên thành công!");
        res.status(200).json({ message: 'Sửa nhân viên thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err); // Log server error
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});
router.delete('/employee/:employeeID', async (req, res) => {
    try {
        const { employeeID } = req.params;
        
        if (!employeeID) {
            return res.status(400).json({ message: "Mã nhân viên không hợp lệ!" });
        }

        const pool = await poolPromise;

        const checkQuery = `SELECT 1 FROM Employee WHERE ID_NV = @employeeID`;
        const checkResult = await pool.request()
            .input('employeeID', sql.VarChar, employeeID)
            .query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: "Nhân viên không tồn tại!" });
        }

        const deleteQuery = `DELETE FROM Employee WHERE ID_NV = @employeeID`;
        await pool.request()
            .input('employeeID', sql.VarChar, employeeID)
            .query(deleteQuery);

        console.log(`✅ Đã xóa nhân viên ${employeeID} thành công!`);  // Kiểm tra server log

        res.status(200).json({ message: 'Xóa nhân viên thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;