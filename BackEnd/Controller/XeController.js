const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API to add a bus with BusCompanyID based on the company name
router.post('/bus', async (req, res) => {
    try {
        const { busID, licensePlate, seatCapacity, companyName } = req.body;

        // Validate input
        if (!busID || !licensePlate || !seatCapacity || !companyName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }
        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Get BusCompanyID from the company name
        const companyQuery = `SELECT BusCompanyID FROM BusCompany WHERE Name = @companyName`;
        const companyResult = await pool.request()
            .input('companyName', sql.NVarChar, companyName)
            .query(companyQuery);

        if (!companyResult.recordset[0]) {
            console.error("❌ Không tìm thấy công ty:", companyName);
            return res.status(404).json({ message: 'Không tìm thấy công ty' });
        }

        const busCompanyID = companyResult.recordset[0].BusCompanyID;
        console.log("✅ BusCompanyID tìm thấy:", busCompanyID);

        // Insert the bus into the Bus table
        const insertQuery = `INSERT INTO Bus (BusID, LicensePlate, SeatCapacity, BusCompanyID) 
                             VALUES (@busID, @licensePlate, @seatCapacity, @busCompanyID)`;
        await pool.request()
            .input('busID', sql.VarChar, busID)
            .input('licensePlate', sql.NVarChar, licensePlate)
            .input('seatCapacity', sql.Int, seatCapacity)
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(insertQuery);

        res.status(201).json({ message: 'Thêm xe thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

router.get('/bus', async (req, res) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        const query = `
            SELECT b.BusID, b.LicensePlate, b.SeatCapacity, b.BusCompanyID, bc.Name AS CompanyName
            FROM Bus b
            JOIN BusCompany bc ON b.BusCompanyID = bc.BusCompanyID
        `;
        const result = await pool.request().query(query);

        if (!result.recordset || result.recordset.length === 0) {
            console.log("⚠️ Không có dữ liệu xe");
            return res.status(404).json({ message: 'Không có dữ liệu xe' });
        }

        console.log("✅ Lấy danh sách xe thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// POST: Add a new bus with BusCompanyID based on the company name
router.post('/bus', async (req, res) => {
    try {
        const { busID, licensePlate, seatCapacity, companyName } = req.body;

        // Validate input
        if (!busID || !licensePlate || !seatCapacity || !companyName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Check if BusID already exists
        const checkBusQuery = `SELECT BusID FROM Bus WHERE BusID = @busID`;
        const checkBusResult = await pool.request()
            .input('busID', sql.VarChar, busID)
            .query(checkBusQuery);

        if (checkBusResult.recordset.length > 0) {
            console.error("❌ Mã xe đã tồn tại:", busID);
            return res.status(400).json({ message: 'Mã xe đã tồn tại!' });
        }

        // Get BusCompanyID from the company name
        const companyQuery = `SELECT BusCompanyID FROM BusCompany WHERE Name = @companyName`;
        const companyResult = await pool.request()
            .input('companyName', sql.NVarChar, companyName)
            .query(companyQuery);

        if (!companyResult.recordset[0]) {
            console.error("❌ Không tìm thấy công ty:", companyName);
            return res.status(404).json({ message: 'Không tìm thấy công ty' });
        }

        const busCompanyID = companyResult.recordset[0].BusCompanyID;
        console.log("✅ BusCompanyID tìm thấy:", busCompanyID);

        // Insert the bus into the Bus table
        const insertQuery = `
            INSERT INTO Bus (BusID, LicensePlate, SeatCapacity, BusCompanyID) 
            VALUES (@busID, @licensePlate, @seatCapacity, @busCompanyID)
        `;
        await pool.request()
            .input('busID', sql.VarChar, busID)
            .input('licensePlate', sql.NVarChar, licensePlate)
            .input('seatCapacity', sql.Int, seatCapacity)
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(insertQuery);

        res.status(201).json({ message: 'Thêm xe thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// PUT: Update an existing bus
router.put('/bus/:busID', async (req, res) => {
    try {
        const { busID } = req.params;
        const { licensePlate, seatCapacity, companyName } = req.body;

        // Validate input
        if (!licensePlate || !seatCapacity || !companyName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Check if the bus exists
        const checkBusQuery = `SELECT BusID FROM Bus WHERE BusID = @busID`;
        const checkBusResult = await pool.request()
            .input('busID', sql.VarChar, busID)
            .query(checkBusQuery);

        if (!checkBusResult.recordset[0]) {
            console.error("❌ Không tìm thấy xe:", busID);
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        // Get BusCompanyID from the company name
        const companyQuery = `SELECT BusCompanyID FROM BusCompany WHERE Name = @companyName`;
        const companyResult = await pool.request()
            .input('companyName', sql.NVarChar, companyName)
            .query(companyQuery);

        if (!companyResult.recordset[0]) {
            console.error("❌ Không tìm thấy công ty:", companyName);
            return res.status(404).json({ message: 'Không tìm thấy công ty' });
        }

        const busCompanyID = companyResult.recordset[0].BusCompanyID;
        console.log("✅ BusCompanyID tìm thấy:", busCompanyID);

        // Update the bus in the Bus table
        const updateQuery = `
            UPDATE Bus 
            SET LicensePlate = @licensePlate, SeatCapacity = @seatCapacity, BusCompanyID = @busCompanyID
            WHERE BusID = @busID
        `;
        await pool.request()
            .input('busID', sql.VarChar, busID)
            .input('licensePlate', sql.NVarChar, licensePlate)
            .input('seatCapacity', sql.Int, seatCapacity)
            .input('busCompanyID', sql.VarChar, busCompanyID)
            .query(updateQuery);

        res.status(200).json({ message: 'Cập nhật xe thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// DELETE: Delete a bus by BusID
router.delete('/bus/:busID', async (req, res) => {
    try {
        const { busID } = req.params;

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Check if the bus exists
        const checkBusQuery = `SELECT BusID FROM Bus WHERE BusID = @busID`;
        const checkBusResult = await pool.request()
            .input('busID', sql.VarChar, busID)
            .query(checkBusQuery);

        if (!checkBusResult.recordset[0]) {
            console.error("❌ Không tìm thấy xe:", busID);
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        // Delete the bus from the Bus table
        const deleteQuery = `DELETE FROM Bus WHERE BusID = @busID`;
        await pool.request()
            .input('busID', sql.VarChar, busID)
            .query(deleteQuery);

        res.status(200).json({ message: 'Xóa xe thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;