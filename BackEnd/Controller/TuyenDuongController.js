const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API Thêm tuyến đường
router.post('/route', async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận được từ client:", req.body);

        const { routeID, departure, destination, distance, basePrice } = req.body;

        if (!routeID || !departure || !destination || !distance || !basePrice) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;

        // Kiểm tra ID tuyến đường đã tồn tại
        const checkRouteQuery = `SELECT 1 FROM Route WHERE RouteID = @routeID`;
        const checkRouteResult = await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .query(checkRouteQuery);

        if (checkRouteResult.recordset.length > 0) {
            console.log("⚠️ Mã tuyến đường đã tồn tại!");
            return res.status(409).json({ field: "routeID", message: "Mã tuyến đường đã tồn tại!" });
        }

        // Thêm tuyến đường mới vào database
        const insertQuery = `INSERT INTO Route (RouteID, Depature, Destination, Distance, BasePrice) VALUES (@routeID, @departure, @destination, @distance, @basePrice)`;
        console.log("📝 Thực thi truy vấn SQL:", insertQuery);

        await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .input('departure', sql.NVarChar, departure)
            .input('destination', sql.NVarChar, destination)
            .input('distance', sql.Float, distance)
            .input('basePrice', sql.Float, basePrice)
            .query(insertQuery);

        console.log("✅ Thêm tuyến đường thành công!");
        res.status(201).json({ message: 'Thêm tuyến đường thành công!' });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Lấy thông tin tuyến đường
router.get('/route', async (req, res) => {
    try {
        console.log("📥 Yêu cầu lấy danh sách tuyến đường");

        const pool = await poolPromise;

        const selectQuery = `SELECT RouteID AS routeID, Depature AS departure, Destination AS destination, Distance AS distance, BasePrice AS basePrice FROM Route`;
        console.log("📝 Thực thi truy vấn SQL:", selectQuery);

        const result = await pool.request().query(selectQuery);

        console.log("✅ Lấy danh sách tuyến đường thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Cập nhật tuyến đường
router.put('/route', async (req, res) => {
    try {
        console.log("📥 Dữ liệu cập nhật từ client:", req.body);
        const { routeID, departure, destination, distance, basePrice } = req.body;

        if (!routeID || !departure || !destination || !distance || !basePrice) {
            console.log("⚠️ Thiếu thông tin đầu vào!");
            return res.status(400).json({ message: 'Thông tin không đầy đủ' });
        }

        const pool = await poolPromise;
        const checkRouteQuery = `SELECT 1 FROM Route WHERE RouteID = @routeID`;
        const checkRouteResult = await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .query(checkRouteQuery);

        if (checkRouteResult.recordset.length === 0) {
            console.log("⚠️ Mã tuyến đường không tồn tại!");
            return res.status(404).json({ message: 'Mã tuyến đường chưa được đăng ký!' });
        }

        const updateQuery = `UPDATE Route SET Depature = @departure, Destination = @destination, Distance = @distance, BasePrice = @basePrice WHERE RouteID = @routeID`;
        await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .input('departure', sql.NVarChar, departure)
            .input('destination', sql.NVarChar, destination)
            .input('distance', sql.Float, distance)
            .input('basePrice', sql.Float, basePrice)
            .query(updateQuery);

        console.log("✅ Cập nhật tuyến đường thành công!");
        res.status(200).json({ message: 'Sửa tuyến đường thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API Xóa tuyến đường
router.delete('/route/:routeID', async (req, res) => {
    try {
        const { routeID } = req.params;
        console.log("🗑️ Yêu cầu xóa tuyến đường với ID:", routeID);

        const pool = await poolPromise;

        // Kiểm tra xem tuyến đường có tồn tại không
        const checkRouteQuery = `SELECT 1 FROM Route WHERE RouteID = @routeID`;
        const checkRouteResult = await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .query(checkRouteQuery);

        if (checkRouteResult.recordset.length === 0) {
            console.log("⚠️ Tuyến đường không tồn tại!");
            return res.status(404).json({ message: 'Mã tuyến đường không tồn tại' });
        }

        // Xóa tuyến đường
        const deleteQuery = `DELETE FROM Route WHERE RouteID = @routeID`;
        console.log("📝 Thực thi truy vấn SQL:", deleteQuery);

        await pool.request()
            .input('routeID', sql.VarChar, routeID)
            .query(deleteQuery);

        console.log("✅ Xóa tuyến đường thành công!");
        res.status(200).json({ message: 'Xóa tuyến đường thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;