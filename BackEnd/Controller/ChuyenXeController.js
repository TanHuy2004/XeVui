const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// API to add a trip
router.post('/trip', async (req, res) => {
    try {
        const { tripID, Depature, Destination, departureTime, arrivalTime, employee, LicensePlate, BasePrice } = req.body;

        // Validate input
        if (!tripID || !Depature || !Destination || !departureTime || !arrivalTime || !employee || !LicensePlate || !BasePrice) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Step 1: Get RouteID from Depature and Destination
        const routeQuery = `SELECT RouteID FROM ROUTE WHERE Depature = @Depature AND Destination = @Destination AND BasePrice = @BasePrice`;
        const routeResult = await pool.request()
            .input('Depature', sql.NVarChar, Depature)
            .input('Destination', sql.NVarChar, Destination)
            .input('BasePrice', sql.Float, BasePrice)
            .query(routeQuery);

        if (!routeResult.recordset[0]) {
            console.error("❌ Không tìm thấy tuyến đường:", Depature, "đến", Destination);
            return res.status(404).json({ message: 'Không tìm thấy tuyến đường' });
        }

        const routeID = routeResult.recordset[0].RouteID;
        console.log("✅ RouteID tìm thấy:", routeID);

        // Step 2: Get BusID from LicensePlate
        const busQuery = `SELECT BusID FROM BUS WHERE LicensePlate = @LicensePlate`;
        const busResult = await pool.request()
            .input('LicensePlate', sql.NVarChar, LicensePlate)
            .query(busQuery);

        if (!busResult.recordset[0]) {
            console.error("❌ Không tìm thấy xe với biển số:", LicensePlate);
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        const busID = busResult.recordset[0].BusID;
        console.log("✅ BusID tìm thấy:", busID);

        // Step 3: Get ID_NV from employee name (Ten_NV)
        const employeeQuery = `SELECT ID_NV FROM Employee WHERE Ten_NV = @employee`;
        const employeeResult = await pool.request()
            .input('employee', sql.NVarChar, employee)
            .query(employeeQuery);

        if (!employeeResult.recordset[0]) {
            console.error("❌ Không tìm thấy nhân viên:", employee);
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        const id_nv = employeeResult.recordset[0].ID_NV;
        console.log("✅ ID_NV tìm thấy:", id_nv);

        // Step 4: Check if the tripID already exists
        const checkTripQuery = `SELECT 1 FROM Trip WHERE TripID = @tripID`;
        const checkTripResult = await pool.request()
            .input('tripID', sql.VarChar, tripID)
            .query(checkTripQuery);

        if (checkTripResult.recordset.length > 0) {
            console.log("⚠️ Mã chuyến đi đã tồn tại!");
            return res.status(409).json({ field: "tripID", message: "Mã chuyến đi đã tồn tại!" });
        }

        // Step 4: Insert the trip into the TRIP table
        const insertQuery = `
            INSERT INTO Trip (TripID, RouteID, BusID, ID_NV, DepartureTime, ArrivalTime)
            VALUES (@tripID, @routeID, @busID, @id_nv, @departureTime, @arrivalTime)
        `;
        await pool.request()
            .input('tripID', sql.VarChar, tripID)
            .input('routeID', sql.VarChar, routeID)
            .input('busID', sql.VarChar, busID)
            .input('id_nv', sql.VarChar, id_nv)
            .input('departureTime', sql.DateTime, new Date(departureTime))
            .input('arrivalTime', sql.DateTime, new Date(arrivalTime))
            .query(insertQuery);

        res.status(201).json({ message: 'Thêm chuyến đi thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API to get all trips
router.get('/trip', async (req, res) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ 
                success: false,
                message: 'Không thể kết nối đến database' 
            });
        }

        const query = `
            SELECT t.TripID, r.Depature, r.Destination, t.DepartureTime, t.ArrivalTime, 
                   e.Ten_NV, b.LicensePlate, r.BasePrice
            FROM Trip t
            JOIN Bus b ON t.BusID = b.BusID
            JOIN Route r ON t.RouteID = r.RouteID
            JOIN Employee e ON t.ID_NV = e.ID_NV    
        `;
        const result = await pool.request().query(query);

        res.status(200).json({ 
            success: true,
            data: result.recordset 
        });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: err.message 
        });
    }
});
router.put('/trip/:tripID', async (req, res) => {
    try {
        const { tripID } = req.params;
        const { Depature, Destination, departureTime, arrivalTime, employee, LicensePlate, BasePrice } = req.body;

        // Validate input
        if (!Depature || !Destination || !departureTime || !arrivalTime || !employee || !LicensePlate || !BasePrice) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        // Step 1: Get RouteID from Depature, Destination and BasePrice
        const routeQuery = `SELECT RouteID FROM ROUTE WHERE Depature = @Depature AND Destination = @Destination AND BasePrice = @BasePrice`;
        const routeResult = await pool.request()
            .input('Depature', sql.NVarChar, Depature)
            .input('Destination', sql.NVarChar, Destination)
            .input('BasePrice', sql.Float, BasePrice)
            .query(routeQuery);

        if (!routeResult.recordset[0]) {
            console.error("❌ Không tìm thấy tuyến đường:", Depature, "đến", Destination);
            return res.status(404).json({ message: 'Không tìm thấy tuyến đường' });
        }

        const routeID = routeResult.recordset[0].RouteID;
        console.log("✅ RouteID tìm thấy:", routeID);

        // Step 2: Get BusID from LicensePlate
        const busQuery = `SELECT BusID FROM BUS WHERE LicensePlate = @LicensePlate`;
        const busResult = await pool.request()
            .input('LicensePlate', sql.NVarChar, LicensePlate)
            .query(busQuery);

        if (!busResult.recordset[0]) {
            console.error("❌ Không tìm thấy xe với biển số:", LicensePlate);
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        const busID = busResult.recordset[0].BusID;
        console.log("✅ BusID tìm thấy:", busID);

        // Step 3: Get ID_NV from employee name (Ten_NV)
        const employeeQuery = `SELECT ID_NV FROM Employee WHERE Ten_NV = @employee`;
        const employeeResult = await pool.request()
            .input('employee', sql.NVarChar, employee)
            .query(employeeQuery);

        if (!employeeResult.recordset[0]) {
            console.error("❌ Không tìm thấy nhân viên:", employee);
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        const id_nv = employeeResult.recordset[0].ID_NV;
        console.log("✅ ID_NV tìm thấy:", id_nv);

        // Step 4: Update the trip in the TRIP table
        const updateQuery = `
            UPDATE Trip
            SET RouteID = @routeID,
                BusID = @busID,
                ID_NV = @id_nv,
                DepartureTime = @departureTime,
                ArrivalTime = @arrivalTime
            WHERE TripID = @tripID
        `;

        await pool.request()
            .input('tripID', sql.VarChar, tripID)
            .input('routeID', sql.VarChar, routeID)
            .input('busID', sql.VarChar, busID)
            .input('id_nv', sql.VarChar, id_nv)
            .input('departureTime', sql.DateTime, new Date(departureTime))
            .input('arrivalTime', sql.DateTime, new Date(arrivalTime))
            .query(updateQuery);

        res.status(200).json({ success: true, message: 'Cập nhật chuyến đi thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// API to delete a trip
router.delete('/trip/:tripID', async (req, res) => {
    try {
        const { tripID } = req.params;

        const pool = await poolPromise;

        if (!pool) {
            console.error("❌ Không thể kết nối đến database");
            return res.status(500).json({ message: 'Không thể kết nối đến database' });
        }

        const deleteQuery = `DELETE FROM Trip WHERE TripID = @tripID`;
        await pool.request()
            .input('tripID', sql.VarChar, tripID)
            .query(deleteQuery);

        res.status(200).json({ message: 'Xóa chuyến đi thành công!' });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;