function loginUser(username) {
    localStorage.setItem("loggedInUser", username);
    
    // Hiển thị thông tin user
    document.getElementById("userinfo").style.display = "flex";
    document.getElementById("usernameDisplay").textContent = username;
    
    // Hiển thị các mục Trang chủ, Đặt vé
    document.querySelectorAll(".navigation a").forEach(link => {
        link.style.display = "inline";
    });
    // Ẩn form đăng nhập
    hideLogin();
    // Sau khi đăng nhập thành công
    window.location.reload();
}

function showUser(username) {
    const userInfo = document.getElementById("userinfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginButton = document.querySelector(".btn_Login");
    const registerButton = document.querySelectorAll(".btn_Login")[1];
    const heThongDropdown = document.getElementById("heThongDropdown"); // Thêm biến cho dropdown Hệ thống

    userInfo.style.display = "flex"; // Hiển thị user info
    usernameDisplay.textContent = username; // Gán tên người dùng
    loginButton.style.display = "none"; // Ẩn nút đăng nhập
    registerButton.style.display = "none"; // Ẩn nút đăng ký
    heThongDropdown.style.display = "block";
}
