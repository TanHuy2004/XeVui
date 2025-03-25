document.getElementById("loginFormElement").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn form gửi đi nếu có lỗi

    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value.trim();
    let hasError = false;

    // Xóa thông báo lỗi cũ
    document.getElementById("loginUsernameError").textContent = "";
    document.getElementById("loginPasswordError").textContent = "";

    // Kiểm tra lỗi
    if (username === "") {
        document.getElementById("loginUsernameError").textContent = "Vui lòng nhập tên đăng nhập!";
        hasError = true;
    }
    if (password === "") {
        document.getElementById("loginPasswordError").textContent = "Vui lòng nhập mật khẩu!";
        hasError = true;
    }

    // Nếu không có lỗi, gửi form
    if (!hasError) {
        try {
            const response = await fetch("http://localhost:9999/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById("loginSuccessMessage").textContent = result.message;
            } else {
                const errorResult = await response.json();
                document.getElementById("loginErrorMessage").textContent = errorResult.message || "Vui lòng thử lại.";
            }
        } catch (error) {
            document.getElementById("loginErrorMessage").textContent = "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.";
        }
    }
});

document.getElementById("registerFormElement").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn form gửi đi nếu có lỗi

    let username = document.getElementById("registerUsername").value.trim();
    let password = document.getElementById("registerPassword").value.trim();
    let email = document.getElementById("registerEmail").value.trim();
    let hasError = false;

    // Xóa thông báo lỗi cũ
    document.getElementById("registerUsernameError").textContent = "";
    document.getElementById("registerPasswordError").textContent = "";
    document.getElementById("registerEmailError").textContent = "";

    // Kiểm tra lỗi
    if (username === "") {
        document.getElementById("registerUsernameError").textContent = "Vui lòng nhập tên đăng nhập!";
        hasError = true;
    }
    if (password.length < 6) {
        document.getElementById("registerPasswordError").textContent = "Mật khẩu phải có ít nhất 6 ký tự!";
        hasError = true;
    }
    if (!email.includes("@")) {
        document.getElementById("registerEmailError").textContent = "Email không hợp lệ!";
        hasError = true;
    }

    // Nếu không có lỗi, gửi form
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
            } else {
                const errorResult = await response.json();
                document.getElementById("registerErrorMessage").textContent = errorResult.message || "Vui lòng thử lại.";
            }
        } catch (error) {
            document.getElementById("registerErrorMessage").textContent = "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.";
        }
    }
});