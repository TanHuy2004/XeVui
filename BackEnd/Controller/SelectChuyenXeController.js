const express = require('express');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

router.use(express.json());

// Get departure points and destinations from Route table
router.get('/routes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT RouteID, Depature, Destination, BasePrice 
            FROM Route 
            WHERE Depature IS NOT NULL AND Destination IS NOT NULL
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

// Get employee names from Employee table
router.get('/employees', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT ID_NV, Ten_NV FROM Employee');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get license plates from Bus table
router.get('/buses', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT BusID, LicensePlate FROM Bus');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;