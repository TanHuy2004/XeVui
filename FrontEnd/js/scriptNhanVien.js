document.addEventListener("DOMContentLoaded", function () {
    const employeeForm = document.getElementById("employeeFormElement");
    const tableBody = document.getElementById("employeeTableBody");
    
    async function loadEmployees() {
        tableBody.innerHTML = "";
        try {
            const response = await fetch("http://localhost:9999/api/nhanvien/employee");
            if (!response.ok) throw new Error("Không thể tải dữ liệu");
            const employees = await response.json();
    
            if (employees.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">Chưa có dữ liệu nhân viên nào!!!</td></tr>`;
            } else {
                employees.forEach(emp => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${emp.employeeID}</td>
                        <td>${emp.employeeName}</td>
                        <td>${emp.employeeRole}</td>
                        <td>${emp.employeePhone}</td>
                        <td>
                            <button class="edit-btn" onclick="editEmployee('${emp.employeeID}', '${emp.employeeName}', '${emp.employeeRole}', '${emp.employeePhone}')">Sửa</button>
                            <button class="delete-btn" onclick="deleteEmployee('${emp.employeeID}')">Xóa</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu nhân viên:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Lỗi khi tải dữ liệu nhân viên. Vui lòng thử lại sau.</td></tr>`;
        }
    }

    employeeForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const formData = new FormData(employeeForm);
        const employee = {
            employeeID: formData.get("employeeID").trim(),
            employeeName: formData.get("employeeName").trim(),
            employeeRole: formData.get("employeeRole").trim(),
            employeePhone: formData.get("employeePhone").trim()
        };
    
        // Xóa thông báo lỗi trước đó
        document.getElementById("errorID").textContent = "";
        document.getElementById("errorName").textContent = "";
        document.getElementById("errorRole").textContent = "";
        document.getElementById("errorPhone").textContent = "";
        document.getElementById("employeeSuccessMessage").textContent = "";
        document.getElementById("employeeErrorMessage").textContent = "";
    
        let hasError = false;
    
        // Kiểm tra nếu có trường nào trống
        if (!employee.employeeID) {
            document.getElementById("errorID").textContent = "Hãy nhập mã nhân viên!";
            hasError = true;
        } else if (employee.employeeID.length !== 5) {
            document.getElementById("errorID").textContent = "Mã nhân viên phải có 5 ký tự!";
            hasError = true;
        }
        
        if (!employee.employeeName) {
            document.getElementById("errorName").textContent = "Hãy nhập họ và tên!";
            hasError = true;
        }
        if (!employee.employeeRole) {
            document.getElementById("errorRole").textContent = "Hãy nhập chức vụ!";
            hasError = true;
        }
        if (!employee.employeePhone) {
            document.getElementById("errorPhone").textContent = "Hãy nhập số điện thoại!";
            hasError = true;
        } else if (!/^\d{10,11}$/.test(employee.employeePhone)) {
            document.getElementById("errorPhone").textContent = "Số điện thoại phải có 10 hoặc 11 chữ số!";
            hasError = true;
        }
    
        if (hasError) return;
    
        const submitType = event.submitter.name;
        let url = "http://localhost:9999/api/nhanvien/employee";
        let method = "POST";
        
        if (submitType === "sua") {
            method = "PUT";
        } else {
            // Kiểm tra ID và số điện thoại tồn tại
            try {
                // Gửi yêu cầu GET tới /employee để kiểm tra dữ liệu
                const response = await fetch('http://localhost:9999/api/nhanvien/employee');
                if (!response.ok) {
                    console.error("❌ Lỗi khi tải danh sách nhân viên");
                    document.getElementById("employeeErrorMessage").textContent = "Không thể kiểm tra dữ liệu, vui lòng thử lại sau.";
                    return;
                }
                const employees = await response.json();
                
                // Kiểm tra xem mã nhân viên và số điện thoại đã tồn tại trong danh sách nhân viên
                const employeeExists = employees.some(emp => emp.employeeID === employee.employeeID);
                const phoneExists = employees.some(emp => emp.employeePhone === employee.employeePhone);
    
                if (employeeExists) {
                    document.getElementById("errorID").textContent = "Mã nhân viên đã tồn tại!";
                    hasError = true;
                }
                if (phoneExists) {
                    document.getElementById("errorPhone").textContent = "Số điện thoại đã tồn tại!";
                    hasError = true;
                }
    
                if (hasError) return;
            } catch (error) {
                console.error("❌ Lỗi kiểm tra dữ liệu:", error);
                document.getElementById("employeeErrorMessage").textContent = "Không thể kiểm tra dữ liệu, vui lòng thử lại sau.";
                return;
            }
        }
    
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employee)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                document.getElementById("employeeSuccessMessage").textContent = result.message || "Thao tác thành công!";
                employeeForm.reset();
                loadEmployees();
            } else {
                document.getElementById("employeeErrorMessage").textContent = result.message || "Có lỗi xảy ra, vui lòng thử lại.";
            }
        } catch (error) {
            console.error("❌ Lỗi gửi dữ liệu:", error);
            document.getElementById("employeeErrorMessage").textContent = "Có lỗi xảy ra khi gửi dữ liệu!";
        }
    });
    

    window.deleteEmployee = async function (employeeID) {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;
        
        try {
            const response = await fetch(`http://localhost:9999/api/nhanvien/employee/${employeeID}`, {
                method: "DELETE"
            });
            
            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadEmployees();
            }
        } catch (error) {
            console.error("❌ Lỗi xóa nhân viên:", error);
        }
    };

    window.editEmployee = function (id, name, role, phone) {
        document.getElementById("NVemployeeID").value = id;
        document.getElementById("NVemployeeName").value = name;
        document.getElementById("NVemployeeRole").value = role;
        document.getElementById("NVemployeePhone").value = phone;
    };
    
    loadEmployees();
});