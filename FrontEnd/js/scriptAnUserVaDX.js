document.addEventListener("DOMContentLoaded", function () {
    let loggedInUser = localStorage.getItem("loggedInUser");
    const userInfo = document.getElementById("userinfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginButton = document.querySelector(".btn_Login");
    const registerButton = document.querySelectorAll(".btn_Login")[1];
    const hamMenu = document.getElementById("hammenu");

    const trangChuLink = document.querySelector(".navigation a:nth-child(1)");
    const datVeLink = document.querySelector(".navigation a:nth-child(2)");
    const tinTucLink = document.querySelector(".navigation a:nth-child(3)");

    if (loggedInUser) {
        userInfo.style.display = "flex";
        usernameDisplay.textContent = loggedInUser;
        loginButton.style.display = "none";
        registerButton.style.display = "none";

        // Hiển thị các mục
        trangChuLink.style.display = "inline";
        datVeLink.style.display = "inline";
        tinTucLink.style.display = "inline";
    } else {
        userInfo.style.display = "none";
        hamMenu.style.display = "none";
        // Ẩn các mục khi chưa đăng nhập
        trangChuLink.style.display = "none";
        datVeLink.style.display = "none";
        tinTucLink.style.display = "none";
    }
});

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("userinfo").style.display = "none";
    document.querySelector(".btn_Login").style.display = "block";
    document.querySelectorAll(".btn_Login")[1].style.display = "block";
    document.getElementById("hammenu").style.display = "none";

    // Ẩn trang chủ, đặt vé và tin tức sau khi đăng xuất
    document.querySelector(".navigation a:nth-child(1)").style.display = "none";
    document.querySelector(".navigation a:nth-child(2)").style.display = "none";
    document.querySelector(".navigation a:nth-child(3)").style.display = "none";
    window.location.href = "/DUAN_XEVUI/index.html"; 
}
