document.addEventListener("DOMContentLoaded", function () {
    let loggedInUser = localStorage.getItem("loggedInUser");
    const userInfo = document.getElementById("userinfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginButton = document.querySelector(".btn_Login");
    const registerButton = document.querySelectorAll(".btn_Login")[1];
    const trangChuLink = document.querySelector(".navigation a:nth-child(1)");
    const datVeLink = document.querySelector(".navigation a:nth-child(2)");
    const heThongDropdown = document.getElementById("heThongDropdown"); // Thêm biến cho dropdown Hệ thống

    if (loggedInUser) {
        userInfo.style.display = "flex";
        usernameDisplay.textContent = loggedInUser;
        loginButton.style.display = "none";
        registerButton.style.display = "none";

        // Hiển thị các mục
        trangChuLink.style.display = "inline";
        datVeLink.style.display = "inline";
    } else {
        userInfo.style.display = "none";
        // Ẩn các mục khi chưa đăng nhập
        trangChuLink.style.display = "none";
        datVeLink.style.display = "none";
        heThongDropdown.style.display = "none"; // Ẩn dropdown Hệ thống
    }
});

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("userinfo").style.display = "none";
    document.querySelector(".btn_Login").style.display = "block";
    document.querySelectorAll(".btn_Login")[1].style.display = "block";

    // Ẩn trang chủ, đặt vé  sau khi đăng xuất
    document.querySelector(".navigation a:nth-child(1)").style.display = "none";
    document.querySelector(".navigation a:nth-child(2)").style.display = "none";

    // Redirect to the homepage using a relative path
    window.location.href = "/XEVUI-Main";
    applyRoleBasedAccess();
}
