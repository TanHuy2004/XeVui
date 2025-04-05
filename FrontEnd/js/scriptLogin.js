document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginFormElement");
    const registerForm = document.getElementById("registerFormElement");

    if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        let username = document.getElementById("loginUsername").value.trim();
        let password = document.getElementById("loginPassword").value.trim();
        let hasError = false;

        document.getElementById("loginUsernameError").textContent = "";
        document.getElementById("loginPasswordError").textContent = "";
        document.getElementById("loginSuccessMessage").textContent = "";
        document.getElementById("loginErrorMessage").textContent = "";

        if (username === "") {
            document.getElementById("loginUsernameError").textContent = "Vui lòng nhập tên đăng nhập!";
            hasError = true;
        }
        if (password === "") {
            document.getElementById("loginPasswordError").textContent = "Vui lòng nhập mật khẩu!";
            hasError = true;
        }

        if (!hasError) {
            try {
                const response = await fetch("http://localhost:9999/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Lưu thông tin người dùng và vai trò vào localStorage
                    localStorage.setItem('user', JSON.stringify({
                        username: result.username,
                        role: result.role || 'user', // Nếu role là NULL, mặc định là 'user'
                    }));

                    document.getElementById("loginSuccessMessage").textContent = result.message;

                    // Ẩn form đăng nhập & hiển thị trang chủ
                    hideLogin();

                    // Gọi hàm hiển thị trang chủ
                    showUser(username);

                    // Hiển thị user và ẩn đăng nhập/đăng ký
                    loginUser(username);

                } else {
                    document.getElementById("loginErrorMessage").textContent = result.message || "Vui lòng thử lại.";
                }
            } catch (error) {
                document.getElementById("loginErrorMessage").textContent = "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.";
                console.error("Lỗi:", error);
            }
        }
  });
    } else {
        console.warn('Element with id "registerFormElement" not found. Register functionality will not work.');
    }

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        let username = document.getElementById("registerUsername").value.trim();
        let password = document.getElementById("registerPassword").value.trim();
        let email = document.getElementById("registerEmail").value.trim();
        let hasError = false;

        document.getElementById("registerUsernameError").textContent = "";
        document.getElementById("registerPasswordError").textContent = "";
        document.getElementById("registerEmailError").textContent = "";
        document.getElementById("registerSuccessMessage").textContent = "";
        document.getElementById("registerErrorMessage").textContent = "";

        if (username === "") {
            document.getElementById("registerUsernameError").textContent = "Vui lòng nhập tên đăng nhập!";
            hasError = true;
        }
        if (password.length < 6) {
            document.getElementById("registerPasswordError").textContent = "Mật khẩu phải có ít nhất 6 ký tự!";
            hasError = true;
        }
        if (!email.includes("@")) {
            document.getElementById("registerEmailError").textContent = "Vui lòng nhập Email hợp lệ!";
            hasError = true;
        }

        if (!hasError) {
            try {
                const response = await fetch("http://localhost:9999/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email }),
                });

                if (response.ok) {
                    const result = await response.json();
                    document.getElementById("registerSuccessMessage").textContent = result.message;
                    showLogin();
                    hideRegister();
                } else {
                    const errorResult = await response.json();
                    document.getElementById("registerErrorMessage").textContent = errorResult.message || "Vui lòng thử lại.";
                }
            } catch (error) {
                document.getElementById("registerErrorMessage").textContent = "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.";
                console.error("Lỗi:", error);
            }
        }
    });
} else {
    console.warn('Element with id "registerFormElement" not found. Register functionality will not work.');
}
});