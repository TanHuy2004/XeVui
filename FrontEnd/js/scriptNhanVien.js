document.addEventListener("DOMContentLoaded", function () {
    const employeeForm = document.getElementById("employeeFormElement");

    if (employeeForm) {
        employeeForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const actionType = event.submitter ? event.submitter.name : ""; // Xác định nút bấm
            console.log("🛠 Hành động được chọn:", actionType);

            let employeeID = document.getElementById("NVemployeeID").value.trim();
            let employeeName = document.getElementById("NVemployeeName").value.trim();
            let employeeRole = document.getElementById("NVemployeeRole").value.trim();
            let employeePhone = document.getElementById("NVemployeePhone").value.trim();
            let hasError = false;

            // Xóa thông báo lỗi trước đó
            document.getElementById("employeeIDError").textContent = "";
            document.getElementById("nameError").textContent = "";
            document.getElementById("roleError").textContent = "";
            document.getElementById("phoneError").textContent = "";
            document.getElementById("employeeSuccessMessage").textContent = "";
            document.getElementById("employeeErrorMessage").textContent = "";

            // Kiểm tra dữ liệu nhập
            if (employeeID === "" || employeeID.length !== 5) {
                document.getElementById("employeeIDError").textContent = "Mã nhân viên phải có đúng 5 ký tự!";
                hasError = true;
            }

            if (actionType !== "xoa") { // Chỉ kiểm tra các trường khác nếu không phải hành động xóa
                if (employeeName === "") {
                    document.getElementById("nameError").textContent = "Vui lòng nhập tên nhân viên!";
                    hasError = true;
                }
                if (employeeRole === "") {
                    document.getElementById("roleError").textContent = "Vui lòng nhập chức vụ!";
                    hasError = true;
                }
                if (!/^\d{10,11}$/.test(employeePhone)) { // Kiểm tra SDT có 10 hoặc 11 số
                    document.getElementById("phoneError").textContent = "Số điện thoại phải có 10 hoặc 11 chữ số!";
                    hasError = true;
                }
            }

            if (!hasError) {
                try {
                    let url = "/api/nhanvien/employee";
                    let method = "";
                    let bodyData = {};

                    // Xử lý từng hành động
                    if (actionType === "them") {
                        method = "POST";
                        bodyData = { employeeID, employeeName, employeeRole, employeePhone };
                    } else if (actionType === "sua") {
                        method = "PUT";
                        bodyData = { employeeID, employeeName, employeeRole, employeePhone };
                    } else if (actionType === "xoa") {
                        if (employeeID === "" || employeeID.length !== 5) {
                            document.getElementById("employeeIDError").textContent = "Mã nhân viên phải có đúng 5 ký tự!";
                            hasError = true; // Mark as error to prevent further execution
                        }
                        if (!hasError) {
                            method = "DELETE";
                            url = `/api/nhanvien/employee/${employeeID}`; // Đưa employeeID vào URL
                            bodyData = null; // Xóa body vì DELETE không cần
                        }
                    }
                    
                    const response = await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: bodyData ? JSON.stringify(bodyData) : null, // Chỉ gửi body nếu không phải DELETE
                    });
                    
                    
                    const result = await response.json(); // Lấy dữ liệu từ phản hồi

                    if (!response.ok) {
                        if (response.status === 409) {
                            if (result.field === "employeeID") {
                                document.getElementById("employeeIDError").textContent = "Mã nhân viên đã tồn tại!";
                            } else if (result.field === "employeePhone") {
                                document.getElementById("phoneError").textContent = "Số điện thoại đã tồn tại!";
                            }
                        } else if (response.status === 404 && actionType === "sua") {
                            document.getElementById("employeeIDError").textContent = "Mã nhân viên không tồn tại!";
                        } else if (response.status === 404 && actionType === "xoa") {
                            document.getElementById("employeeIDError").textContent = "Không tìm thấy mã nhân viên để xóa!";
                        } else {
                            document.getElementById("employeeErrorMessage").textContent = result.message || "Có lỗi xảy ra. Vui lòng thử lại.";
                        }
                        return;
                    }

                    document.getElementById("employeeSuccessMessage").textContent = result.message;
                    if (actionType === "them" || actionType === "sua") {
                        document.getElementById("NVemployeeID").value = "";
                        document.getElementById("NVemployeeName").value = "";
                        document.getElementById("NVemployeeRole").value = "";
                        document.getElementById("NVemployeePhone").value = "";
                    }
                    if (actionType === "xoa") {
                        document.getElementById("employeeSuccessMessage").textContent = "Xóa nhân viên thành công!";
                        document.getElementById("NVemployeeID").value = "";
                    }
                } catch (error) {
                    console.error("Lỗi:", error);
                }
            }
        });
    } else {
        console.warn('Element with id "employeeFormElement" not found. Employee functionality will not work.');
    }
});

