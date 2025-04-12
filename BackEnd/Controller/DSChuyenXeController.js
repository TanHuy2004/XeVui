const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db'); // Đảm bảo đường dẫn đúng

router.use(express.json());

router.get('/dstrip', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Không thể kết nối đến database' });
        }

        const { departure, destination, travelDate } = req.query;

        let query = `
            SELECT t.TripID, t.DepartureTime, t.ArrivalTime, 
                   r.Depature, r.Destination, r.BasePrice,
                   b.SeatCapacity
            FROM Trip t
            JOIN Route r ON t.RouteID = r.RouteID
            JOIN Bus b ON t.BusID = b.BusID
            WHERE 1 = 1
        `;

        if (departure) {
            query += ` AND r.Depature = @departure`;
        }
        if (destination) {
            query += ` AND r.Destination = @destination`;
        }
        if (travelDate) {
            query += ` AND CAST(t.DepartureTime AS DATE) = @travelDate`;
        }

        const request = pool.request();
        if (departure) request.input('departure', sql.NVarChar, departure);
        if (destination) request.input('destination', sql.NVarChar, destination);
        if (travelDate) request.input('travelDate', sql.Date, travelDate);

        const result = await request.query(query);

        const trips = result.recordset.map(trip => ({
            TripID: trip.TripID,
            DepartureTime: trip.DepartureTime,
            ArrivalTime: trip.ArrivalTime,
            Depature: trip.Depature,
            Destination: trip.Destination,
            BasePrice: trip.BasePrice,
            SeatCapacity: trip.SeatCapacity
        }));

        res.status(200).json({ success: true, data: trips });

    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});



module.exports = router; // Xuất router