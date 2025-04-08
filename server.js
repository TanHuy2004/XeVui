const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const khachHangRoutes = require("./BackEnd/Controller/KhachHangController");
const nhanVienRoutes = require("./BackEnd/Controller/NhanVienController");
const authRoutes = require("./BackEnd/Controller/LoginController");
const quenMKRoutes = require("./BackEnd/Controller/QuenMKController");
const nhaxeRoutes = require("./BackEnd/Controller/NhaXeController");
const selectTenXeCTYRoutes = require("./BackEnd/Controller/SelectTenXeCTYController");
const xeRoutes = require("./BackEnd/Controller/XeController");

// Register routes with unique prefixes to avoid conflicts
app.use("/api/auth", authRoutes);
app.use("/api/forgot-password", quenMKRoutes); 
app.use("/api/nhanvien", nhanVienRoutes); 
app.use("/api/khachhang", khachHangRoutes);
app.use("/api/nhaxe",nhaxeRoutes );
app.use("/api/selectTenXeCTY", selectTenXeCTYRoutes); 
app.use("/api/xe", xeRoutes); 

// Serve static files
app.use('/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/XEVUI-MAIN/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/HinhAnh', express.static(path.join(__dirname, 'FrontEnd/HinhAnh')));


app.get('/XEVUI-MAIN', (req, res) => {
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