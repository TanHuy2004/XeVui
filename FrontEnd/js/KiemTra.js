// Kiểm tra vai trò người dùng và ẩn/hiện các phần tử giao diện
document.addEventListener("DOMContentLoaded", function () {
    const userInfo = JSON.parse(localStorage.getItem("user"));

    if (userInfo) {
        const role = userInfo.role;

        if (role === "admin") {
            // Ẩn nút "Đặt vé"
            document.querySelector('a[onclick="showDatVe()"]').style.display = "none";
        } else if (role === "user") {
            // Ẩn menu "Hệ thống"
            document.getElementById("heThongDropdown").style.display = "none";
        }
    }
});