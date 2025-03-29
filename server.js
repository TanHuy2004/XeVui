const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const nhanVienRoutes = require("./BackEnd/Controller/NhanVienController");
const authRoutes = require("./BackEnd/Controller/LoginController");
const quenMKRoutes = require("./BackEnd/Controller/QuenMKController");

// Register routes with unique prefixes to avoid conflicts
app.use("/api/auth", authRoutes);
app.use("/api/forgot-password", quenMKRoutes); // Changed prefix to avoid conflict
app.use("/api/nhanvien", nhanVienRoutes); // Changed prefix to match frontend

// Serve static files
app.use('/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/DUAN_XEVUI/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/HinhAnh', express.static(path.join(__dirname, 'FrontEnd/HinhAnh')));

// Serve index.html for `/DUAN_XEVUI`
app.get('/DUAN_XEVUI', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route to handle all other requests and return index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});