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
const authRoutes = require("./BackEnd/Controller/LoginController");
app.use("/api/auth", authRoutes);

// Cấu hình phục vụ file tĩnh
app.use('/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/DUAN_XEVUI/FrontEnd', express.static(path.join(__dirname, 'FrontEnd')));
app.use('/HinhAnh', express.static(path.join(__dirname, 'FrontEnd/HinhAnh')));

// Nếu truy cập `/DUAN_XEVUI`, trả về file HTML
app.get('/DUAN_XEVUI', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route để xử lý tất cả các yêu cầu khác và trả về index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Chạy server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});