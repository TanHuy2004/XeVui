document.addEventListener("DOMContentLoaded", function () {
    const customerForm = document.getElementById("customerFormElement");
    const tableBody = document.getElementById("customerTableBody");

    async function loadCustomers() {
        tableBody.innerHTML = "";
        try {
            const response = await fetch("http://localhost:9999/api/khachhang/customer");
            if (!response.ok) throw new Error("Không thể tải dữ liệu");
            const customers = await response.json();
            
            if (customers.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">Chưa có dữ liệu khách hàng nào!!!</td></tr>`;
            } else {
                customers.forEach(emp => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${emp.customerID}</td>
                        <td>${emp.customerName}</td>
                        <td>${emp.customerPhone}</td>
                        <td>${emp.customerEmail}</td>
                        <td>${emp.customerAddress}</td>
                        <td>
                            <button class="edit-btn" onclick="editCustomer('${emp.customerID}', '${emp.customerName}', '${emp.customerPhone}', '${emp.customerEmail}', '${emp.customerAddress}')">Sửa</button>
                            <button class="delete-btn" onclick="deleteCustomer('${emp.customerID}')">Xóa</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu khách hàng:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Chưa có dữ liệu khách hàng nào!!!</td></tr>`;
        }
    }

   customerForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const formData = new FormData(customerForm);
        const customer = {
            customerID: formData.get("customerID").trim(),
            customerName: formData.get("customerName").trim(),
            customerPhone: formData.get("customerPhone").trim(),
            customerEmail: formData.get("customerEmail").trim(),
            customerAddress: formData.get("customerAddress").trim()
        };
    
        // Xóa thông báo lỗi trước đó
        document.getElementById("errorID").textContent = "";
        document.getElementById("errorName").textContent = "";
        document.getElementById("errorPhone").textContent = "";
        document.getElementById("errorEmail").textContent = "";
        document.getElementById("errorAddress").textContent = "";
        document.getElementById("customerSuccessMessage").textContent = "";
        document.getElementById("customerErrorMessage").textContent = "";
    
        let hasError = false;

        // Kiểm tra nếu có trường nào trống
        if (!customer.customerID) {
            document.getElementById("errorID").textContent = "Hãy nhập mã nhân viên!";
            hasError = true;
        } else if (customer.customerID.length !== 5) {
            document.getElementById("errorID").textContent = "Mã nhân viên phải có 5 ký tự!";
            hasError = true;
        }
        
        if (!customer.customerName) {
            document.getElementById("errorName").textContent = "Hãy nhập họ và tên!";
            hasError = true;
        }
        if (!customer.customerEmail) {
            document.getElementById("errorEmail").textContent = "Hãy nhập email!";
            hasError = true;
        }
        if (!customer.customerPhone) {
            document.getElementById("errorPhone").textContent = "Hãy nhập số điện thoại!";
            hasError = true;
        } else if (!/^\d{10,11}$/.test(customer.customerPhone)) {
            document.getElementById("errorPhone").textContent = "Số điện thoại phải có 10 hoặc 11 chữ số!";
            hasError = true;
        }
        if (!customer.customerAddress) {
            document.getElementById("errorAddress").textContent = "Hãy nhập địa chỉ!";
            hasError = true;
        }
    
        if (hasError) return;
    
        const submitType = event.submitter.name;
        let url = "http://localhost:9999/api/khachhang/customer";
        let method = "POST";
        
        if (submitType === "sua") {
            method = "PUT";
        } else {
            // Kiểm tra ID và số điện thoại tồn tại
try {
    // Gửi yêu cầu GET tới để kiểm tra dữ liệu
    const response = await fetch('http://localhost:9999/api/khachhang/customer');
    if (!response.ok) {
        console.error("❌ Lỗi khi tải danh sách khách hàng");
        document.getElementById("customerErrorMessage").textContent = "Không thể kiểm tra dữ liệu, vui lòng thử lại sau.";
        return;
    }
    const customers = await response.json();

    // Kiểm tra nếu có khách hàng trùng ID, số điện thoại hoặc email
    const customerExists = customers.some(emp => emp.customerID === customer.customerID);
    const phoneExists = customers.some(emp => emp.customerPhone === customer.customerPhone);
    const emailExists = customers.some(emp => emp.customerEmail === customer.customerEmail);

    if (customerExists) {
        document.getElementById("errorID").textContent = "Mã khách hàng đã tồn tại!";
        hasError = true;
    }
    if (phoneExists) {
        document.getElementById("errorPhone").textContent = "Số điện thoại đã tồn tại!";
        hasError = true;
    }
    if (emailExists) {
        document.getElementById("errorEmail").textContent = "Email đã tồn tại!";
        hasError = true;
    }

    if (hasError) return;
} catch (error) {
    console.error("❌ Lỗi kiểm tra dữ liệu:", error);
    document.getElementById("customerErrorMessage").textContent = "Không thể kiểm tra dữ liệu, vui lòng thử lại sau.";
    return;
}

        }
    
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customer)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                document.getElementById("customerSuccessMessage").textContent = result.message || "Thao tác thành công!";
                customerForm.reset();
                loadCustomers();
            } else {
                document.getElementById("customerErrorMessage").textContent = result.message || "Có lỗi xảy ra, vui lòng thử lại.";
            }
        } catch (error) {
            console.error("❌ Lỗi gửi dữ liệu:", error);
            document.getElementById("customerErrorMessage").textContent = "Có lỗi xảy ra khi gửi dữ liệu!";
        }
    });
    

    window.deleteCustomer = async function (customerID) {
        if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) return;
        
        try {
            const response = await fetch(`http://localhost:9999/api/khachhang/customer/${customerID}`, {
                method: "DELETE"
            });
            
            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadCustomers();
            }
        } catch (error) {
            console.error("❌ Lỗi xóa khách hàng:", error);
        }
    };

    window.editCustomer = function (id, name, phone, email, address) {
        document.getElementById("KHcustomerID").value = id;
        document.getElementById("KHcustomerName").value = name;
        document.getElementById("KHcustomerPhone").value = phone;
        document.getElementById("KHcustomerEmail").value = email;
        document.getElementById("KHcustomerAddress").value = address;
    };
    
    loadCustomers(); // Gọi hàm loadCustomers để tải danh sách khách hàng
});