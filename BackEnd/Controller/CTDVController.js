const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.get('/ctdatve/:tripId', async (req, res) => {
    try {
      const pool = await poolPromise;
      const tripId = req.params.tripId;
        console.log("TripID received:", tripId);

  
      const result = await pool.request()
        .input('TripID', sql.VarChar, tripId)
        .query(`
          SELECT r.Depature, r.Destination, t.DepartureTime, t.ArrivalTime, b.SeatCapacity, r.BasePrice
          FROM TRIP t
          JOIN ROUTE r ON t.RouteID = r.RouteID
          JOIN BUS b ON t.BusID = b.BusID
          WHERE t.TripID = @TripID
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy chuyến đi' });
      }
  
      const trip = result.recordset[0];
      res.json(trip);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });
  
  module.exports = router;