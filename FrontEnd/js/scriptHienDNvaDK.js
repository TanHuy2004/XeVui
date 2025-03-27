function logoutUser() {
    // Xóa dữ liệu đăng nhập
    localStorage.removeItem("loggedInUser");

    // Hiển thị lại nút đăng nhập và đăng ký
    document.querySelectorAll(".btn_Login").forEach(btn => btn.style.display = "inline-block");

    // Ẩn phần user-info
    document.getElementById("userinfo").style.display = "none";

    // Tải lại trang để cập nhật giao diện
    location.reload();
}

function loginUser(username) {
    localStorage.setItem("loggedInUser", username);
    
    // Hiển thị thông tin user
    document.getElementById("hammenu").style.display = "block";
    document.getElementById("userinfo").style.display = "flex";
    document.getElementById("usernameDisplay").textContent = username;
    
    // Hiển thị các mục Trang chủ, Đặt vé, Tin tức
    document.querySelectorAll(".navigation a").forEach(link => {
        link.style.display = "inline";
    });
    // Ẩn form đăng nhập
    hideLogin();
}

function showUser(username) {
    const userInfo = document.getElementById("userinfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginButton = document.querySelector(".btn_Login");
    const registerButton = document.querySelectorAll(".btn_Login")[1];
    const hamMenu = document.getElementById("hammenu");

    hamMenu.style.display = "block"; // Hiển thị menu
    userInfo.style.display = "flex"; // Hiển thị user info
    usernameDisplay.textContent = username; // Gán tên người dùng
    loginButton.style.display = "none"; // Ẩn nút đăng nhập
    registerButton.style.display = "none"; // Ẩn nút đăng ký
}
